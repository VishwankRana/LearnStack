import { HttpError } from '../lib/http-error.js'

export function notFoundHandler(request, _response, next) {
  next(
    new HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`),
  )
}
