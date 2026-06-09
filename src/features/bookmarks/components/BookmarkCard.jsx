/** Extract hostname from a URL string, falling back gracefully */
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
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

export function BookmarkCard({ bookmark, onEdit, onDelete }) {
  const domain = extractDomain(bookmark.url);
  const faviconSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  function handleEdit(e) {
    e.preventDefault();
    onEdit?.(bookmark);
  }

  function handleDelete(e) {
    e.preventDefault();
    onDelete?.(bookmark);
  }

  return (
    <article className="bookmark-card">
      {/* — Card Header — */}
      <div className="bookmark-card__header">
        <div className="bookmark-card__favicon-wrap">
          <img
            src={faviconSrc}
            alt=""
            className="bookmark-card__favicon"
            width={16}
            height={16}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <div className="bookmark-card__actions">
          <button
            type="button"
            className="bookmark-card__action-btn"
            onClick={handleEdit}
            aria-label="Edit bookmark"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            className="bookmark-card__action-btn bookmark-card__action-btn--danger"
            onClick={handleDelete}
            aria-label="Delete bookmark"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* — Card Body — */}
      <div className="bookmark-card__body">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bookmark-card__title"
        >
          {bookmark.title}
          <ExternalLinkIcon />
        </a>
        <span className="bookmark-card__domain">{domain}</span>
        {bookmark.description && (
          <p className="bookmark-card__description">{bookmark.description}</p>
        )}
      </div>

      {/* — Card Footer — */}
      <div className="bookmark-card__footer">
        {bookmark.collection ? (
          <span
            className="bookmark-card__collection"
            style={{ background: `${bookmark.collection.color}18`, color: bookmark.collection.color }}
          >
            <FolderIcon />
            {bookmark.collection.name}
          </span>
        ) : (
          <span className="bookmark-card__collection bookmark-card__collection--none">
            Uncategorized
          </span>
        )}
        <span className="bookmark-card__date">
          {formatRelativeTime(bookmark.createdAt)}
        </span>
      </div>
    </article>
  );
}

export function BookmarkCardSkeleton() {
  return (
    <div className="bookmark-card bookmark-card--skeleton">
      <div className="bookmark-card__header">
        <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 6 }} />
      </div>
      <div className="bookmark-card__body" style={{ gap: 8 }}>
        <div className="skeleton" style={{ width: '75%', height: 17, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: '100%', height: 12, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: '80%', height: 12, borderRadius: 6 }} />
      </div>
      <div className="bookmark-card__footer">
        <div className="skeleton" style={{ width: 90, height: 22, borderRadius: 999 }} />
        <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 6 }} />
      </div>
    </div>
  );
}
