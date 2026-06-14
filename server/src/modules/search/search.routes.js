import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { globalSearch } from './search.controller.js'

export const searchRouter = Router()

searchRouter.use(authenticate)

searchRouter.get('/', globalSearch)
