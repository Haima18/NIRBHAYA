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
}) => (
  <div style={style} className={`ui-card ui-card-${variant} ${className}`.trim()} {...props}>
    {children}
  </div>
);
