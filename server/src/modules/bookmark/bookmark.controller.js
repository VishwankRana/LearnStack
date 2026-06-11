import { bookmarkService } from './bookmark.service.js'

export async function listBookmarks(request, response) {
  const { q, collectionId } = request.query

  const bookmarks = await bookmarkService.list(request.user.id, {
    search: q,
    collectionId,
  })

  response.json({ success: true, data: bookmarks })
}

export async function getBookmark(request, response) {
  const bookmark = await bookmarkService.getById(
    request.params.id,
    request.user.id,
  )

  response.json({ success: true, data: bookmark })
}

export async function createBookmark(request, response) {
  const bookmark = await bookmarkService.create(request.user.id, request.body)

  response.status(201).json({ success: true, data: bookmark })
}

export async function updateBookmark(request, response) {
  const bookmark = await bookmarkService.update(
    request.params.id,
    request.user.id,
    request.body,
  )

  response.json({ success: true, data: bookmark })
}

export async function deleteBookmark(request, response) {
  const result = await bookmarkService.remove(
    request.params.id,
    request.user.id,
  )

  response.json({ success: true, data: result })
}

export async function summarizeBookmark(request, response) {
  const bookmark = await bookmarkService.summarize(
    request.params.id,
    request.user.id,
  )

  response.json({ success: true, data: bookmark })
}
