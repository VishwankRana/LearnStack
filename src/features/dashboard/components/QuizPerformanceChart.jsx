import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Spinner } from '../../../components/ui/Spinner';

export function QuizPerformanceChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="analytics-chart analytics-chart--loading">
        <Spinner size="md" />
      </div>
    );
  }

  const attempts = data?.attempts ?? [];

  if (!attempts.length) {
    return <p className="analytics-chart__empty">Complete a quiz to see performance analytics.</p>;
  }

  return (
    <div className="analytics-chart">
      <div className="quiz-performance__stats">
        <div className="quiz-performance__stat">
          <span className="quiz-performance__stat-value">{data.averageScore}%</span>
          <span className="quiz-performance__stat-label">Average Score</span>
        </div>
        <div className="quiz-performance__stat">
          <span className="quiz-performance__stat-value">{data.highestScore}%</span>
          <span className="quiz-performance__stat-label">Highest Score</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={attempts} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value, _name, props) => [
              `${value}% (${props.payload.score}/${props.payload.total})`,
              props.payload.quizTitle,
            ]}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
            }}
          />
          {data.averageScore > 0 && (
            <ReferenceLine
              y={data.averageScore}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: 'Avg', position: 'insideTopRight', fontSize: 11, fill: '#94a3b8' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="percent"
            name="Score"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4, fill: '#10b981' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
