import { Link } from 'react-router-dom';

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 12h4" /><path d="M10 16h4" />
    </svg>
  );
}

function DocxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h2" /><path d="M8 17h2" /><path d="M14 13h2" /><path d="M14 17h2" />
    </svg>
  );
}

function TxtIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function getFileTypeInfo(mimeType) {
  if (mimeType === 'application/pdf') return { label: 'PDF', cls: 'pdf' };
  if (mimeType?.includes('wordprocessingml')) return { label: 'DOCX', cls: 'docx' };
  if (mimeType === 'text/plain') return { label: 'TXT', cls: 'txt' };
  return { label: 'FILE', cls: 'default' };
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function FileIcon({ mimeType }) {
  if (mimeType === 'application/pdf') return <PdfIcon />;
  if (mimeType?.includes('wordprocessingml')) return <DocxIcon />;
  return <TxtIcon />;
}

export function DocumentCard({ document, onEdit, onDelete }) {
  const type = getFileTypeInfo(document.fileType);

  function handleEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(document);
  }

  function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(document);
  }

  return (
    <Link to={`/app/documents/${document.id}`} className="document-card">
      <div className="document-card__header">
        <div className={`document-card__icon document-card__icon--${type.cls}`}>
          <FileIcon mimeType={document.fileType} />
        </div>
        <div className="document-card__actions">
          <button type="button" className="document-card__action-btn" onClick={handleEdit} aria-label="Edit document">
            <EditIcon />
          </button>
          <button type="button" className="document-card__action-btn document-card__action-btn--danger" onClick={handleDelete} aria-label="Delete document">
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="document-card__body">
        <h3 className="document-card__title">{document.title}</h3>
      </div>

      <div className="document-card__meta">
        <span className={`document-card__file-type document-card__file-type--${type.cls}`}>
          {type.label}
        </span>
        <span className="document-card__size">{formatFileSize(document.fileSize)}</span>
        <span className="document-card__dot" />
        <span className="document-card__date">{formatDate(document.createdAt)}</span>
      </div>
    </Link>
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className="document-card document-card--skeleton">
      <div className="document-card__header">
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 13 }} />
      </div>
      <div className="document-card__body">
        <div className="skeleton" style={{ width: '70%', height: 16, borderRadius: 6 }} />
      </div>
      <div className="document-card__meta">
        <div className="skeleton" style={{ width: 36, height: 14, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 48, height: 12, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 6 }} />
      </div>
    </div>
  );
}
