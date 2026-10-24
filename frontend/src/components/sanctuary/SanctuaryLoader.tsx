import React from 'react';
import { PhoneCall, RefreshCw } from 'lucide-react';

interface SanctuaryLoaderProps {
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Branded startup experience. It is shown only while the session is being
 * restored. The emergency dial shortcut is available even if initialization
 * fails, and no artificial percentage is displayed.
 */
export const SanctuaryLoader: React.FC<SanctuaryLoaderProps> = ({ error, onRetry }) => (
  <main className="sanctuary-loader" aria-label="NIRBHAYA is preparing your safe space">
    <div className="sanctuary-loader__sky" aria-hidden="true" />
    <div className="sanctuary-loader__grid" aria-hidden="true" />
    <div className="sanctuary-loader__content">
      <div className="sanctuary-loader__halo" aria-hidden="true">
        <img src="/assets/butterfly-glow.jpg" alt="" className="sanctuary-loader__butterfly" draggable={false} />
      </div>
      <p className="sanctuary-loader__eyebrow">A living sanctuary</p>
      <h1 className="sanctuary-loader__wordmark">NIRBHAYA</h1>
      <p className="sanctuary-loader__tagline">Your safety. Your voice. Your choice.</p>

      {error ? (
        <div className="sanctuary-loader__error" role="alert">
          <p>{error}</p>
          {onRetry && (
            <button type="button" className="sanctuary-loader__retry" onClick={onRetry}>
              <RefreshCw size={15} aria-hidden="true" /> Try again
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="sanctuary-loader__line" role="progressbar" aria-label="Preparing your safe space">
            <span />
          </div>
          <p className="sanctuary-loader__note" role="status" aria-live="polite">
            Preparing your safe space…
          </p>
        </>
      )}

      <a className="sanctuary-loader__sos" href="tel:112">
        <PhoneCall size={15} aria-hidden="true" /> Immediate danger? Call 112
      </a>
      <p className="sanctuary-loader__small">NIRBHAYA cannot dispatch emergency services.</p>
    </div>
  </main>
);

export default SanctuaryLoader;
