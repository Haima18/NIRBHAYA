import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'success' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => (
  <span className={`ui-badge ui-badge-${variant}`}>{children}</span>
);
