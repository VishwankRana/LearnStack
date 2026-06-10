import multer from 'multer'
import { HttpError } from '../lib/http-error.js'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const storage = multer.memoryStorage()

function fileFilter(_request, file, callback) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true)
  } else {
    callback(
      new HttpError(
        400,
        'Invalid file type. Only PDF, DOCX, and TXT files are supported.',
      ),
      false,
    )
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
})
