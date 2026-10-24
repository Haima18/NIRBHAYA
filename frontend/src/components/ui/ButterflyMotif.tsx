import React from 'react';

export interface ButterflyMotifProps {
  size?: number;
  glowColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ButterflyMotif: React.FC<ButterflyMotifProps> = ({
  size = 64,
  glowColor = 'rgba(168, 118, 248, 0.65)',
  className = '',
  style
}) => {
  return (
    <div
      className={`butterfly-floating ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: `drop-shadow(0 0 16px ${glowColor})`,
        ...style
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Wing Gradients */}
          <linearGradient id="lavenderWingTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#decbfe" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#a876f8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7434d8" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="lavenderWingBottom" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ede4ff" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#c5a3fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b4ff0" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="butterflyCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="60%" stopColor="#decbfe" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a876f8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Glow Halo */}
        <circle cx="60" cy="60" r="46" fill="url(#butterflyCoreGlow)" opacity="0.35" />

        {/* Upper Left Wing */}
        <path
          d="M58 55 C48 30, 20 22, 14 36 C8 50, 30 70, 58 64 Z"
          fill="url(#lavenderWingTop)"
          stroke="#ede4ff"
          strokeWidth="1.2"
        />
        {/* Upper Right Wing */}
        <path
          d="M62 55 C72 30, 100 22, 106 36 C112 50, 90 70, 62 64 Z"
          fill="url(#lavenderWingTop)"
          stroke="#ede4ff"
          strokeWidth="1.2"
        />

        {/* Lower Left Wing */}
        <path
          d="M58 66 C42 72, 26 84, 34 98 C42 108, 56 86, 59 74 Z"
          fill="url(#lavenderWingBottom)"
          stroke="#ede4ff"
          strokeWidth="1"
        />
        {/* Lower Right Wing */}
        <path
          d="M62 66 C78 72, 94 84, 86 98 C78 108, 64 86, 61 74 Z"
          fill="url(#lavenderWingBottom)"
          stroke="#ede4ff"
          strokeWidth="1"
        />

        {/* Wing Vein Filigree Details */}
        <path d="M58 58 Q40 46 26 40" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.6" fill="none" />
        <path d="M62 58 Q80 46 94 40" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.6" fill="none" />
        <path d="M58 68 Q46 80 40 90" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5" fill="none" />
        <path d="M62 68 Q74 80 80 90" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5" fill="none" />

        {/* Slender Body & Head */}
        <ellipse cx="60" cy="62" rx="2.5" ry="14" fill="#4f2391" stroke="#ede4ff" strokeWidth="0.8" />
        <circle cx="60" cy="46" r="3" fill="#6029b3" />

        {/* Delicate Antennae with Starlight Tips */}
        <path d="M59 44 Q50 32 46 33" stroke="#decbfe" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <circle cx="46" cy="33" r="1.5" fill="#ffffff" />
        <path d="M61 44 Q70 32 74 33" stroke="#decbfe" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <circle cx="74" cy="33" r="1.5" fill="#ffffff" />
      </svg>
    </div>
  );
};
