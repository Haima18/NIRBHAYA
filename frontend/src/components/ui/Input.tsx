import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  style,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--text-secondary)'
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          width: '100%',
          padding: '0.625rem 0.875rem',
          borderRadius: 'var(--radius-md)',
          border: error ? '1px solid var(--color-danger)' : '1px solid var(--border-color-default)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          outline: 'none',
          fontSize: 'var(--font-size-sm)',
          transition: 'border-color var(--transition-fast)',
          ...style
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
