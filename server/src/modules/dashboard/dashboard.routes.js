import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { getRecentActivity, getRecentContent, getStats } from './dashboard.controller.js'

export const dashboardRouter = Router()

dashboardRouter.get('/stats', authenticate, getStats)
dashboardRouter.get('/recent-activity', authenticate, getRecentActivity)
dashboardRouter.get('/recent-content', authenticate, getRecentContent)
