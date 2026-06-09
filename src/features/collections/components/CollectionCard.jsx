import { Link } from 'react-router-dom';

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

/**
 * CollectionCard — displays a collection in the grid.
 */
export function CollectionCard({ collection, onEdit, onDelete }) {
  const { _count: counts = {} } = collection;
  const totalItems = (counts.notes || 0) + (counts.documents || 0) + (counts.bookmarks || 0);

  function handleEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(collection);
  }

  function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(collection);
  }

  return (
    <Link
      to={`/app/collections/${collection.id}`}
      className="collection-card"
      style={{ '--card-color': collection.color || '#6366f1' }}
    >
      <div
        className="collection-card__header"
        style={{ position: 'relative' }}
      >
        {/* Color accent bar */}
        <span
          style={{
            position: 'absolute',
            top: -24,
            left: -24,
            right: -24,
            height: 3,
            background: collection.color || '#6366f1',
            borderRadius: '3px 3px 0 0',
          }}
        />

        <div
          className="collection-card__color-icon"
          style={{ background: collection.color || '#6366f1' }}
        >
          <FolderIcon />
        </div>

        <div className="collection-card__actions">
          <button
            type="button"
            className="collection-card__action-btn"
            onClick={handleEdit}
            aria-label="Edit collection"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            className="collection-card__action-btn collection-card__action-btn--danger"
            onClick={handleDelete}
            aria-label="Delete collection"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="collection-card__body">
        <h3 className="collection-card__name">{collection.name}</h3>
        {collection.description && (
          <p className="collection-card__description">
            {collection.description}
          </p>
        )}
      </div>

      <div className="collection-card__stats">
        <span className="collection-card__stat">
          <NoteIcon />
          {counts.notes || 0} notes
        </span>
        <span className="collection-card__stat">
          <DocIcon />
          {counts.documents || 0} docs
        </span>
        <span className="collection-card__stat">
          <BookmarkIcon />
          {counts.bookmarks || 0} saved
        </span>
      </div>
    </Link>
  );
}

/**
 * CollectionCardSkeleton — loading placeholder.
 */
export function CollectionCardSkeleton() {
  return (
    <div className="collection-card collection-card--skeleton">
      <div className="collection-card__header">
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 13 }} />
      </div>
      <div className="collection-card__body">
        <div className="skeleton" style={{ width: '60%', height: 18, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: '90%', height: 14, borderRadius: 6, marginTop: 6 }} />
      </div>
      <div className="collection-card__stats">
        <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 50, height: 12, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 55, height: 12, borderRadius: 6 }} />
      </div>
    </div>
  );
}
