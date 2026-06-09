import { apiRequest } from '../../../lib/api';

export function fetchBookmarks({ search, collectionId } = {}, token) {
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (collectionId) params.set('collectionId', collectionId);

  const query = params.toString();
  return apiRequest(`/bookmarks${query ? `?${query}` : ''}`, {
    method: 'GET',
    token,
  });
}

export function fetchBookmark(id, token) {
  return apiRequest(`/bookmarks/${id}`, { method: 'GET', token });
}

export function createBookmark(data, token) {
  return apiRequest('/bookmarks', { method: 'POST', token, body: data });
}

export function updateBookmark(id, data, token) {
  return apiRequest(`/bookmarks/${id}`, { method: 'PATCH', token, body: data });
}

export function deleteBookmark(id, token) {
  return apiRequest(`/bookmarks/${id}`, { method: 'DELETE', token });
}
