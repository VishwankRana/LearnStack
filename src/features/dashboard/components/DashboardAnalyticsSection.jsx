import { ContentGrowthChart } from './ContentGrowthChart';
import { StudyHeatmap } from './StudyHeatmap';
import { QuizPerformanceChart } from './QuizPerformanceChart';
import { useDashboardAnalytics } from '../hooks/useAnalytics';

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function HeatmapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

export function DashboardAnalyticsSection() {
  const { data, isLoading, isError } = useDashboardAnalytics();

  return (
    <section className="dashboard-analytics">
      <div className="dashboard-analytics__header">
        <h3 className="dashboard-analytics__title">Analytics</h3>
        <p className="dashboard-analytics__subtitle">
          Track content growth, study habits, and quiz performance
        </p>
      </div>

      {isError && (
        <p className="dashboard-analytics__error">Unable to load analytics. Please try again later.</p>
      )}

      <div className="dashboard-analytics__grid">
        <div className="dashboard-panel dashboard-analytics__panel dashboard-analytics__panel--wide">
          <div className="dashboard-panel__header">
            <div className="dashboard-panel__title-group">
              <div className="dashboard-panel__icon dashboard-panel__icon--analytics">
                <ChartIcon />
              </div>
              <h4 className="dashboard-panel__title">Content Growth Over Time</h4>
            </div>
          </div>
          <div className="dashboard-panel__body">
            <ContentGrowthChart data={data?.contentGrowth} isLoading={isLoading} />
          </div>
        </div>

        <div className="dashboard-panel dashboard-analytics__panel">
          <div className="dashboard-panel__header">
            <div className="dashboard-panel__title-group">
              <div className="dashboard-panel__icon dashboard-panel__icon--heatmap">
                <HeatmapIcon />
              </div>
              <h4 className="dashboard-panel__title">Study Activity</h4>
            </div>
          </div>
          <div className="dashboard-panel__body">
            <StudyHeatmap data={data?.studyHeatmap} isLoading={isLoading} />
          </div>
        </div>

        <div className="dashboard-panel dashboard-analytics__panel">
          <div className="dashboard-panel__header">
            <div className="dashboard-panel__title-group">
              <div className="dashboard-panel__icon dashboard-panel__icon--quiz">
                <TrophyIcon />
              </div>
              <h4 className="dashboard-panel__title">Quiz Performance</h4>
            </div>
          </div>
          <div className="dashboard-panel__body">
            <QuizPerformanceChart data={data?.quizPerformance} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </section>
  );
}
