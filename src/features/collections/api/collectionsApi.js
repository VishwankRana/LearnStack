import { apiRequest } from '../../../lib/api';

export function fetchCollections(token) {
  return apiRequest('/collections', {
    method: 'GET',
    token,
  });
}

export function fetchCollection(id, token) {
  return apiRequest(`/collections/${id}`, {
    method: 'GET',
    token,
  });
}

export function createCollection(data, token) {
  return apiRequest('/collections', {
    method: 'POST',
    token,
    body: data,
  });
}

export function updateCollection(id, data, token) {
  return apiRequest(`/collections/${id}`, {
    method: 'PATCH',
    token,
    body: data,
  });
}

export function deleteCollection(id, token) {
  return apiRequest(`/collections/${id}`, {
    method: 'DELETE',
    token,
  });
}
