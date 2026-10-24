import React from 'react';

export interface ProgressProps {
  value: number; // 0 to 100
  color?: string;
  height?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  color = 'var(--color-brand-primary)',
  height = '8px'
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      style={{
        width: '100%',
        height,
        backgroundColor: 'var(--color-neutral-200)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 'var(--radius-full)',
          transition: 'width var(--transition-normal)'
        }}
      />
    </div>
  );
};
