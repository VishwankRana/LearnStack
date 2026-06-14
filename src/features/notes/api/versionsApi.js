import { apiRequest } from '../../../lib/api'

export function commitSnapshot(noteId, token) {
  return apiRequest(`/notes/${noteId}/snapshot`, { method: 'POST', token })
}

export function fetchVersions(noteId, token) {
  return apiRequest(`/notes/${noteId}/versions`, { token })
}

export function fetchVersion(noteId, versionId, token) {
  return apiRequest(`/notes/${noteId}/versions/${versionId}`, { token })
}

export function restoreVersion(noteId, versionId, token) {
  return apiRequest(`/notes/${noteId}/restore/${versionId}`, { method: 'POST', token })
}
