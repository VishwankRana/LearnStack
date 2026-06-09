import { Link } from 'react-router-dom';

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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

/** Strip markdown syntax for plain-text previews */
function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '[code block]')
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1))
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/^>\s/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function countWords(text) {
  const stripped = stripMarkdown(text);
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

export function NoteCard({ note, onDelete }) {
  const preview = stripMarkdown(note.content || '');
  const words = countWords(note.content || '');

  function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(note);
  }

  return (
    <Link to={`/app/notes/${note.id}`} className="note-card">
      <div className="note-card__header">
        <h3 className="note-card__title">{note.title}</h3>
        <div className="note-card__actions">
          <Link
            to={`/app/notes/${note.id}`}
            className="note-card__action-btn"
            aria-label="Edit note"
            onClick={(e) => e.stopPropagation()}
          >
            <EditIcon />
          </Link>
          <button
            type="button"
            className="note-card__action-btn note-card__action-btn--danger"
            onClick={handleDelete}
            aria-label="Delete note"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {preview && (
        <p className="note-card__preview">{preview}</p>
      )}

      <div className="note-card__footer">
        {note.collection ? (
          <span
            className="note-card__collection"
            style={{ background: `${note.collection.color}18`, color: note.collection.color }}
          >
            <FolderIcon />
            {note.collection.name}
          </span>
        ) : (
          <span className="note-card__collection note-card__collection--none">
            Uncategorized
          </span>
        )}
        <div className="note-card__meta">
          <span>{words} {words === 1 ? 'word' : 'words'}</span>
          <span>·</span>
          <span>{formatRelativeTime(note.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="note-card note-card--skeleton">
      <div className="note-card__header">
        <div className="skeleton" style={{ width: '65%', height: 18, borderRadius: 6 }} />
      </div>
      <div style={{ display: 'grid', gap: 6, padding: '4px 0' }}>
        <div className="skeleton" style={{ width: '100%', height: 13, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: '80%', height: 13, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: '50%', height: 13, borderRadius: 6 }} />
      </div>
      <div className="note-card__footer">
        <div className="skeleton" style={{ width: 90, height: 22, borderRadius: 999 }} />
        <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 6 }} />
      </div>
    </div>
  );
}
