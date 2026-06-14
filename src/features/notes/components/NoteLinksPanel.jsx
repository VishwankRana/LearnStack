import { Link } from 'react-router-dom';
import { useLinkedNotes, useBacklinks } from '../hooks/useNotes';
import { Spinner } from '../../../components/ui/Spinner';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function NoteItem({ note }) {
  return (
    <li>
      <Link to={`/app/notes/${note.id}`} className="note-link-item">
        <span className="note-link-item__icon">📝</span>
        <span className="note-link-item__body">
          <span className="note-link-item__title">{note.title}</span>
          {note.collection && (
            <span className="note-link-item__meta">in {note.collection.name}</span>
          )}
        </span>
        <span className="note-link-item__arrow">→</span>
      </Link>
    </li>
  );
}

function LinksSection({ type, noteId }) {
  const isOutgoing = type === 'outgoing';
  const { data, isLoading } = isOutgoing
    ? useLinkedNotes(noteId)   // eslint-disable-line react-hooks/rules-of-hooks
    : useBacklinks(noteId);    // eslint-disable-line react-hooks/rules-of-hooks

  const sectionClass = `note-links-section note-links-section--${isOutgoing ? 'outgoing' : 'incoming'}`;
  const title = isOutgoing ? 'Linked Notes' : 'Backlinks';
  const emptyMsg = isOutgoing
    ? 'This note doesn\'t link to any other notes yet.'
    : 'No notes link to this note yet.';
  const hint = isOutgoing
    ? <>Use <code>[[Note Title]]</code> syntax in the editor to link to another note.</>
    : null;

  return (
    <div className={sectionClass}>
      <div className="note-links-section__header">
        <h3 className="note-links-section__title">
          <span>{isOutgoing ? '🔗' : '⬅️'}</span>
          {title}
        </h3>
        {data && data.length > 0 && (
          <span className="note-links-section__count">{data.length}</span>
        )}
      </div>

      {isLoading && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          <Spinner size="sm" /> Loading…
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <ul className="note-links-list">
          {data.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </ul>
      )}

      {!isLoading && data && data.length === 0 && (
        <>
          <p className="note-links-section__empty">{emptyMsg}</p>
          {hint && <p className="note-links-section__hint">{hint}</p>}
        </>
      )}
    </div>
  );
}

/**
 * Displays linked notes (outgoing) and backlinks (incoming) for a note.
 * Only shown for existing (non-new) notes.
 */
export function NoteLinksPanel({ noteId }) {
  if (!noteId) return null;

  return (
    <div className="note-links-panel">
      <LinksSection type="outgoing" noteId={noteId} />
      <LinksSection type="incoming" noteId={noteId} />
    </div>
  );
}
