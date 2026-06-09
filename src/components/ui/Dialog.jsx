import { useEffect, useRef, useCallback } from 'react';

/**
 * Dialog — modal dialog using the native <dialog> element.
 * Composable sub-components: DialogHeader, DialogBody, DialogFooter.
 *
 * @param {boolean} open — controls visibility
 * @param {() => void} onClose — called when dialog should close
 * @param {React.ReactNode} children
 */
export function Dialog({ open, onClose, children, className = '' }) {
  const dialogRef = useRef(null);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function onCancel(e) {
      e.preventDefault();
      handleClose();
    }

    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  }, [handleClose]);

  function handleBackdropClick(e) {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`ui-dialog ${className}`}
      onClick={handleBackdropClick}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </dialog>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * DialogHeader — title area with optional close button.
 */
export function DialogHeader({ title, description, onClose, children }) {
  return (
    <div className="ui-dialog__header">
      <div>
        {title && <h2 className="ui-dialog__title">{title}</h2>}
        {description && (
          <p className="ui-dialog__description">{description}</p>
        )}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          className="ui-dialog__close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

/**
 * DialogBody — scrollable content area.
 */
export function DialogBody({ children, className = '' }) {
  return <div className={`ui-dialog__body ${className}`}>{children}</div>;
}

/**
 * DialogFooter — action button area.
 */
export function DialogFooter({ children, className = '' }) {
  return <div className={`ui-dialog__footer ${className}`}>{children}</div>;
}
