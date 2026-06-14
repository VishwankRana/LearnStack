import { prisma } from '../../lib/prisma.js'

/**
 * Builds the graph payload for a user's knowledge network.
 *
 * Strategy:
 * - Nodes = every note the user owns
 * - Edges = every NoteLink relationship between those notes
 *
 * Notes with no links are still included as isolated nodes so the
 * user can see which notes are disconnected from the network.
 */
export const graphService = {
  async getGraph(userId) {
    const [notes, links] = await Promise.all([
      prisma.note.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          collectionId: true,
          collection: { select: { id: true, name: true, color: true } },
          updatedAt: true,
          _count: {
            select: { outgoingLinks: true, incomingLinks: true },
          },
        },
        orderBy: { title: 'asc' },
      }),

      prisma.noteLink.findMany({
        where: { sourceNote: { userId } },
        select: {
          id: true,
          sourceNoteId: true,
          targetNoteId: true,
        },
      }),
    ])

    const nodes = notes.map((note) => ({
      id: note.id,
      type: 'noteNode',
      position: { x: 0, y: 0 }, // React Flow auto-layout will reposition
      data: {
        label: note.title,
        collection: note.collection ?? null,
        linkCount: note._count.outgoingLinks + note._count.incomingLinks,
      },
    }))

    const edges = links.map((link) => ({
      id: link.id,
      source: link.sourceNoteId,
      target: link.targetNoteId,
      type: 'smoothstep',
    }))

    return {
      nodes,
      edges,
      meta: {
        noteCount: notes.length,
        linkCount: links.length,
      },
    }
  },
}
