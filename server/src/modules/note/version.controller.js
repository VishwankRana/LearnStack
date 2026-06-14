import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import { versionService } from './version.service.js'
import { activityService, ACTIVITY_TYPES } from '../activity/activity.service.js'

export async function createSnapshot(request, response) {
  const noteId = request.params.id
  const userId = request.user.id

  // Fetch the current note state to snapshot
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { userId: true, title: true, content: true },
  })

  if (!note) throw new HttpError(404, 'Note not found.')
  if (note.userId !== userId) throw new HttpError(403, 'Access denied.')

  await versionService.createSnapshot(noteId, note.title, note.content)
  activityService.log(userId, ACTIVITY_TYPES.NOTE_COMMITTED, `Committed version of "${note.title}"`)

  response.status(201).json({ success: true, data: { message: 'Version committed.' } })
}

export async function listVersions(request, response) {
  const versions = await versionService.listVersions(request.params.id, request.user.id)
  response.json({ success: true, data: versions })
}

export async function getVersion(request, response) {
  const version = await versionService.getVersion(
    request.params.id,
    request.params.versionId,
    request.user.id,
  )
  response.json({ success: true, data: version })
}

export async function restoreVersion(request, response) {
  const note = await versionService.restoreVersion(
    request.params.id,
    request.params.versionId,
    request.user.id,
  )
  response.json({ success: true, data: note })
}
