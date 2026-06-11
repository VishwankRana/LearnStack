import { apiRequest } from '../../../lib/api';

export function fetchSearchResults(query, token) {
  return apiRequest(`/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    token,
  });
}
