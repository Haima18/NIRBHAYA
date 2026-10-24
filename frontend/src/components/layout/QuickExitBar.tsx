import React from 'react';
import { EyeOff, AlertTriangle } from 'lucide-react';
import { storageService } from '@/services/storage/storageService';

export const QuickExitBar: React.FC = () => {
  const handleQuickExit = () => {
    const profile = storageService.getProfile();
    const targetUrl = profile.quickExitUrl || 'https://www.accuweather.com';
    // Instantly replace window location to avoid easy back navigation
    window.location.replace(targetUrl);
  };

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '0.4rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        zIndex: 'var(--z-quick-exit)',
        position: 'sticky',
        top: 0
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#f87171', fontWeight: 600 }}>
          <AlertTriangle size={14} /> Quick Exit Available:
        </span>
        <span style={{ color: '#94a3b8' }}>
          If in danger or monitored, click Exit to redirect to neutral weather site. (Note: cannot erase browser history).
        </span>
      </div>

      <button
        onClick={handleQuickExit}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: '#e11d48',
          color: '#ffffff',
          fontWeight: 700,
          padding: '0.25rem 0.75rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}
        title="Instantly exit this site and replace tab"
      >
        <EyeOff size={14} /> Quick Exit (ESC)
      </button>
    </div>
  );
};
