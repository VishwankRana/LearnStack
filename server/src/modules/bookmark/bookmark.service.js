import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import { summarizeBookmark } from '../../lib/summarizer.js'

function validateUrl(raw) {
  try {
    const parsed = new URL(raw)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error()
    }
    return parsed.href
  } catch {
    throw new HttpError(400, 'Please enter a valid URL (e.g. https://example.com).')
  }
}

function validateBookmarkPayload(payload) {
  const title = payload.title?.trim()
  const url = payload.url?.trim()
  const description = payload.description?.trim() || null

  if (!title) throw new HttpError(400, 'Bookmark title is required.')
  if (title.length > 255) throw new HttpError(400, 'Title must be 255 characters or fewer.')

  if (!url) throw new HttpError(400, 'Bookmark URL is required.')
  const validatedUrl = validateUrl(url)

  if (description && description.length > 1000) {
    throw new HttpError(400, 'Description must be 1000 characters or fewer.')
  }

  return {
    title,
    url: validatedUrl,
    description,
    collectionId: payload.collectionId || null,
  }
}

const bookmarkSelect = {
  id: true,
  title: true,
  url: true,
  description: true,
  summary: true,
  collectionId: true,
  createdAt: true,
  updatedAt: true,
  collection: {
    select: { id: true, name: true, color: true },
  },
}

export const bookmarkService = {
  async list(userId, { search, collectionId } = {}) {
    const where = { userId }

    if (collectionId) {
      where.collectionId = collectionId
    }

    if (search?.trim()) {
      const term = search.trim()
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { url: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ]
    }

    return prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: bookmarkSelect,
    })
  },

  async getById(id, userId) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
      select: bookmarkSelect,
    })

    if (!bookmark) throw new HttpError(404, 'Bookmark not found.')

    const owner = await prisma.bookmark.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (owner.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this bookmark.')
    }

    return bookmark
  },

  async create(userId, payload) {
    const values = validateBookmarkPayload(payload)

    if (values.collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: values.collectionId },
        select: { userId: true },
      })
      if (!collection || collection.userId !== userId) {
        throw new HttpError(400, 'Collection not found or access denied.')
      }
    }

    return prisma.bookmark.create({
      data: {
        title: values.title,
        url: values.url,
        description: values.description,
        collectionId: values.collectionId,
        userId,
      },
      select: bookmarkSelect,
    })
  },

  async update(id, userId, payload) {
    const existing = await prisma.bookmark.findUnique({
      where: { id },
      select: { userId: true, title: true, url: true, description: true, collectionId: true },
    })

    if (!existing) throw new HttpError(404, 'Bookmark not found.')
    if (existing.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this bookmark.')
    }

    const values = validateBookmarkPayload({
      title: payload.title ?? existing.title,
      url: payload.url ?? existing.url,
      description:
        payload.description !== undefined ? payload.description : existing.description,
      collectionId:
        payload.collectionId !== undefined ? payload.collectionId : existing.collectionId,
    })

    if (values.collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: values.collectionId },
        select: { userId: true },
      })
      if (!collection || collection.userId !== userId) {
        throw new HttpError(400, 'Collection not found or access denied.')
      }
    }

    return prisma.bookmark.update({
      where: { id },
      data: {
        title: values.title,
        url: values.url,
        description: values.description,
        collectionId: values.collectionId,
      },
      select: bookmarkSelect,
    })
  },

  async summarize(id, userId) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
      select: { userId: true, title: true, url: true, description: true },
    })

    if (!bookmark) throw new HttpError(404, 'Bookmark not found.')
    if (bookmark.userId !== userId) throw new HttpError(403, 'You do not have access to this bookmark.')

    const summary = await summarizeBookmark(bookmark.title, bookmark.url, bookmark.description)

    return prisma.bookmark.update({
      where: { id },
      data: { summary },
      select: bookmarkSelect,
    })
  },

  async remove(id, userId) {
    const existing = await prisma.bookmark.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existing) throw new HttpError(404, 'Bookmark not found.')
    if (existing.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this bookmark.')
    }

    await prisma.bookmark.delete({ where: { id } })

    return { message: 'Bookmark deleted successfully.' }
  },
}
