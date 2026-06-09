import { forwardRef } from 'react';

/**
 * Select — native <select> styled to match Input/Textarea.
 *
 * @param {string} [label]
 * @param {string} [error]
 * @param {string} [helper]
 * @param {React.ReactNode} children — <option> elements
 */
export const Select = forwardRef(function Select(
  { label, error, helper, className = '', children, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={`ui-select ${error ? 'ui-select--error' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {helper && !error && <p className="ui-field__helper">{helper}</p>}
      {error && <p className="ui-field__error">{error}</p>}
    </div>
  );
});
