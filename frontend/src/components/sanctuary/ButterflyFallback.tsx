import React from 'react';

/**
 * Lightweight, non-WebGL butterfly fallback.
 * The supplied artwork is shown as a clearly decorative image with CSS depth.
 * It is never described to the user as a 3D model.
 */
export const ButterflyFallback: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`butterfly-fallback ${className}`} role="img" aria-label="Luminous butterfly artwork">
    <span className="butterfly-fallback__halo" aria-hidden="true" />
    <img src="/assets/butterfly-glow.jpg" alt="" className="butterfly-fallback__image" draggable={false} />
    <span className="butterfly-fallback__caption">A quiet symbol of strength</span>
  </div>
);

export default ButterflyFallback;
