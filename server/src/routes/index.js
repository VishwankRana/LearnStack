import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.routes.js'
import { collectionRouter } from '../modules/collection/collection.routes.js'
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js'
import { noteRouter } from '../modules/note/note.routes.js'
import { healthRouter } from './health.js'
import { systemRouter } from '../modules/system/system.routes.js'

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/collections', collectionRouter)
apiRouter.use('/dashboard', dashboardRouter)
apiRouter.use('/notes', noteRouter)
apiRouter.use('/health', healthRouter)
apiRouter.use('/system', systemRouter)

