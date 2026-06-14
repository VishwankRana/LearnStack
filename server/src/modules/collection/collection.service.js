import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import { activityService, ACTIVITY_TYPES } from '../activity/activity.service.js'

function validateCollectionPayload(payload) {
  const name = payload.name?.trim()
  const description = payload.description?.trim() || null
  const color = payload.color?.trim() || null

  if (!name) {
    throw new HttpError(400, 'Collection name is required.')
  }

  if (name.length > 60) {
    throw new HttpError(400, 'Collection name must be 60 characters or fewer.')
  }

  if (description && description.length > 500) {
    throw new HttpError(
      400,
      'Collection description must be 500 characters or fewer.',
    )
  }

  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw new HttpError(400, 'Color must be a valid hex code (e.g. #6366f1).')
  }

  return { name, description, color }
}

export const collectionService = {
  async list(userId) {
    return prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            notes: true,
            documents: true,
            bookmarks: true,
          },
        },
      },
    })
  },

  async getById(id, userId) {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            notes: true,
            documents: true,
            bookmarks: true,
          },
        },
      },
    })

    if (!collection) {
      throw new HttpError(404, 'Collection not found.')
    }

    if (collection.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this collection.')
    }

    return collection
  },

  async create(userId, payload) {
    const values = validateCollectionPayload(payload)

    const collection = await prisma.collection.create({
      data: {
        name: values.name,
        description: values.description,
        color: values.color || '#6366f1',
        userId,
      },
      include: {
        _count: {
          select: {
            notes: true,
            documents: true,
            bookmarks: true,
          },
        },
      },
    })

    activityService.log(userId, ACTIVITY_TYPES.COLLECTION_CREATED, `Created collection "${collection.name}"`)

    return collection
  },

  async update(id, userId, payload) {
    const existing = await prisma.collection.findUnique({ where: { id } })

    if (!existing) {
      throw new HttpError(404, 'Collection not found.')
    }

    if (existing.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this collection.')
    }

    const values = validateCollectionPayload({
      name: payload.name ?? existing.name,
      description:
        payload.description !== undefined
          ? payload.description
          : existing.description,
      color: payload.color ?? existing.color,
    })

    const updated = await prisma.collection.update({
      where: { id },
      data: {
        name: values.name,
        description: values.description,
        color: values.color,
      },
      include: {
        _count: {
          select: {
            notes: true,
            documents: true,
            bookmarks: true,
          },
        },
      },
    })

    activityService.log(userId, ACTIVITY_TYPES.COLLECTION_UPDATED, `Updated collection "${updated.name}"`)

    return updated
  },

  async remove(id, userId) {
    const existing = await prisma.collection.findUnique({ where: { id } })

    if (!existing) {
      throw new HttpError(404, 'Collection not found.')
    }

    if (existing.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this collection.')
    }

    await prisma.collection.delete({ where: { id } })
    activityService.log(userId, ACTIVITY_TYPES.COLLECTION_DELETED, `Deleted collection "${existing.name}"`)

    return { message: 'Collection deleted successfully.' }
  },
}
