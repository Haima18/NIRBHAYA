import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-10) var(--space-4)',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-color-default)'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-neutral-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-neutral-500)',
          marginBottom: 'var(--space-4)'
        }}
      >
        {icon || <ShieldAlert size={28} />}
      </div>
      <h3
        style={{
          fontSize: 'var(--font-size-md)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)'
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)',
          maxWidth: '420px',
          marginBottom: onAction && actionLabel ? 'var(--space-5)' : 0
        }}
      >
        {description}
      </p>
      {onAction && actionLabel && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
