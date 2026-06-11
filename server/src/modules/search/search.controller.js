import { searchService } from './search.service.js'

export async function search(request, response) {
  const result = await searchService.search(request.user.id, request.query.q)
  response.json({ success: true, data: result })
}
