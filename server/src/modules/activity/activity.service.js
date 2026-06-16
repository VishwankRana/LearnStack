import { prisma } from '../../lib/prisma.js'

export const ACTIVITY_TYPES = {
  NOTE_CREATED:       'NOTE_CREATED',
  NOTE_UPDATED:       'NOTE_UPDATED',
  NOTE_DELETED:       'NOTE_DELETED',
  DOCUMENT_UPLOADED:  'DOCUMENT_UPLOADED',
  DOCUMENT_DELETED:   'DOCUMENT_DELETED',
  BOOKMARK_ADDED:     'BOOKMARK_ADDED',
  BOOKMARK_UPDATED:   'BOOKMARK_UPDATED',
  BOOKMARK_DELETED:   'BOOKMARK_DELETED',
  COLLECTION_CREATED: 'COLLECTION_CREATED',
  COLLECTION_UPDATED: 'COLLECTION_UPDATED',
  COLLECTION_DELETED: 'COLLECTION_DELETED',
  NOTE_COMMITTED:       'NOTE_COMMITTED',
  FLASHCARDS_GENERATED: 'FLASHCARDS_GENERATED',
  QUIZ_GENERATED:       'QUIZ_GENERATED',
}

const activitySelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  userId: true,
  createdAt: true,
}

const PAGE_SIZE = 20

export const activityService = {
  /**
   * Fire-and-forget: log an activity event.
   * Always non-blocking — never throws into the caller.
   */
  async log(userId, type, title, description = null) {
    return prisma.activity.create({
      data: { userId, type, title, description },
      select: activitySelect,
    }).catch(() => {})
  },

  /**
   * Paginated list — cursor-based using createdAt + id for stable ordering.
   */
  async list(userId, { page = 1, limit = PAGE_SIZE } = {}) {
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit) || PAGE_SIZE))
    const safePage  = Math.max(1, parseInt(page) || 1)

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        select: activitySelect,
      }),
      prisma.activity.count({ where: { userId } }),
    ])

    return {
      activities,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        hasMore: safePage * safeLimit < total,
      },
    }
  },

  async recent(userId, limit = 10) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(50, limit),
      select: activitySelect,
    })
  },
}
