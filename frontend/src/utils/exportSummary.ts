/**
 * Incident Summary Export Utility
 * Generates clean, printable HTML and downloadable text summaries of evidence records.
 * Prominently includes legal disclaimers distinguishing user logs from judicial affidavits.
 */
import { IncidentRecord } from '@/types';

export function generateIncidentHtmlSummary(incidents: IncidentRecord[]): string {
  const generatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const rows = incidents.map(inc => `
    <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">
        <h3 style="margin: 0; color: #0f172a; font-size: 18px;">${escapeHtml(inc.title)}</h3>
        <span style="background-color: ${getSeverityBg(inc.severity)}; color: ${getSeverityColor(inc.severity)}; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase;">
          ${escapeHtml(inc.severity)} Severity
        </span>
      </div>
      <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Category:</strong> ${escapeHtml(inc.category)}</p>
      <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Incident Date/Time:</strong> ${escapeHtml(inc.incidentDate)}</p>
      ${inc.perpetratorInfo ? `<p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Reported Person/Handle:</strong> ${escapeHtml(inc.perpetratorInfo)}</p>` : ''}
      
      <div style="margin-top: 12px;">
        <strong style="color: #1e293b; font-size: 14px;">Description:</strong>
        <p style="white-space: pre-wrap; background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #f1f5f9; color: #334155; font-size: 14px; margin-top: 4px;">${escapeHtml(inc.description)}</p>
      </div>

      ${inc.pastedText ? `
      <div style="margin-top: 12px;">
        <strong style="color: #1e293b; font-size: 14px;">Preserved Message / Harassing Text:</strong>
        <pre style="white-space: pre-wrap; background: #fff1f2; border: 1px solid #fecdd3; padding: 10px; border-radius: 4px; color: #881337; font-size: 13px; font-family: monospace; margin-top: 4px;">${escapeHtml(inc.pastedText)}</pre>
      </div>` : ''}

      ${inc.notes ? `
      <div style="margin-top: 12px;">
        <strong style="color: #1e293b; font-size: 14px;">Personal Journal Notes:</strong>
        <p style="white-space: pre-wrap; color: #475569; font-size: 14px; margin-top: 4px;">${escapeHtml(inc.notes)}</p>
      </div>` : ''}

      ${inc.attachmentNames && inc.attachmentNames.length > 0 ? `
      <div style="margin-top: 12px;">
        <strong style="color: #1e293b; font-size: 14px;">Logged Attachments (${inc.attachmentNames.length}):</strong>
        <ul style="margin: 4px 0 0 20px; color: #475569; font-size: 13px;">
          ${inc.attachmentNames.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
        </ul>
      </div>` : ''}

      <div style="margin-top: 12px; font-size: 11px; color: #94a3b8;">
        Record ID: ${escapeHtml(inc.id)} | Created: ${escapeHtml(inc.createdAt)}
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>NIRBHAYA — Incident & Evidence Summary</title>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.5; color: #0f172a; margin: 32px; }
          .header { border-bottom: 2px solid #e11d48; padding-bottom: 16px; margin-bottom: 24px; }
          .disclaimer { background-color: #fef2f2; border: 1px solid #f87171; border-radius: 6px; padding: 12px; font-size: 12px; color: #991b1b; margin-bottom: 24px; }
          @media print {
            body { margin: 16px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #e11d48; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <h1 style="color: #e11d48; margin: 0; font-size: 24px;">NIRBHAYA Platform — Incident & Evidence Log</h1>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Confidential personal documentation generated on: <strong>${generatedAt}</strong></p>
        </div>

        <div class="disclaimer">
          <strong>NOTICE & LEGAL DISCLAIMER:</strong> This document is a user-compiled record log compiled through the NIRBHAYA platform for consultation with advocates, counselors, or law enforcement. It does not constitute a judicial affidavit or an automatic legal proof of authenticity. Original media files, electronic message headers, and telecommunication logs should be preserved intact for formal cyber-forensic examination under Section 65B of the Indian Evidence Act / Section 63 BSA.
        </div>

        <div class="summary-list">
          ${rows.length > 0 ? rows : '<p>No incidents currently selected for export.</p>'}
        </div>
      </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function getSeverityBg(sev: string): string {
  switch (sev) {
    case 'critical': return '#fee2e2';
    case 'high': return '#ffedd5';
    case 'medium': return '#fef3c7';
    default: return '#f1f5f9';
  }
}

function getSeverityColor(sev: string): string {
  switch (sev) {
    case 'critical': return '#991b1b';
    case 'high': return '#9a3412';
    case 'medium': return '#92400e';
    default: return '#475569';
  }
}
