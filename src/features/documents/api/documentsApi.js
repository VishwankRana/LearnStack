import { apiRequest, apiUpload } from '../../../lib/api';

export function fetchDocuments({ search, collectionId } = {}, token) {
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (collectionId) params.set('collectionId', collectionId);

  const query = params.toString();
  return apiRequest(`/documents${query ? `?${query}` : ''}`, {
    method: 'GET',
    token,
  });
}

export function fetchDocument(id, token) {
  return apiRequest(`/documents/${id}`, { method: 'GET', token });
}

export function uploadDocument(formData, token) {
  return apiUpload('/documents', formData, token);
}

export function updateDocument(id, data, token) {
  return apiRequest(`/documents/${id}`, { method: 'PATCH', token, body: data });
}

export function deleteDocument(id, token) {
  return apiRequest(`/documents/${id}`, { method: 'DELETE', token });
}

export function summarizeDocument(id, token) {
  return apiRequest(`/documents/${id}/summarize`, { method: 'POST', token });
}

export function reextractDocumentText(id, token) {
  return apiRequest(`/documents/${id}/reextract`, { method: 'POST', token });
}
