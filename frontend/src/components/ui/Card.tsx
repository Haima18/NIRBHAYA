import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'danger' | 'highlight';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  className = '',
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: 'var(--bg-surface-elevated)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color-default)'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-danger-subtle)',
          border: '1px solid var(--color-danger-border)',
          boxShadow: 'var(--shadow-sm)'
        };
      case 'highlight':
        return {
          backgroundColor: 'var(--color-brand-primary-subtle)',
          border: '1px solid var(--color-brand-primary-light)',
          boxShadow: 'var(--shadow-sm)'
        };
      case 'default':
      default:
        return {
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color-default)',
          boxShadow: 'var(--shadow-xs)'
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    transition: 'box-shadow var(--transition-fast)',
    ...getVariantStyles(),
    ...style
  };

  return (
    <div style={baseStyle} className={className} {...props}>
      {children}
    </div>
  );
};
