import { forwardRef } from 'react';

/**
 * Textarea — styled textarea with label, error, and helper text.
 * Compatible with React Hook Form via forwardRef.
 */
export const Textarea = forwardRef(function Textarea(
  { label, error, helperText, className = '', ...props },
  ref,
) {
  return (
    <div className="ui-field">
      {label && <label className="ui-field__label">{label}</label>}
      <textarea
        ref={ref}
        className={`ui-textarea ${error ? 'ui-textarea--error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="ui-field__error">{error}</span>}
      {helperText && !error && (
        <span className="ui-field__helper">{helperText}</span>
      )}
    </div>
  );
});
