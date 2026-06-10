import { useRef, useState, useCallback } from 'react';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * UploadZone — drag-and-drop + click-to-select file upload area.
 */
export function UploadZone({ file, onFileSelect, onFileClear, disabled }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = useCallback((f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Only PDF, DOCX, and TXT files are supported.');
      return false;
    }
    if (f.size > MAX_SIZE) {
      setError('File must be 10 MB or smaller.');
      return false;
    }
    setError(null);
    return true;
  }, []);

  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  function handleInputChange(e) {
    const selected = e.target.files?.[0];
    if (selected && validateFile(selected)) {
      onFileSelect(selected);
    }
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const dropped = e.dataTransfer.files?.[0];
    if (dropped && validateFile(dropped)) {
      onFileSelect(dropped);
    }
  }

  function handleClear(e) {
    e.stopPropagation();
    onFileClear();
    setError(null);
  }

  return (
    <div>
      <div
        className={`upload-zone ${isDragOver ? 'upload-zone--active' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        aria-label="Upload file"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        {file ? (
          <div className="upload-zone__file-info">
            <FileIcon />
            <span>{file.name} ({formatSize(file.size)})</span>
            <button type="button" className="upload-zone__remove" onClick={handleClear} aria-label="Remove file">
              <CloseIcon />
            </button>
          </div>
        ) : (
          <>
            <div className="upload-zone__icon">
              <UploadIcon />
            </div>
            <p className="upload-zone__title">
              Drop your file here, or click to browse
            </p>
            <p className="upload-zone__description">
              Supports PDF, DOCX, and TXT — up to 10 MB
            </p>
          </>
        )}
      </div>
      {error && <span className="ui-field__error" style={{ marginTop: 6, display: 'block' }}>{error}</span>}
    </div>
  );
}
