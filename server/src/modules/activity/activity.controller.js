import { activityService } from './activity.service.js'

export async function listActivities(request, response) {
  const { page, limit } = request.query
  const result = await activityService.list(request.user.id, { page, limit })
  response.json({ success: true, data: result })
}

export async function recentActivities(request, response) {
  const { limit } = request.query
  const activities = await activityService.recent(request.user.id, limit ? parseInt(limit) : 10)
  response.json({ success: true, data: activities })
}
