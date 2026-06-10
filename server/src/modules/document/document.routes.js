import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { upload } from '../../middleware/upload.js'
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from './document.controller.js'

export const documentRouter = Router()

documentRouter.use(authenticate)

documentRouter.get('/', listDocuments)
documentRouter.get('/:id', getDocument)
documentRouter.post('/', upload.single('file'), createDocument)
documentRouter.patch('/:id', updateDocument)
documentRouter.delete('/:id', deleteDocument)
