import { documentService } from './document.service.js'

export async function listDocuments(request, response) {
  const { q, collectionId } = request.query

  const documents = await documentService.list(request.user.id, {
    search: q,
    collectionId,
  })

  response.json({ success: true, data: documents })
}

export async function getDocument(request, response) {
  const document = await documentService.getById(
    request.params.id,
    request.user.id,
  )

  response.json({ success: true, data: document })
}

export async function createDocument(request, response) {
  const document = await documentService.create(
    request.user.id,
    request.file,
    request.body,
  )

  response.status(201).json({ success: true, data: document })
}

export async function updateDocument(request, response) {
  const document = await documentService.update(
    request.params.id,
    request.user.id,
    request.body,
  )

  response.json({ success: true, data: document })
}

export async function deleteDocument(request, response) {
  const result = await documentService.remove(
    request.params.id,
    request.user.id,
  )

  response.json({ success: true, data: result })
}

export async function summarizeDocument(request, response) {
  const document = await documentService.summarize(
    request.params.id,
    request.user.id,
  )

  response.json({ success: true, data: document })
}

export async function reextractDocumentText(request, response) {
  const document = await documentService.reextractText(
    request.params.id,
    request.user.id,
  )

  response.json({ success: true, data: document })
}
