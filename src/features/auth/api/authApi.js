import { apiRequest } from '../../../lib/api'

export function registerUser(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function loginUser(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function logoutUser(token) {
  return apiRequest('/auth/logout', {
    method: 'POST',
    token,
  })
}

export function fetchCurrentUser(token) {
  return apiRequest('/auth/me', {
    method: 'GET',
    token,
  })
}
