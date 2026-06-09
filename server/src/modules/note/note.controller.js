import { noteService } from './note.service.js'

export async function listNotes(request, response) {
  const { q, collectionId } = request.query

  const notes = await noteService.list(request.user.id, {
    search: q,
    collectionId,
  })

  response.json({ success: true, data: notes })
}

export async function getNote(request, response) {
  const note = await noteService.getById(request.params.id, request.user.id)

  response.json({ success: true, data: note })
}

export async function createNote(request, response) {
  const note = await noteService.create(request.user.id, request.body)

  response.status(201).json({ success: true, data: note })
}

export async function updateNote(request, response) {
  const note = await noteService.update(
    request.params.id,
    request.user.id,
    request.body,
  )

  response.json({ success: true, data: note })
}

export async function deleteNote(request, response) {
  const result = await noteService.remove(request.params.id, request.user.id)

  response.json({ success: true, data: result })
}
