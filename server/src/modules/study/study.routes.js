import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import {
  generateFlashcards,
  generateQuiz,
  getFlashcardDeck,
  getMaterialsForSource,
  getQuiz,
  listFlashcardDecks,
  listQuizzes,
} from './study.controller.js'

export const studyRouter = Router()

studyRouter.use(authenticate)

studyRouter.get('/materials', getMaterialsForSource)
studyRouter.get('/flashcards', listFlashcardDecks)
studyRouter.post('/flashcards/generate', generateFlashcards)
studyRouter.get('/flashcards/:id', getFlashcardDeck)

studyRouter.get('/quizzes', listQuizzes)
studyRouter.post('/quiz/generate', generateQuiz)
studyRouter.get('/quizzes/:id', getQuiz)
