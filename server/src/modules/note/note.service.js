import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import { summarizeNote } from '../../lib/summarizer.js'
import { activityService, ACTIVITY_TYPES } from '../activity/activity.service.js'

function validateNotePayload(payload) {
  const title = payload.title?.trim()
  const content = payload.content ?? ''

  if (!title) {
    throw new HttpError(400, 'Note title is required.')
  }

  if (title.length > 255) {
    throw new HttpError(400, 'Title must be 255 characters or fewer.')
  }

  return {
    title,
    content,
    collectionId: payload.collectionId || null,
  }
}

const noteSelect = {
  id: true,
  title: true,
  content: true,
  summary: true,
  collectionId: true,
  createdAt: true,
  updatedAt: true,
  collection: {
    select: { id: true, name: true, color: true },
  },
}

export const noteService = {
  async list(userId, { search, collectionId } = {}) {
    const where = { userId }

    if (collectionId) {
      where.collectionId = collectionId
    }

    if (search?.trim()) {
      const term = search.trim()
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
      ]
    }

    return prisma.note.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: noteSelect,
    })
  },

  async getById(id, userId) {
    const note = await prisma.note.findUnique({
      where: { id },
      select: noteSelect,
    })

    if (!note) {
      throw new HttpError(404, 'Note not found.')
    }

    // Re-fetch to verify ownership without exposing userId in select
    const owner = await prisma.note.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (owner.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this note.')
    }

    return note
  },

  async create(userId, payload) {
    const values = validateNotePayload(payload)

    if (values.collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: values.collectionId },
        select: { userId: true },
      })
      if (!collection || collection.userId !== userId) {
        throw new HttpError(400, 'Collection not found or access denied.')
      }
    }

    const note = await prisma.note.create({
      data: {
        title: values.title,
        content: values.content,
        collectionId: values.collectionId,
        userId,
      },
      select: noteSelect,
    })

    activityService.log(userId, ACTIVITY_TYPES.NOTE_CREATED, `Created note "${note.title}"`)

    return note
  },

  async update(id, userId, payload) {
    const existing = await prisma.note.findUnique({
      where: { id },
      select: { userId: true, title: true, content: true, collectionId: true },
    })

    if (!existing) {
      throw new HttpError(404, 'Note not found.')
    }

    if (existing.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this note.')
    }

    const values = validateNotePayload({
      title: payload.title ?? existing.title,
      content: payload.content !== undefined ? payload.content : existing.content,
      collectionId:
        payload.collectionId !== undefined
          ? payload.collectionId
          : existing.collectionId,
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

    const updated = await prisma.note.update({
      where: { id },
      data: {
        title: values.title,
        content: values.content,
        collectionId: values.collectionId,
      },
      select: noteSelect,
    })

    activityService.log(userId, ACTIVITY_TYPES.NOTE_UPDATED, `Updated note "${updated.title}"`)

    return updated
  },

  async summarize(id, userId) {
    const note = await prisma.note.findUnique({
      where: { id },
      select: { userId: true, title: true, content: true, summary: true },
    })

    if (!note) throw new HttpError(404, 'Note not found.')
    if (note.userId !== userId) throw new HttpError(403, 'You do not have access to this note.')

    if (note.summary?.trim()) {
      return prisma.note.findUnique({
        where: { id },
        select: noteSelect,
      })
    }

    const summary = await summarizeNote(note.title, note.content)

    return prisma.note.update({
      where: { id },
      data: { summary },
      select: noteSelect,
    })
  },

  async remove(id, userId) {
    const existing = await prisma.note.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existing) {
      throw new HttpError(404, 'Note not found.')
    }

    if (existing.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this note.')
    }

    await prisma.note.delete({ where: { id } })
    activityService.log(userId, ACTIVITY_TYPES.NOTE_DELETED, `Deleted a note`)

    return { message: 'Note deleted successfully.' }
  },
}
