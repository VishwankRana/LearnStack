import { Link } from "react-router-dom";
import {
  NoteIcon,
  DocumentIcon,
  BookmarkIcon,
  EditIcon,
  InboxIcon,
} from "./DashboardIcons";

function CollectionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  );
}

function CommitIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <line x1="1.05" y1="12" x2="7" y2="12" />
      <line x1="17.01" y1="12" x2="22.96" y2="12" />
    </svg>
  );
}

const TYPE_CONFIG = {
  NOTE_CREATED:        { label: "Note Created",        Icon: NoteIcon,       cls: "note_created"       },
  NOTE_UPDATED:        { label: "Note Updated",        Icon: EditIcon,       cls: "note_updated"       },
  NOTE_DELETED:        { label: "Note Deleted",        Icon: TrashIcon,      cls: "default"            },
  NOTE_COMMITTED:      { label: "Version Committed",   Icon: CommitIcon,     cls: "default"            },
  DOCUMENT_UPLOADED:   { label: "Document Uploaded",   Icon: DocumentIcon,   cls: "document_uploaded"  },
  DOCUMENT_DELETED:    { label: "Document Deleted",    Icon: TrashIcon,      cls: "default"            },
  BOOKMARK_ADDED:      { label: "Bookmark Saved",      Icon: BookmarkIcon,   cls: "bookmark_added"     },
  BOOKMARK_UPDATED:    { label: "Bookmark Updated",    Icon: BookmarkIcon,   cls: "bookmark_added"     },
  BOOKMARK_DELETED:    { label: "Bookmark Deleted",    Icon: TrashIcon,      cls: "default"            },
  COLLECTION_CREATED:  { label: "Collection Created",  Icon: CollectionIcon, cls: "default"            },
  COLLECTION_UPDATED:  { label: "Collection Updated",  Icon: CollectionIcon, cls: "default"            },
  COLLECTION_DELETED:  { label: "Collection Deleted",  Icon: TrashIcon,      cls: "default"            },
};

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ActivitySkeleton() {
  return (
    <div className="activity-feed">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="activity-item">
          <div className="skeleton skeleton--sm-circle" />
          <div className="activity-item__body">
            <div className="skeleton skeleton--text" style={{ width: `${55 + i * 8}%`, marginBottom: 6 }} />
            <div className="skeleton skeleton--text" style={{ width: "40%", height: 10 }} />
          </div>
          <div className="skeleton skeleton--text" style={{ width: 40, height: 10 }} />
        </div>
      ))}
    </div>
  );
}

export function ActivityFeed({ activities: raw, isLoading }) {
  // Support both array and { data: [...] } shapes
  const activities = Array.isArray(raw) ? raw : (raw?.data ?? []);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">
          <InboxIcon />
        </div>
        <h4 className="empty-state__title">No activity yet</h4>
        <p className="empty-state__description">
          Your recent actions will appear here as you create notes, upload documents, and save bookmarks.
        </p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((activity) => {
        const config  = TYPE_CONFIG[activity.type];
        const cls     = config?.cls ?? "default";
        const Icon    = config?.Icon ?? NoteIcon;

        return (
          <div key={activity.id} className="activity-item">
            <div className={`activity-item__indicator activity-item__indicator--${cls}`}>
              <Icon />
            </div>
            <div className="activity-item__body">
              <h4 className="activity-item__title">{activity.title}</h4>
              {activity.description && (
                <p className="activity-item__description">{activity.description}</p>
              )}
            </div>
            <time className="activity-item__time">
              {formatRelativeTime(activity.createdAt)}
            </time>
          </div>
        );
      })}

      <div style={{ padding: "12px 0 0", textAlign: "center" }}>
        <Link
          to="/app/activity"
          style={{
            fontSize: "0.8rem",
            color: "#6366f1",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          View full timeline →
        </Link>
      </div>
    </div>
  );
}
