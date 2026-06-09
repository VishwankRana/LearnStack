import { forwardRef } from 'react';

/**
 * Input — styled text input with label, error, and helper text.
 * Compatible with React Hook Form via forwardRef.
 */
export const Input = forwardRef(function Input(
  { label, error, helperText, className = '', ...props },
  ref,
) {
  return (
    <div className="ui-field">
      {label && <label className="ui-field__label">{label}</label>}
      <input
        ref={ref}
        className={`ui-input ${error ? 'ui-input--error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="ui-field__error">{error}</span>}
      {helperText && !error && (
        <span className="ui-field__helper">{helperText}</span>
      )}
    </div>
  );
});
