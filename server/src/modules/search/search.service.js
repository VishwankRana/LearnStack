import { HttpError } from '../../lib/http-error.js'
import { semanticSearch } from '../../lib/vector-search.js'

export const searchService = {
  async search(userId, query) {
    const q = query?.trim()
    if (!q) throw new HttpError(400, 'Search query is required.')
    if (q.length > 500) throw new HttpError(400, 'Query must be 500 characters or fewer.')

    const { notes, documents, bookmarks } = await semanticSearch(q, userId)

    // Merge + sort all results by similarity descending for a unified ranked list
    const all = [
      ...notes.map(r => ({ ...r, type: 'note' })),
      ...documents.map(r => ({ ...r, type: 'document' })),
      ...bookmarks.map(r => ({ ...r, type: 'bookmark' })),
    ].sort((a, b) => b.similarity - a.similarity)

    return {
      query: q,
      results: { notes, documents, bookmarks },
      ranked: all,
      total: all.length,
    }
  },
}
