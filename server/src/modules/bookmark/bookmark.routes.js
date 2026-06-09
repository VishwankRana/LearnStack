import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import {
  createBookmark,
  deleteBookmark,
  getBookmark,
  listBookmarks,
  updateBookmark,
} from './bookmark.controller.js'

export const bookmarkRouter = Router()

bookmarkRouter.use(authenticate)

bookmarkRouter.get('/', listBookmarks)
bookmarkRouter.get('/:id', getBookmark)
bookmarkRouter.post('/', createBookmark)
bookmarkRouter.patch('/:id', updateBookmark)
bookmarkRouter.delete('/:id', deleteBookmark)
