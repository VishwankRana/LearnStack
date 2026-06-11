/**
 * One-time setup script: creates the Supabase Storage bucket
 * defined in SUPABASE_STORAGE_BUCKET (default: mindvault-assets).
 *
 * Run from the server/ directory:
 *   node scripts/create-bucket.js
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET = 'mindvault-assets',
} = process.env

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  console.log(`Creating bucket "${SUPABASE_STORAGE_BUCKET}" …`)

  const { data, error } = await supabase.storage.createBucket(SUPABASE_STORAGE_BUCKET, {
    public: true,           // files need public URLs for the viewer/iframe
    fileSizeLimit: 10485760, // 10 MB — matches server upload limit
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
  })

  if (error) {
    if (error.message?.toLowerCase().includes('already exists')) {
      console.log(`✅  Bucket "${SUPABASE_STORAGE_BUCKET}" already exists — nothing to do.`)
    } else {
      console.error('❌  Failed to create bucket:', error.message)
      process.exit(1)
    }
    return
  }

  console.log(`✅  Bucket "${SUPABASE_STORAGE_BUCKET}" created successfully.`, data)
}

main()
