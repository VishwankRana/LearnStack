import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import {
  getContentGrowth,
  getDashboardAnalytics,
  getQuizPerformance,
  getStudyHeatmap,
} from './analytics.controller.js'

export const analyticsRouter = Router()

analyticsRouter.use(authenticate)

analyticsRouter.get('/', getDashboardAnalytics)
analyticsRouter.get('/content-growth', getContentGrowth)
analyticsRouter.get('/study-heatmap', getStudyHeatmap)
analyticsRouter.get('/quiz-performance', getQuizPerformance)
