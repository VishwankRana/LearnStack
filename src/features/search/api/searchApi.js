import { apiRequest } from '../../../lib/api'

/**
 * @param {string} token
 * @param {{ q: string, page?: number, limit?: number }} params
 */
export async function searchAll(token, { q, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ q, page, limit })
  return apiRequest(`/search?${params}`, { token })
}
