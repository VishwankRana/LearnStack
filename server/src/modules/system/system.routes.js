import { Router } from 'express'
import { getSystemManifest } from './system.controller.js'

export const systemRouter = Router()

systemRouter.get('/manifest', getSystemManifest)
