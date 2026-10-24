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
    <div className="ui-field">
      {label && <label htmlFor={inputId} className="ui-label">{label}</label>}
      <input
        id={inputId}
        className={`ui-input${error ? ' ui-input--error' : ''}`}
        style={style}
        {...props}
      />
      {error && <span className="ui-error">{error}</span>}
      {helperText && !error && <span className="ui-help">{helperText}</span>}
    </div>
  );
};
