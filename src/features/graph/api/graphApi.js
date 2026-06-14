import { apiRequest } from '../../../lib/api'

export function fetchGraph(token) {
  return apiRequest('/graph', { token })
}
