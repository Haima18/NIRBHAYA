import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface AlertProps {
  type?: 'danger' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, children }) => {
  const config = {
    danger: { icon: <AlertCircle size={19} />, color: 'var(--color-danger)' },
    warning: { icon: <AlertTriangle size={19} />, color: 'var(--color-warning)' },
    success: { icon: <CheckCircle size={19} />, color: 'var(--color-success)' },
    info: { icon: <Info size={19} />, color: 'var(--color-info)' }
  }[type];

  return (
    <div className={`ui-alert ui-alert-${type}`} role={type === 'danger' ? 'alert' : undefined}>
      <div className="ui-alert__icon" style={{ color: config.color }}>{config.icon}</div>
      <div className="ui-alert__body">
        {title && <p className="ui-alert__title">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
};
