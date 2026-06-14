import { prisma } from '../../lib/prisma.js'
import { parseWikiLinks } from '../../lib/link-parser.js'

const noteLinkNoteSelect = {
  id: true,
  title: true,
  summary: true,
  collectionId: true,
  collection: { select: { id: true, name: true, color: true } },
  updatedAt: true,
}

export const noteLinkService = {
  /**
   * Parses [[wiki links]] in the note content, resolves titles to note IDs
   * (within the same user), then replaces all outgoing links for that note
   * atomically.
   */
  async syncLinks(noteId, userId, content) {
    const referencedTitles = parseWikiLinks(content)

    if (referencedTitles.length === 0) {
      await prisma.noteLink.deleteMany({ where: { sourceNoteId: noteId } })
      return
    }

    const targetNotes = await prisma.note.findMany({
      where: {
        userId,
        title: { in: referencedTitles, mode: 'insensitive' },
        id: { not: noteId },
      },
      select: { id: true },
    })

    const targetIds = targetNotes.map((n) => n.id)

    await prisma.$transaction([
      prisma.noteLink.deleteMany({ where: { sourceNoteId: noteId } }),
      ...targetIds.map((targetNoteId) =>
        prisma.noteLink.upsert({
          where: { sourceNoteId_targetNoteId: { sourceNoteId: noteId, targetNoteId } },
          create: { sourceNoteId: noteId, targetNoteId },
          update: {},
        }),
      ),
    ])
  },

  /**
   * Returns all notes that this note links TO (outgoing links).
   */
  async getLinkedNotes(noteId, userId) {
    await verifyNoteOwnership(noteId, userId)

    const links = await prisma.noteLink.findMany({
      where: { sourceNoteId: noteId },
      select: { targetNote: { select: noteLinkNoteSelect } },
      orderBy: { createdAt: 'asc' },
    })

    return links.map((l) => l.targetNote)
  },

  /**
   * Returns all notes that link TO this note (backlinks / incoming links).
   */
  async getBacklinks(noteId, userId) {
    await verifyNoteOwnership(noteId, userId)

    const links = await prisma.noteLink.findMany({
      where: { targetNoteId: noteId },
      select: { sourceNote: { select: noteLinkNoteSelect } },
      orderBy: { createdAt: 'asc' },
    })

    return links.map((l) => l.sourceNote)
  },
}

async function verifyNoteOwnership(noteId, userId) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { userId: true },
  })

  if (!note) {
    const { HttpError } = await import('../../lib/http-error.js')
    throw new HttpError(404, 'Note not found.')
  }

  if (note.userId !== userId) {
    const { HttpError } = await import('../../lib/http-error.js')
    throw new HttpError(403, 'You do not have access to this note.')
  }
}
