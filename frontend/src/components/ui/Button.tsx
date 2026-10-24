import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary' | 'outline' | 'ghost' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  className = '',
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'emergency':
        return {
          backgroundColor: 'var(--color-danger)',
          color: 'var(--color-neutral-0)',
          fontWeight: 'var(--font-weight-bold)',
          boxShadow: 'var(--shadow-emergency)',
          border: '2px solid #b91c1c'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-danger)',
          color: 'var(--color-neutral-0)'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--color-brand-secondary)',
          color: 'var(--color-neutral-0)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          border: '1px solid var(--border-color-default)',
          color: 'var(--text-primary)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)'
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-brand-primary)',
          color: 'var(--color-neutral-0)'
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.375rem 0.75rem',
          fontSize: 'var(--font-size-sm)',
          borderRadius: 'var(--radius-sm)'
        };
      case 'lg':
        return {
          padding: '0.875rem 1.75rem',
          fontSize: 'var(--font-size-md)',
          borderRadius: 'var(--radius-lg)'
        };
      case 'md':
      default:
        return {
          padding: '0.625rem 1.25rem',
          fontSize: 'var(--font-size-base)',
          borderRadius: 'var(--radius-md)'
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 'var(--font-weight-medium)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'all var(--transition-fast)',
    outline: 'none',
    border: variant === 'outline' ? '1px solid var(--border-color-default)' : 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={baseStyle}
      className={className}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'inline-block', width: '1em', height: '1em', border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
