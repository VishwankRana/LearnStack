import { apiRequest } from '../../../lib/api'

export function fetchActivities(token, { page = 1, limit = 20 } = {}) {
  return apiRequest(`/activities?page=${page}&limit=${limit}`, {
    method: 'GET',
    token,
  })
}

export function fetchRecentActivities(token, limit = 10) {
  return apiRequest(`/activities/recent?limit=${limit}`, {
    method: 'GET',
    token,
  })
}
