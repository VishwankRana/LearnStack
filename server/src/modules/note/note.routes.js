import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from './note.controller.js'

export const noteRouter = Router()

noteRouter.use(authenticate)

noteRouter.get('/', listNotes)
noteRouter.get('/:id', getNote)
noteRouter.post('/', createNote)
noteRouter.patch('/:id', updateNote)
noteRouter.delete('/:id', deleteNote)
