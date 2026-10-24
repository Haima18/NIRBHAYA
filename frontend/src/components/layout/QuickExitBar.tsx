import React, { useCallback, useEffect } from 'react';
import { EyeOff, AlertTriangle } from 'lucide-react';
import { storageService } from '@/services/storage/storageService';

function safeExitUrl(value: string | undefined): string {
  const fallback = 'https://www.accuweather.com';
  if (!value) return fallback;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export const QuickExitBar: React.FC = () => {
  const handleQuickExit = useCallback(() => {
    const profile = storageService.getProfile();
    window.location.replace(safeExitUrl(profile.quickExitUrl));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Escape is intentionally global: it must work even when focus is in a
        // form field or a modal.
        handleQuickExit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleQuickExit]);

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '0.4rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        fontSize: '0.8rem',
        zIndex: 'var(--z-quick-exit)',
        position: 'sticky',
        top: 0,
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#f87171', fontWeight: 600 }}>
          <AlertTriangle size={14} /> Quick Exit:
        </span>
        <span style={{ color: '#94a3b8' }}>
          ESC or the button opens a neutral site. A website cannot erase your browser history.
        </span>
      </div>

      <button
        type="button"
        onClick={handleQuickExit}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: '#e11d48',
          color: '#ffffff',
          fontWeight: 700,
          padding: '0.3rem 0.75rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}
        title="Instantly leave this site and replace the current tab"
      >
        <EyeOff size={14} /> Quick Exit (ESC)
      </button>
    </div>
  );
};
