-- Enable pgvector extension (already present on Supabase, idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector(384) embedding columns
ALTER TABLE "Note"     ADD COLUMN IF NOT EXISTS embedding vector(384);
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS embedding vector(384);
ALTER TABLE "Bookmark" ADD COLUMN IF NOT EXISTS embedding vector(384);

-- HNSW indexes for fast cosine-distance approximate nearest-neighbour search
CREATE INDEX IF NOT EXISTS note_embedding_hnsw_idx
  ON "Note"     USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS document_embedding_hnsw_idx
  ON "Document" USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS bookmark_embedding_hnsw_idx
  ON "Bookmark" USING hnsw (embedding vector_cosine_ops);
