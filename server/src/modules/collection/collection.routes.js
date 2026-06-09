import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import {
  createCollection,
  deleteCollection,
  getCollection,
  listCollections,
  updateCollection,
} from './collection.controller.js'

export const collectionRouter = Router()

collectionRouter.use(authenticate)

collectionRouter.get('/', listCollections)
collectionRouter.get('/:id', getCollection)
collectionRouter.post('/', createCollection)
collectionRouter.patch('/:id', updateCollection)
collectionRouter.delete('/:id', deleteCollection)
