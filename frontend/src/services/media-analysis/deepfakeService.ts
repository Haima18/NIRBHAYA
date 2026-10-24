/**
 * Deepfake Detective service.
 *
 * Media is sent only to NIRBHAYA's own Flask endpoint for container/EXIF
 * inspection. No third-party detector is called. The report explicitly says
 * authenticity was not determined; this module must never invent a verdict.
 */
import { DeepfakeReport } from '@/types';

const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|webp|mp4|webm|mov|mp3|wav)$/i;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4'
]);
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

interface ServerReport {
  fileName: string;
  analyzedAt: string;
  mediaType: 'image' | 'video' | 'audio';
  metadata: DeepfakeReport['metadata'];
  heuristics: DeepfakeReport['heuristics'];
  authenticityStatus: 'not_determined';
  detectorConfigured: boolean;
  method: string;
  disclaimer: string;
  guidance: string[];
}

export const deepfakeService = {
  validateFile(file: File): { isValid: boolean; error?: string } {
    if (!ALLOWED_MIME_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.test(file.name)) {
      return {
        isValid: false,
        error: `Unsupported file type (${file.type || 'unknown'}). Please upload an image, video, or audio file.`
      };
    }
    if (file.size === 0) {
      return { isValid: false, error: 'The selected file is empty.' };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `File size exceeds the 50 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
      };
    }
    return { isValid: true };
  },

  async analyzeMedia(file: File): Promise<DeepfakeReport> {
    const form = new FormData();
    form.append('file', file);

    let response: Response;
    try {
      response = await fetch('/api/deepfake/analyze', {
        method: 'POST',
        credentials: 'include',
        body: form
      });
    } catch {
      throw new Error('The NIRBHAYA inspection service is unavailable. Start the backend and try again.');
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'The inspection service rejected this file.');
    }

    const server = payload as ServerReport;
    return {
      id: `df_report_${Date.now()}`,
      fileName: server.fileName || file.name,
      analyzedAt: server.analyzedAt || new Date().toISOString(),
      mediaType: server.mediaType || 'image',
      metadata: server.metadata,
      heuristics: server.heuristics || [],
      authenticityStatus: 'not_determined',
      detectorConfigured: Boolean(server.detectorConfigured),
      method: server.method,
      disclaimer: server.disclaimer,
      guidance: server.guidance || []
    };
  }
};
