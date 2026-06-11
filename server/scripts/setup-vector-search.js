/**
 * One-time setup script: enables pgvector and adds embedding columns.
 * Run from the server/ directory:
 *   node scripts/setup-vector-search.js
 */
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
})

async function main() {
  console.log('Setting up pgvector and embedding columns…')

  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`)
  console.log('✓  pgvector extension enabled')

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS embedding vector(384)`,
  )
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS embedding vector(384)`,
  )
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Bookmark" ADD COLUMN IF NOT EXISTS embedding vector(384)`,
  )
  console.log('✓  Embedding columns added')

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS note_embedding_hnsw_idx ON "Note" USING hnsw (embedding vector_cosine_ops)`,
  )
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS document_embedding_hnsw_idx ON "Document" USING hnsw (embedding vector_cosine_ops)`,
  )
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS bookmark_embedding_hnsw_idx ON "Bookmark" USING hnsw (embedding vector_cosine_ops)`,
  )
  console.log('✓  HNSW indexes created')

  console.log('\n✅  Vector search setup complete.')
}

main()
  .catch((e) => { console.error('❌ Setup failed:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
