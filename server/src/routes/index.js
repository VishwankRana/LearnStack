import { Router } from 'express'
import { healthRouter } from './health.js'
import { systemRouter } from '../modules/system/system.routes.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/system', systemRouter)
