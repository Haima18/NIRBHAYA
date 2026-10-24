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
}) => (
  <button
    disabled={disabled || isLoading}
    style={style}
    className={`btn btn-${variant} btn-${size} ${className}`.trim()}
    {...props}
  >
    {isLoading ? <span className="btn-loading" aria-hidden="true" /> : leftIcon}
    {children}
    {!isLoading && rightIcon}
  </button>
);
