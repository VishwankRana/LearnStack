import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../context/useAuth";
import {
  fetchDashboardStats,
  fetchRecentActivity,
  fetchRecentContent,
} from "../api/dashboardApi";
import { ActivityFeed } from "../components/ActivityFeed";
import { RecentContent } from "../components/RecentContent";
import { StatsCard } from "../components/StatsCard";
import {
  ActivityIcon,
  ContentIcon,
  CalendarIcon,
  PlusIcon,
  UploadIcon,
  LinkIcon,
  CollectionIcon,
} from "../components/DashboardIcons";
import "../dashboard.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getUserInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function DashboardPage() {
  const { user, token } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchDashboardStats(token),
    enabled: !!token,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["recent-activities", 8],
    queryFn: () => fetchRecentActivity(token, 8),
    enabled: !!token,
  });

  const { data: recentContent, isLoading: contentLoading } = useQuery({
    queryKey: ["recent-content"],
    queryFn: () => fetchRecentContent(token),
    enabled: !!token,
  });

  const activityItems = Array.isArray(activity) ? activity : (activity?.data ?? []);
  const activityCount = activityItems.length;
  const contentCount =
    (recentContent?.recentNotes?.length || 0) +
    (recentContent?.recentDocuments?.length || 0) +
    (recentContent?.recentBookmarks?.length || 0);

  return (
    <section className="dashboard-page">
      {/* — Header — */}
      <div className="dashboard-header">
        <div className="dashboard-header__greeting">
          <div className="dashboard-header__avatar" aria-hidden="true">
            {getUserInitials(user?.name)}
          </div>
          <div className="dashboard-header__text">
            <p className="dashboard-header__eyebrow">
              {getGreeting()}
            </p>
            <h2 className="dashboard-header__title">{user?.name}</h2>
            <p className="dashboard-header__subtitle">
              Here's what's happening in your knowledge vault
            </p>
          </div>
        </div>
        <div className="dashboard-header__actions">
          <span className="dashboard-header__date">
            <CalendarIcon />
            {getFormattedDate()}
          </span>
        </div>
      </div>

      {/* — Quick Actions — */}
      <div className="quick-actions">
        <button className="quick-action" type="button">
          <PlusIcon />
          New Note
        </button>
        <button className="quick-action" type="button">
          <UploadIcon />
          Upload Document
        </button>
        <button className="quick-action" type="button">
          <LinkIcon />
          Save Bookmark
        </button>
        <button className="quick-action" type="button">
          <CollectionIcon />
          New Collection
        </button>
      </div>

      {/* — Statistics — */}
      <div className="stats-grid">
        <StatsCard
          label="Notes"
          value={stats?.totalNotes ?? 0}
          variant="notes"
          isLoading={statsLoading}
        />
        <StatsCard
          label="Documents"
          value={stats?.totalDocuments ?? 0}
          variant="documents"
          isLoading={statsLoading}
        />
        <StatsCard
          label="Bookmarks"
          value={stats?.totalBookmarks ?? 0}
          variant="bookmarks"
          isLoading={statsLoading}
        />
        <StatsCard
          label="Collections"
          value={stats?.totalCollections ?? 0}
          variant="collections"
          isLoading={statsLoading}
        />
      </div>

      {/* — Activity & Recent Content — */}
      <div className="dashboard-content">
        <div className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div className="dashboard-panel__title-group">
              <div className="dashboard-panel__icon dashboard-panel__icon--activity">
                <ActivityIcon />
              </div>
              <h3 className="dashboard-panel__title">Recent Activity</h3>
            </div>
            {!activityLoading && activityCount > 0 && (
              <span className="dashboard-panel__badge">
                {activityCount} {activityCount === 1 ? "event" : "events"}
              </span>
            )}
          </div>
          <div className="dashboard-panel__body">
            <ActivityFeed activities={activityItems} isLoading={activityLoading} />
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div className="dashboard-panel__title-group">
              <div className="dashboard-panel__icon dashboard-panel__icon--content">
                <ContentIcon />
              </div>
              <h3 className="dashboard-panel__title">Recent Content</h3>
            </div>
            {!contentLoading && contentCount > 0 && (
              <span className="dashboard-panel__badge">
                {contentCount} {contentCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <div className="dashboard-panel__body">
            <RecentContent
              notes={recentContent?.recentNotes}
              documents={recentContent?.recentDocuments}
              bookmarks={recentContent?.recentBookmarks}
              isLoading={contentLoading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
