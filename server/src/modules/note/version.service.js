import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'

const MAX_VERSIONS_PER_NOTE = 50

const versionSelect = {
  id: true,
  noteId: true,
  title: true,
  content: true,
  createdAt: true,
}

export const versionService = {
  /**
   * Creates a snapshot of the note BEFORE it is updated.
   * Called by note.service.update() before writing new content.
   * Prunes oldest versions when the note exceeds MAX_VERSIONS_PER_NOTE.
   */
  async createSnapshot(noteId, title, content) {
    await prisma.noteVersion.create({
      data: { noteId, title, content },
    })

    // Keep only the most recent MAX_VERSIONS_PER_NOTE versions
    const versions = await prisma.noteVersion.findMany({
      where: { noteId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })

    if (versions.length > MAX_VERSIONS_PER_NOTE) {
      const idsToDelete = versions.slice(MAX_VERSIONS_PER_NOTE).map((v) => v.id)
      await prisma.noteVersion.deleteMany({ where: { id: { in: idsToDelete } } })
    }
  },

  /**
   * Returns all versions for a note, newest first.
   */
  async listVersions(noteId, userId) {
    await verifyNoteOwnership(noteId, userId)

    return prisma.noteVersion.findMany({
      where: { noteId },
      orderBy: { createdAt: 'desc' },
      select: versionSelect,
    })
  },

  /**
   * Returns a single version by ID.
   */
  async getVersion(noteId, versionId, userId) {
    await verifyNoteOwnership(noteId, userId)

    const version = await prisma.noteVersion.findUnique({
      where: { id: versionId },
      select: versionSelect,
    })

    if (!version || version.noteId !== noteId) {
      throw new HttpError(404, 'Version not found.')
    }

    return version
  },

  /**
   * Restores a version: saves current content as a new snapshot,
   * then updates the note to the version's title + content.
   */
  async restoreVersion(noteId, versionId, userId) {
    await verifyNoteOwnership(noteId, userId)

    const version = await prisma.noteVersion.findUnique({
      where: { id: versionId },
      select: versionSelect,
    })

    if (!version || version.noteId !== noteId) {
      throw new HttpError(404, 'Version not found.')
    }

    // Snapshot current state before overwriting
    const current = await prisma.note.findUnique({
      where: { id: noteId },
      select: { title: true, content: true },
    })

    if (current) {
      await versionService.createSnapshot(noteId, current.title, current.content)
    }

    // Restore
    const restored = await prisma.note.update({
      where: { id: noteId },
      data: { title: version.title, content: version.content },
      select: {
        id: true, title: true, content: true, summary: true,
        collectionId: true, createdAt: true, updatedAt: true,
        collection: { select: { id: true, name: true, color: true } },
      },
    })

    return restored
  },
}

async function verifyNoteOwnership(noteId, userId) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { userId: true },
  })

  if (!note) throw new HttpError(404, 'Note not found.')
  if (note.userId !== userId) throw new HttpError(403, 'Access denied.')
}
