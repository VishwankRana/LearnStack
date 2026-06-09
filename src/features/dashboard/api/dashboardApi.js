import { apiRequest } from '../../../lib/api'

export function fetchDashboardStats(token) {
  return apiRequest('/dashboard/stats', {
    method: 'GET',
    token,
  })
}

export function fetchRecentActivity(token) {
  return apiRequest('/dashboard/recent-activity', {
    method: 'GET',
    token,
  })
}

export function fetchRecentContent(token) {
  return apiRequest('/dashboard/recent-content', {
    method: 'GET',
    token,
  })
}
