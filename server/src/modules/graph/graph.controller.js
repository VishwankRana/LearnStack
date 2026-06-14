import { graphService } from './graph.service.js'

export async function getGraph(request, response) {
  const graph = await graphService.getGraph(request.user.id)
  response.json({ success: true, data: graph })
}
