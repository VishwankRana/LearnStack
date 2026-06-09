import { prisma } from '../../lib/prisma.js'

export const dashboardService = {
  async getStats(userId) {
    const [notes, documents, bookmarks, collections] = await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.document.count({ where: { userId } }),
      prisma.bookmark.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
    ])

    return {
      totalNotes: notes,
      totalDocuments: documents,
      totalBookmarks: bookmarks,
      totalCollections: collections,
    }
  },

  async getRecentActivity(userId, limit = 10) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        createdAt: true,
      },
    })
  },

  async getRecentContent(userId, limit = 5) {
    const [notes, documents, bookmarks] = await Promise.all([
      prisma.note.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          createdAt: true,
          collection: { select: { name: true, color: true } },
        },
      }),
      prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          createdAt: true,
          collection: { select: { name: true, color: true } },
        },
      }),
      prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          createdAt: true,
          collection: { select: { name: true, color: true } },
        },
      }),
    ])

    return {
      recentNotes: notes,
      recentDocuments: documents,
      recentBookmarks: bookmarks,
    }
  },

  async logActivity(userId, type, title, description) {
    return prisma.activity.create({
      data: {
        userId,
        type,
        title,
        description,
      },
    })
  },
}
