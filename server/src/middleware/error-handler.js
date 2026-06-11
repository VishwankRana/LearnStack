import { HttpError } from '../lib/http-error.js'
import { logger } from '../lib/logger.js'

export function errorHandler(error, request, response, next) {
  void next
  const isHttpError = error instanceof HttpError
  const statusCode = isHttpError ? error.statusCode : 500
  const message =
    isHttpError ? error.message : 'An unexpected server error occurred.'

  logger.error(message, {
    method: request.method,
    path: request.originalUrl,
    requestId: request.requestId,
    details: error.details ?? null,
    ...(isHttpError ? {} : { cause: error?.message, stack: error?.stack }),
  })

  response.status(statusCode).json({
    success: false,
    error: {
      message,
      details: error.details ?? null,
      requestId: request.requestId,
    },
  })
}
