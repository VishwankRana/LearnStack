import {
  NoteIcon,
  DocumentIcon,
  BookmarkIcon,
  SearchIcon,
  EditIcon,
  InboxIcon,
} from "./DashboardIcons";

const ACTIVITY_ICONS = {
  note_created: NoteIcon,
  note_updated: EditIcon,
  document_uploaded: DocumentIcon,
  bookmark_added: BookmarkIcon,
  search: SearchIcon,
};

function getActivityIndicatorClass(type) {
  const normalized = (type || "").toLowerCase().replace(/\s+/g, "_");
  const known = [
    "note_created",
    "note_updated",
    "document_uploaded",
    "bookmark_added",
    "search",
  ];
  return known.includes(normalized) ? normalized : "default";
}

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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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

export function ActivityFeed({ activities, isLoading }) {
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
        const typeKey = getActivityIndicatorClass(activity.type);
        const IconComponent = ACTIVITY_ICONS[typeKey] || NoteIcon;

        return (
          <div key={activity.id} className="activity-item">
            <div
              className={`activity-item__indicator activity-item__indicator--${typeKey}`}
            >
              <IconComponent />
            </div>
            <div className="activity-item__body">
              <h4 className="activity-item__title">{activity.title}</h4>
              {activity.description && (
                <p className="activity-item__description">
                  {activity.description}
                </p>
              )}
            </div>
            <time className="activity-item__time">
              {formatRelativeTime(activity.createdAt)}
            </time>
          </div>
        );
      })}
    </div>
  );
}
