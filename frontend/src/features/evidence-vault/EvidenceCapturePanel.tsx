import React, { useEffect, useRef, useState } from 'react';
import { Camera, Download, Square, Trash2, Video } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CapturedMedia, captureStorageService } from '@/services/storage/captureStorageService';
import { useAuth } from '@/hooks/useAuth';

export const EvidenceCapturePanel: React.FC = () => {
  const { user } = useAuth();
  const ownerId = user?.id || 'guest';
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [items, setItems] = useState<CapturedMedia[]>([]);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refreshItems = async () => {
    try {
      setItems(await captureStorageService.list(ownerId));
    } catch (storageError) {
      setError(storageError instanceof Error ? storageError.message : 'Could not load local captures.');
    }
  };

  useEffect(() => {
    void refreshItems();
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      Object.values(objectUrls).forEach(URL.revokeObjectURL);
    };
  }, []);

  useEffect(() => {
    if (previewRef.current && stream) previewRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    const nextUrls = Object.fromEntries(items.map(item => [item.id, URL.createObjectURL(item.blob)]));
    setObjectUrls(nextUrls);
    return () => Object.values(nextUrls).forEach(URL.revokeObjectURL);
  }, [items]);

  const startCamera = async (withAudio: boolean): Promise<MediaStream> => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera capture requires a supported browser and a secure connection (HTTPS or localhost).');
    }
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: withAudio });
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = cameraStream;
    setStream(cameraStream);
    return cameraStream;
  };

  const stopCamera = () => {
    if (recording) recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setStream(null);
  };

  const saveBlob = async (blob: Blob, type: CapturedMedia['type']) => {
    const extension = type === 'photo' ? 'jpg' : (blob.type.split('/')[1]?.split(';')[0] || 'webm');
    const item: CapturedMedia = {
      id: `capture_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ownerId,
      type,
      name: `nirbhaya_${type}_${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`,
      mimeType: blob.type,
      createdAt: new Date().toISOString(),
      blob
    };
    await captureStorageService.save(item);
    await refreshItems();
    setNotice(`${type === 'photo' ? 'Photo' : 'Video'} saved on this device.`);
  };

  const capturePhoto = async () => {
    setBusy(true);
    setError(null);
    try {
      if (!stream) await startCamera(false);
      const video = previewRef.current;
      if (!video || !video.videoWidth || !video.videoHeight) {
        throw new Error('Camera preview is not ready yet. Wait a moment and try again.');
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const photo = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not capture this photo.')), 'image/jpeg', 0.92);
      });
      await saveBlob(photo, 'photo');
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : 'Could not capture photo.');
    } finally {
      setBusy(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    setNotice(null);
    try {
      const cameraStream = await startCamera(true);
      if (!('MediaRecorder' in window)) throw new Error('Video recording is not supported by this browser.');
      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
        .find(candidate => MediaRecorder.isTypeSupported(candidate));
      const recorder = new MediaRecorder(cameraStream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = event => { if (event.data.size > 0) chunks.push(event.data); };
      recorder.onerror = () => setError('Video recording stopped because the browser reported an error.');
      recorder.onstop = () => {
        setRecording(false);
        if (chunks.length > 0) void saveBlob(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }), 'video')
          .catch(saveError => setError(saveError instanceof Error ? saveError.message : 'Could not save this video.'));
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : 'Could not start video recording.');
    }
  };

  const deleteCapture = async (id: string) => {
    try {
      await captureStorageService.delete(id);
      await refreshItems();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this capture.');
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Capture photo or video</h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Camera starts only when you choose. Captures stay in this browser on this device; they are not uploaded or encrypted.
          </p>
        </div>
        {!stream ? (
          <Button variant="outline" onClick={() => void startCamera(false).catch(cameraError => setError(cameraError.message))} leftIcon={<Camera size={16} />}>
            Enable camera
          </Button>
        ) : (
          <Button variant="outline" onClick={stopCamera} leftIcon={<Square size={15} />}>
            Stop camera
          </Button>
        )}
      </div>

      {error && <div style={{ marginTop: '0.75rem' }}><Alert type="warning" title="Capture unavailable">{error}</Alert></div>}
      {notice && <div style={{ marginTop: '0.75rem' }}><Alert type="success" title="Capture saved">{notice}</Alert></div>}

      {stream && (
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(200px, 0.8fr)', gap: '1rem', alignItems: 'start' }}>
          <video ref={previewRef} autoPlay muted playsInline style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', background: '#111', borderRadius: 'var(--radius-md)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Button variant="primary" disabled={busy || recording} onClick={() => void capturePhoto()} leftIcon={<Camera size={16} />}>
              Capture photo
            </Button>
            {recording ? (
              <Button variant="danger" onClick={() => recorderRef.current?.stop()} leftIcon={<Square size={15} />}>
                Stop and save video
              </Button>
            ) : (
              <Button variant="outline" onClick={() => void startRecording()} leftIcon={<Video size={16} />}>
                Start video recording
              </Button>
            )}
            {recording && <span role="status" style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>Recording in progress</span>}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.65rem', fontSize: '0.95rem' }}>Saved captures ({items.length})</h3>
        {items.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem' }}>No photos or videos saved here yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {items.map(item => (
              <div key={item.id} style={{ minWidth: 0, border: '1px solid var(--border-color-default)', borderRadius: 'var(--radius-md)', padding: '0.65rem' }}>
                {item.type === 'photo' ? (
                  <img src={objectUrls[item.id]} alt="Locally saved capture" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', background: '#111', borderRadius: 'var(--radius-sm)' }} />
                ) : (
                  <video src={objectUrls[item.id]} controls playsInline style={{ width: '100%', aspectRatio: '4 / 3', background: '#111', borderRadius: 'var(--radius-sm)' }} />
                )}
                <p style={{ margin: '0.5rem 0', fontSize: '0.74rem', overflowWrap: 'anywhere' }}>{new Date(item.createdAt).toLocaleString()}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={objectUrls[item.id]} download={item.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}><Download size={14} /> Download</a>
                  <button type="button" onClick={() => void deleteCapture(item.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-danger)', fontSize: '0.78rem' }}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};