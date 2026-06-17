import { analyticsService } from './analytics.service.js'

export async function getDashboardAnalytics(request, response) {
  const data = await analyticsService.getDashboardAnalytics(request.user.id)
  response.json({ success: true, data })
}

export async function getContentGrowth(request, response) {
  const { weeks } = request.query
  const data = await analyticsService.getContentGrowth(request.user.id, weeks)
  response.json({ success: true, data })
}

export async function getStudyHeatmap(request, response) {
  const { days } = request.query
  const data = await analyticsService.getStudyHeatmap(request.user.id, days)
  response.json({ success: true, data })
}

export async function getQuizPerformance(request, response) {
  const data = await analyticsService.getQuizPerformance(request.user.id)
  response.json({ success: true, data })
}
