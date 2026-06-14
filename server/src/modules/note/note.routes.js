import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import {
  createNote,
  deleteNote,
  getNote,
  getBacklinks,
  getLinkedNotes,
  listNotes,
  summarizeNote,
  updateNote,
} from './note.controller.js'
import { createSnapshot, listVersions, getVersion, restoreVersion } from './version.controller.js'

export const noteRouter = Router()

noteRouter.use(authenticate)

noteRouter.get('/', listNotes)
noteRouter.get('/:id', getNote)
noteRouter.get('/:id/linked-notes', getLinkedNotes)
noteRouter.get('/:id/backlinks', getBacklinks)
noteRouter.get('/:id/versions', listVersions)
noteRouter.get('/:id/versions/:versionId', getVersion)
noteRouter.post('/', createNote)
noteRouter.post('/:id/snapshot', createSnapshot)
noteRouter.post('/:id/summarize', summarizeNote)
noteRouter.post('/:id/restore/:versionId', restoreVersion)
noteRouter.patch('/:id', updateNote)
noteRouter.delete('/:id', deleteNote)
