import { Prisma } from '@prisma/client'
import { prisma } from './prisma.js'
import { generateEmbedding } from './embeddings.js'

const SIMILARITY_THRESHOLD = 0.25 // cosine similarity — 0 = unrelated, 1 = identical
const RESULTS_PER_TYPE = 5

/**
 * Store an embedding vector for a Note, Document, or Bookmark.
 * Called fire-and-forget after create/update — never blocks the response.
 */
export async function storeEmbedding(table, id, text) {
  try {
    const embedding = await generateEmbedding(text)
    if (!embedding) return

    const vectorLiteral = `[${embedding.join(',')}]`

    await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET embedding = $1::vector WHERE id = $2`,
      vectorLiteral,
      id,
    )
  } catch (err) {
    // Non-fatal — search simply won't find this item until a retry
    console.error(`[embeddings] Failed to store embedding for ${table} ${id}:`, err?.message)
  }
}

/**
 * Run semantic search across Notes, Documents, and Bookmarks for a given user.
 * Returns results ranked by cosine similarity, grouped by type.
 */
export async function semanticSearch(query, userId) {
  const embedding = await generateEmbedding(query)
  if (!embedding) return { notes: [], documents: [], bookmarks: [] }

  const vec = Prisma.raw(`'[${embedding.join(',')}]'::vector`)
  const threshold = 1 - SIMILARITY_THRESHOLD // convert similarity → distance
  const uid = userId
  const lim = RESULTS_PER_TYPE

  const [notes, documents, bookmarks] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        id, title, content, summary, "collectionId", "createdAt",
        ROUND((1 - (embedding <=> ${vec}))::numeric, 3) AS similarity
      FROM "Note"
      WHERE "userId" = ${uid}
        AND embedding IS NOT NULL
        AND (embedding <=> ${vec}) < ${threshold}
      ORDER BY embedding <=> ${vec}
      LIMIT ${lim}
    `,

    prisma.$queryRaw`
      SELECT
        id, title, "fileUrl", "fileType", "fileSize", summary, "collectionId", "createdAt",
        ROUND((1 - (embedding <=> ${vec}))::numeric, 3) AS similarity
      FROM "Document"
      WHERE "userId" = ${uid}
        AND embedding IS NOT NULL
        AND (embedding <=> ${vec}) < ${threshold}
      ORDER BY embedding <=> ${vec}
      LIMIT ${lim}
    `,

    prisma.$queryRaw`
      SELECT
        id, title, url, description, summary, "collectionId", "createdAt",
        ROUND((1 - (embedding <=> ${vec}))::numeric, 3) AS similarity
      FROM "Bookmark"
      WHERE "userId" = ${uid}
        AND embedding IS NOT NULL
        AND (embedding <=> ${vec}) < ${threshold}
      ORDER BY embedding <=> ${vec}
      LIMIT ${lim}
    `,
  ])

  return {
    notes:     notes.map(r => ({ ...r, type: 'note',     similarity: Number(r.similarity) })),
    documents: documents.map(r => ({ ...r, type: 'document', similarity: Number(r.similarity) })),
    bookmarks: bookmarks.map(r => ({ ...r, type: 'bookmark', similarity: Number(r.similarity) })),
  }
}
