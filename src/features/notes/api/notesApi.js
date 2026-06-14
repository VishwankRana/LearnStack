import { apiRequest } from '../../../lib/api';

export function fetchNotes({ search, collectionId } = {}, token) {
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (collectionId) params.set('collectionId', collectionId);

  const query = params.toString();
  return apiRequest(`/notes${query ? `?${query}` : ''}`, {
    method: 'GET',
    token,
  });
}

export function fetchNote(id, token) {
  return apiRequest(`/notes/${id}`, { method: 'GET', token });
}

export function createNote(data, token) {
  return apiRequest('/notes', { method: 'POST', token, body: data });
}

export function updateNote(id, data, token) {
  return apiRequest(`/notes/${id}`, { method: 'PATCH', token, body: data });
}

export function deleteNote(id, token) {
  return apiRequest(`/notes/${id}`, { method: 'DELETE', token });
}

export function summarizeNote(id, token) {
  return apiRequest(`/notes/${id}/summarize`, { method: 'POST', token });
}

export function fetchLinkedNotes(id, token) {
  return apiRequest(`/notes/${id}/linked-notes`, { method: 'GET', token });
}

export function fetchBacklinks(id, token) {
  return apiRequest(`/notes/${id}/backlinks`, { method: 'GET', token });
}
