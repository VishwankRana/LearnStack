import {
  NoteIcon,
  DocumentIcon,
  BookmarkIcon,
  SparklesIcon,
} from "./DashboardIcons";

const TYPE_CONFIG = {
  Note: {
    icon: NoteIcon,
    iconClass: "content-item__icon--note",
    typeClass: "content-item__type--note",
  },
  Document: {
    icon: DocumentIcon,
    iconClass: "content-item__icon--document",
    typeClass: "content-item__type--document",
  },
  Bookmark: {
    icon: BookmarkIcon,
    iconClass: "content-item__icon--bookmark",
    typeClass: "content-item__type--bookmark",
  },
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffDay === 0) return "Today";
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function ContentSkeleton() {
  return (
    <div className="recent-content">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="content-item" style={{ opacity: 1 - i * 0.15 }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
          <div className="content-item__info">
            <div className="skeleton skeleton--text" style={{ width: `${50 + i * 10}%`, marginBottom: 6 }} />
            <div className="skeleton skeleton--text" style={{ width: "30%", height: 10 }} />
          </div>
          <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  );
}

export function RecentContent({ notes, documents, bookmarks, isLoading }) {
  if (isLoading) {
    return <ContentSkeleton />;
  }

  const allContent = [
    ...(notes || []).map((note) => ({
      id: note.id,
      title: note.title,
      type: "Note",
      date: note.createdAt,
      collection: note.collection,
    })),
    ...(documents || []).map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: "Document",
      date: doc.createdAt,
      collection: doc.collection,
    })),
    ...(bookmarks || []).map((bookmark) => ({
      id: bookmark.id,
      title: bookmark.title,
      type: "Bookmark",
      date: bookmark.createdAt,
      collection: bookmark.collection,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (allContent.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">
          <SparklesIcon />
        </div>
        <h4 className="empty-state__title">Your vault is empty</h4>
        <p className="empty-state__description">
          Start by creating a note, uploading a document, or saving a bookmark to build your knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="recent-content">
      {allContent.map((item) => {
        const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.Note;
        const IconComponent = config.icon;

        return (
          <div key={`${item.type}-${item.id}`} className="content-item">
            <div className={`content-item__icon ${config.iconClass}`}>
              <IconComponent />
            </div>

            <div className="content-item__info">
              <h4 className="content-item__title">{item.title}</h4>
              <div className="content-item__meta">
                <span className={`content-item__type ${config.typeClass}`}>
                  {item.type}
                </span>
                <span className="content-item__dot" />
                <span className="content-item__date">
                  {formatDate(item.date)}
                </span>
              </div>
            </div>

            {item.collection && (
              <span
                className="content-item__collection"
                style={{ backgroundColor: item.collection.color || "#6366f1" }}
              >
                <span className="content-item__collection-dot" />
                {item.collection.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
