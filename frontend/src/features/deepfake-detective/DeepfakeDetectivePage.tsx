import React, { useState, useRef } from 'react';
import {
  FileSearch,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  FolderLock,
  ExternalLink,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { deepfakeService } from '@/services/media-analysis/deepfakeService';
import { storageService } from '@/services/storage/storageService';
import { DeepfakeReport, IncidentRecord } from '@/types';

export const DeepfakeDetectivePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<DeepfakeReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File) => {
    setErrorMessage(null);
    setReport(null);
    setSavedSuccess(false);

    const validation = deepfakeService.validateFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid file format.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await deepfakeService.analyzeMedia(selectedFile);
      setReport(res);
      storageService.saveDeepfakeReport(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setErrorMessage(`Media analysis failed: ${msg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToEvidence = () => {
    if (!report) return;
    const incident: IncidentRecord = {
      id: `inc_${Date.now()}`,
      title: `Media Examination: ${report.fileName}`,
      category: 'Deepfake / Non-Consensual Media Threat',
      incidentDate: new Date().toISOString().split('T')[0],
      severity: report.authenticityStatus === 'suspicious_artifacts' ? 'high' : 'medium',
      description: `Inspected file "${report.fileName}" (${report.mediaType}, ${(report.metadata.fileSize / 1024).toFixed(1)} KB). Container status: ${report.authenticityStatus}.`,
      notes: `Heuristics logged: ${report.heuristics.length} checks performed. Disclaimer recorded.`,
      attachmentNames: [report.fileName],
      relatedReportId: report.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    storageService.saveIncident(incident);
    setSavedSuccess(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Deepfake Detective — Media Analysis & Extortion Shield
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Inspect media container headers, EXIF metadata, synthetic tool signatures, and access non-consensual imagery takedowns.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Upload & Drag Drop Card */}
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Inspect Image, Video, or Audio
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
            Upload suspicious media you received or suspect was fabricated. Maximum 50MB safe inspection limit.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*,video/*,audio/*"
            onChange={e => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
          />

          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-color-default)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8) var(--space-4)',
              textAlign: 'center',
              backgroundColor: 'var(--bg-app)',
              cursor: 'pointer',
              transition: 'border-color var(--transition-fast)'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-brand-secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: 'var(--color-brand-secondary)' }}>
              <UploadCloud size={24} />
            </div>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {selectedFile ? selectedFile.name : 'Click to select or drag and drop media file'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Supports JPG, PNG, WEBP, MP4, WEBM, MOV, MP3, WAV (Max 50MB)
            </p>
          </div>

          {selectedFile && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>{selectedFile.name}</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Unknown MIME'}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleAnalyze}
                isLoading={isAnalyzing}
                leftIcon={<FileSearch size={18} />}
              >
                Start Forensic Inspection
              </Button>
            </div>
          )}

          {errorMessage && (
            <div style={{ marginTop: '1rem' }}>
              <Alert type="danger" title="Validation Notice">
                {errorMessage}
              </Alert>
            </div>
          )}
        </Card>

        {/* NCII Defense Guidance Card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Shield size={20} color="var(--color-brand-primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
              Non-Consensual Imagery (NCII) Protection
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            If someone threatens to leak intimate photos, or created a non-consensual deepfake of you:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-brand-primary)' }}>1. StopNCII.org (Adults)</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 6px' }}>
                Generates a digital cryptographic hash on your device to prevent uploading across Facebook, Instagram, TikTok, and Reddit.
              </p>
              <a href="https://stopncii.org" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--color-brand-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                Open StopNCII.org <ExternalLink size={12} />
              </a>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-info)' }}>2. National Cyber Crime Helpline (1930)</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 6px' }}>
                Report extortion and deepfakes immediately under Section 67/67A of the Indian Information Technology Act.
              </p>
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--color-info)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                Visit Cyber Crime Portal <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* Forensic Report Output */}
      {report && (
        <Card variant="highlight">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color-default)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
                  Media Inspection Report
                </h2>
                <Badge variant={report.authenticityStatus === 'suspicious_artifacts' ? 'critical' : 'neutral'}>
                  {report.authenticityStatus.replace(/_/g, ' ')}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Target: <strong>{report.fileName}</strong> • Inspected: {new Date(report.analyzedAt).toLocaleString('en-IN')}
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={handleSaveToEvidence}
              leftIcon={<FolderLock size={18} color="var(--color-brand-primary)" />}
            >
              {savedSuccess ? 'Saved to Evidence Vault!' : 'Save Report to Evidence Vault'}
            </Button>
          </div>

          {/* Mandatory Critical Disclaimer */}
          <Alert type="warning" title="Forensic Integrity Notice">
            {report.disclaimer}
          </Alert>

          {/* Container Metadata Breakdown */}
          <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MIME Type:</span>
              <p style={{ fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{report.metadata.mimeType}</p>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>File Size:</span>
              <p style={{ fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{(report.metadata.fileSize / 1024).toFixed(1)} KB</p>
            </div>
            {report.metadata.dimensions && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dimensions:</span>
                <p style={{ fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{report.metadata.dimensions}</p>
              </div>
            )}
            {report.metadata.durationSeconds !== undefined && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration:</span>
                <p style={{ fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{report.metadata.durationSeconds} seconds</p>
              </div>
            )}
          </div>

          {/* Forensic Heuristics Checks */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Forensic Container & Heuristic Tests:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {report.heuristics.map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color-default)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
                    <Badge variant={h.status === 'pass' ? 'success' : h.status === 'warning' ? 'medium' : 'critical'}>
                      {h.status}
                    </Badge>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{h.checkName}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{h.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Guidance */}
          <div style={{ marginTop: '1.5rem', backgroundColor: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Protective Action Protocol:
            </h4>
            <ul style={{ margin: '0 0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {report.guidance.map((g, idx) => (
                <li key={idx}>{g}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};
