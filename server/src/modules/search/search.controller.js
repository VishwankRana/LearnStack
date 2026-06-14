import { searchService } from './search.service.js'

export async function globalSearch(request, response) {
  const { q, page, limit } = request.query

  const results = await searchService.search(request.user.id, { q, page, limit })

  response.json({ success: true, data: results })
}
