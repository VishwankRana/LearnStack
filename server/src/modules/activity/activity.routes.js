import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { listActivities, recentActivities } from './activity.controller.js'

export const activityRouter = Router()

activityRouter.use(authenticate)

activityRouter.get('/', listActivities)
activityRouter.get('/recent', recentActivities)
