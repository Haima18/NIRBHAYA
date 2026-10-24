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
}) => (
  <div className="ui-empty">
    <div className="ui-empty__icon">{icon || <ShieldAlert size={26} />}</div>
    <h3 className="ui-empty__title">{title}</h3>
    <p className="ui-empty__text">{description}</p>
    {onAction && actionLabel && (
      <Button variant="outline" size="sm" onClick={onAction} className="ui-empty__action">
        {actionLabel}
      </Button>
    )}
  </div>
);
