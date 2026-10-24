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
    <div className="quick-exit-bar">
      <div className="quick-exit-bar__copy">
        <strong>
          <AlertTriangle size={13} aria-hidden="true" /> Quick Exit
        </strong>
        <span>ESC or the button opens a neutral site. A website cannot erase your browser history.</span>
      </div>

      <button
        type="button"
        className="quick-exit-bar__button"
        onClick={handleQuickExit}
        title="Instantly leave this site and replace the current tab"
      >
        <EyeOff size={13} aria-hidden="true" /> Leave now (ESC)
      </button>
    </div>
  );
};
