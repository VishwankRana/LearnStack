import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 10

function buildPagination(page, limit) {
  const safePage = Math.max(1, parseInt(page) || 1)
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT))
  return { skip: (safePage - 1) * safeLimit, take: safeLimit, page: safePage, limit: safeLimit }
}

export const searchService = {
  async search(userId, { q, page = 1, limit = DEFAULT_LIMIT } = {}) {
    const term = q?.trim()

    if (!term) {
      throw new HttpError(400, 'Search query is required.')
    }

    if (term.length < 1) {
      throw new HttpError(400, 'Search query must be at least 1 character.')
    }

    const { skip, take } = buildPagination(page, limit)

    const containsFilter = { contains: term, mode: 'insensitive' }

    const [notes, documents, bookmarks, collections] = await Promise.all([
      prisma.note.findMany({
        where: {
          userId,
          OR: [
            { title: containsFilter },
            { content: containsFilter },
            { summary: containsFilter },
          ],
        },
        select: {
          id: true,
          title: true,
          summary: true,
          collectionId: true,
          createdAt: true,
          updatedAt: true,
          collection: { select: { id: true, name: true, color: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),

      prisma.document.findMany({
        where: {
          userId,
          OR: [
            { title: containsFilter },
            { summary: containsFilter },
            { extractedText: containsFilter },
          ],
        },
        select: {
          id: true,
          title: true,
          fileType: true,
          fileSize: true,
          summary: true,
          collectionId: true,
          createdAt: true,
          updatedAt: true,
          collection: { select: { id: true, name: true, color: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),

      prisma.bookmark.findMany({
        where: {
          userId,
          OR: [
            { title: containsFilter },
            { url: containsFilter },
            { description: containsFilter },
            { summary: containsFilter },
          ],
        },
        select: {
          id: true,
          title: true,
          url: true,
          description: true,
          summary: true,
          collectionId: true,
          createdAt: true,
          updatedAt: true,
          collection: { select: { id: true, name: true, color: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),

      prisma.collection.findMany({
        where: {
          userId,
          OR: [
            { name: containsFilter },
            { description: containsFilter },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { notes: true, bookmarks: true, documents: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
    ])

    return {
      notes,
      documents,
      bookmarks,
      collections,
      meta: {
        query: term,
        total: notes.length + documents.length + bookmarks.length + collections.length,
      },
    }
  },
}
