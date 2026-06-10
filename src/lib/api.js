const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'

export async function apiRequest(path, options = {}) {
  const { token, headers, body, ...restOptions } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => ({
    success: false,
    error: {
      message: 'The server returned an unreadable response.',
    },
  }))

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Request failed.')
  }

  return payload.data
}

/**
 * Upload files via FormData. Does NOT set Content-Type (browser sets
 * multipart boundary automatically) and does NOT JSON.stringify the body.
 */
export async function apiUpload(path, formData, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  const payload = await response.json().catch(() => ({
    success: false,
    error: {
      message: 'The server returned an unreadable response.',
    },
  }))

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Upload failed.')
  }

  return payload.data
}
