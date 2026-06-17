import { apiRequest } from '../../../lib/api';

export function fetchDashboardAnalytics(token) {
  return apiRequest('/analytics', { method: 'GET', token });
}

export function fetchContentGrowth(token, weeks = 12) {
  return apiRequest(`/analytics/content-growth?weeks=${weeks}`, { method: 'GET', token });
}

export function fetchStudyHeatmap(token, days = 84) {
  return apiRequest(`/analytics/study-heatmap?days=${days}`, { method: 'GET', token });
}

export function fetchQuizPerformance(token) {
  return apiRequest('/analytics/quiz-performance', { method: 'GET', token });
}
