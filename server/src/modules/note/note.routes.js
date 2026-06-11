import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  summarizeNote,
  updateNote,
} from './note.controller.js'

export const noteRouter = Router()

noteRouter.use(authenticate)

noteRouter.get('/', listNotes)
noteRouter.get('/:id', getNote)
noteRouter.post('/', createNote)
noteRouter.post('/:id/summarize', summarizeNote)
noteRouter.patch('/:id', updateNote)
noteRouter.delete('/:id', deleteNote)
