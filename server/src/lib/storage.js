import { supabase } from './supabase.js'
import { env } from '../config/env.js'
import { HttpError } from './http-error.js'
import crypto from 'node:crypto'
import path from 'node:path'

const bucket = env.SUPABASE_STORAGE_BUCKET

/**
 * Upload a file buffer to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(buffer, originalName, mimeType, userId) {
  const ext = path.extname(originalName)
  const uniqueName = `${userId}/${crypto.randomUUID()}${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(uniqueName, buffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) {
    throw new HttpError(500, `File upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(uniqueName)

  return {
    fileUrl: data.publicUrl,
    storagePath: uniqueName,
  }
}

/**
 * Delete a file from Supabase Storage by its storage path.
 */
export async function deleteFile(fileUrl) {
  if (!fileUrl) return

  // Extract the storage path from the public URL
  const bucketSegment = `/storage/v1/object/public/${bucket}/`
  const idx = fileUrl.indexOf(bucketSegment)
  if (idx === -1) return

  const storagePath = decodeURIComponent(fileUrl.slice(idx + bucketSegment.length))

  const { error } = await supabase.storage.from(bucket).remove([storagePath])

  if (error) {
    // Log but don't throw — deletion failure shouldn't block the operation
    console.error(`Storage deletion failed for ${storagePath}:`, error.message)
  }
}
