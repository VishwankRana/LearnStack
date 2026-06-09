import { dashboardService } from './dashboard.service.js'

export async function getStats(request, response) {
  const stats = await dashboardService.getStats(request.user.id)

  response.json({
    success: true,
    data: stats,
  })
}

export async function getRecentActivity(request, response) {
  const activity = await dashboardService.getRecentActivity(request.user.id, 10)

  response.json({
    success: true,
    data: activity,
  })
}

export async function getRecentContent(request, response) {
  const content = await dashboardService.getRecentContent(request.user.id, 5)

  response.json({
    success: true,
    data: content,
  })
}
