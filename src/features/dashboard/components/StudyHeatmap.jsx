import { Spinner } from '../../../components/ui/Spinner';

const LEVEL_COLORS = [
  '#eef2ff',
  '#c7d2fe',
  '#818cf8',
  '#6366f1',
  '#4338ca',
];

function groupByWeek(days) {
  if (!days?.length) return [];

  const weeks = [];
  let currentWeek = [];

  for (const day of days) {
    const date = new Date(`${day.date}T00:00:00`);
    const dow = date.getDay();

    if (dow === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

export function StudyHeatmap({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="analytics-chart analytics-chart--loading">
        <Spinner size="md" />
      </div>
    );
  }

  const days = data?.days ?? [];
  if (!days.length) {
    return <p className="analytics-chart__empty">No study activity recorded yet.</p>;
  }

  const weeks = groupByWeek(days);
  const monthLabels = [];
  let lastMonth = '';

  for (const week of weeks) {
    const firstDay = week[0];
    if (firstDay) {
      const month = new Date(`${firstDay.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short' });
      monthLabels.push(month !== lastMonth ? month : '');
      lastMonth = month;
    } else {
      monthLabels.push('');
    }
  }

  return (
    <div className="study-heatmap">
      <div className="study-heatmap__months">
        {monthLabels.map((label, i) => (
          <span key={i} className="study-heatmap__month">{label}</span>
        ))}
      </div>
      <div className="study-heatmap__grid-wrap">
        <div className="study-heatmap__days-label" aria-hidden="true">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        <div className="study-heatmap__grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="study-heatmap__week">
              {week.map((day) => (
                <div
                  key={day.date}
                  className="study-heatmap__cell"
                  style={{ backgroundColor: LEVEL_COLORS[day.level] }}
                  title={`${day.date}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="study-heatmap__legend">
        <span className="study-heatmap__legend-label">Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <span
            key={i}
            className="study-heatmap__legend-cell"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="study-heatmap__legend-label">More</span>
      </div>
      <p className="study-heatmap__caption">
        Notes created, flashcard reviews, and quiz attempts
      </p>
    </div>
  );
}
