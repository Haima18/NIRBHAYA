import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'success' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const getColors = () => {
    switch (variant) {
      case 'critical':
        return { bg: 'var(--color-danger-light)', text: 'var(--color-danger-hover)' };
      case 'high':
        return { bg: '#ffedd5', text: '#c2410c' }; // Orange
      case 'medium':
        return { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' };
      case 'low':
        return { bg: 'var(--color-brand-primary-light)', text: 'var(--color-brand-primary)' };
      case 'success':
        return { bg: 'var(--color-success-light)', text: 'var(--color-success)' };
      case 'info':
        return { bg: 'var(--color-info-light)', text: 'var(--color-info)' };
      case 'neutral':
      default:
        return { bg: 'var(--color-neutral-100)', text: 'var(--color-neutral-700)' };
    }
  };

  const { bg, text } = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-semibold)',
        backgroundColor: bg,
        color: text,
        textTransform: 'uppercase',
        letterSpacing: '0.025em'
      }}
    >
      {children}
    </span>
  );
};
