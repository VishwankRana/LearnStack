import {
  NoteIcon,
  DocumentIcon,
  BookmarkIcon,
  CollectionIcon,
} from "./DashboardIcons";

const STAT_VARIANTS = {
  notes: {
    icon: NoteIcon,
    className: "stats-card--notes",
  },
  documents: {
    icon: DocumentIcon,
    className: "stats-card--documents",
  },
  bookmarks: {
    icon: BookmarkIcon,
    className: "stats-card--bookmarks",
  },
  collections: {
    icon: CollectionIcon,
    className: "stats-card--collections",
  },
};

export function StatsCard({ label, value, variant = "notes", isLoading }) {
  const config = STAT_VARIANTS[variant] || STAT_VARIANTS.notes;
  const IconComponent = config.icon;

  if (isLoading) {
    return (
      <article className={`stats-card stats-card--skeleton ${config.className}`}>
        <div className="stats-card__icon">
          <div className="skeleton skeleton--circle" style={{ width: 24, height: 24, borderRadius: 6 }} />
        </div>
        <div className="stats-card__content">
          <div className="skeleton skeleton--text" style={{ width: "70%" }} />
          <div className="skeleton skeleton--value" />
        </div>
      </article>
    );
  }

  return (
    <article className={`stats-card ${config.className}`}>
      <div className="stats-card__icon">
        <IconComponent />
      </div>
      <div className="stats-card__content">
        <p className="stats-card__label">{label}</p>
        <h3 className="stats-card__value">{value}</h3>
      </div>
    </article>
  );
}
