import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import { uploadFile, deleteFile } from '../../lib/storage.js'
import { extractText } from '../../lib/text-extractor.js'

const documentSelect = {
  id: true,
  title: true,
  fileUrl: true,
  fileType: true,
  fileSize: true,
  extractedText: true,
  summary: true,
  collectionId: true,
  createdAt: true,
  updatedAt: true,
  collection: {
    select: { id: true, name: true, color: true },
  },
}

// For list queries — omit extractedText (can be large)
const documentListSelect = {
  id: true,
  title: true,
  fileUrl: true,
  fileType: true,
  fileSize: true,
  summary: true,
  collectionId: true,
  createdAt: true,
  updatedAt: true,
  collection: {
    select: { id: true, name: true, color: true },
  },
}

export const documentService = {
  async list(userId, { search, collectionId } = {}) {
    const where = { userId }

    if (collectionId) {
      where.collectionId = collectionId
    }

    if (search?.trim()) {
      const term = search.trim()
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
      ]
    }

    return prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: documentListSelect,
    })
  },

  async getById(id, userId) {
    const doc = await prisma.document.findUnique({
      where: { id },
      select: documentSelect,
    })

    if (!doc) {
      throw new HttpError(404, 'Document not found.')
    }

    const owner = await prisma.document.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (owner.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this document.')
    }

    return doc
  },

  async create(userId, file, payload) {
    if (!file) {
      throw new HttpError(400, 'A file is required.')
    }

    const title = payload.title?.trim() || file.originalname
    const collectionId = payload.collectionId || null

    if (title.length > 255) {
      throw new HttpError(400, 'Title must be 255 characters or fewer.')
    }

    // Validate collection ownership
    if (collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: collectionId },
        select: { userId: true },
      })
      if (!collection || collection.userId !== userId) {
        throw new HttpError(400, 'Collection not found or access denied.')
      }
    }

    // Upload to Supabase Storage
    const { fileUrl } = await uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      userId,
    )

    // Extract text (non-blocking for the create flow)
    const extractedText = await extractText(file.buffer, file.mimetype)

    return prisma.document.create({
      data: {
        title,
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        extractedText: extractedText || null,
        collectionId,
        userId,
      },
      select: documentSelect,
    })
  },

  async update(id, userId, payload) {
    const existing = await prisma.document.findUnique({
      where: { id },
      select: { userId: true, title: true, collectionId: true },
    })

    if (!existing) {
      throw new HttpError(404, 'Document not found.')
    }

    if (existing.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this document.')
    }

    const title = (payload.title ?? existing.title).trim()
    const collectionId =
      payload.collectionId !== undefined
        ? payload.collectionId || null
        : existing.collectionId

    if (!title) {
      throw new HttpError(400, 'Document title is required.')
    }

    if (title.length > 255) {
      throw new HttpError(400, 'Title must be 255 characters or fewer.')
    }

    if (collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: collectionId },
        select: { userId: true },
      })
      if (!collection || collection.userId !== userId) {
        throw new HttpError(400, 'Collection not found or access denied.')
      }
    }

    return prisma.document.update({
      where: { id },
      data: { title, collectionId },
      select: documentSelect,
    })
  },

  async remove(id, userId) {
    const existing = await prisma.document.findUnique({
      where: { id },
      select: { userId: true, fileUrl: true },
    })

    if (!existing) {
      throw new HttpError(404, 'Document not found.')
    }

    if (existing.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this document.')
    }

    // Delete from Supabase Storage
    await deleteFile(existing.fileUrl)

    // Delete from database
    await prisma.document.delete({ where: { id } })

    return { message: 'Document deleted successfully.' }
  },
}
