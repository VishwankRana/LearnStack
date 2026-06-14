import { apiRequest } from '../../../lib/api'

export function fetchDashboardStats(token) {
  return apiRequest('/dashboard/stats', {
    method: 'GET',
    token,
  })
}

export function fetchRecentActivity(token, limit = 8) {
  return apiRequest(`/activities/recent?limit=${limit}`, {
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
