import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { getGraph } from './graph.controller.js'

export const graphRouter = Router()

graphRouter.use(authenticate)

graphRouter.get('/', getGraph)
