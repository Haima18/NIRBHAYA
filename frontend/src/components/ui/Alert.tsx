import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface AlertProps {
  type?: 'danger' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, children }) => {
  const getConfig = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'var(--color-danger-subtle)',
          border: 'var(--color-danger-border)',
          text: 'var(--color-danger-hover)',
          icon: <AlertCircle size={20} color="var(--color-danger)" />
        };
      case 'warning':
        return {
          bg: 'var(--color-warning-subtle)',
          border: 'var(--color-warning-border)',
          text: 'var(--color-warning)',
          icon: <AlertTriangle size={20} color="var(--color-warning)" />
        };
      case 'success':
        return {
          bg: 'var(--color-success-subtle)',
          border: 'var(--color-success-border)',
          text: 'var(--color-success)',
          icon: <CheckCircle size={20} color="var(--color-success)" />
        };
      case 'info':
      default:
        return {
          bg: 'var(--color-info-subtle)',
          border: 'var(--color-info-border)',
          text: 'var(--color-info)',
          icon: <Info size={20} color="var(--color-info)" />
        };
    }
  };

  const { bg, border, text, icon } = getConfig();

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
      <div style={{ flexGrow: 1, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
        {title && (
          <h4 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: '0.25rem', color: text }}>
            {title}
          </h4>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};
