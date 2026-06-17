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
  recordFlashcardReview,
  recordQuizAttempt,
} from './study.controller.js'

export const studyRouter = Router()

studyRouter.use(authenticate)

studyRouter.get('/materials', getMaterialsForSource)
studyRouter.get('/flashcards', listFlashcardDecks)
studyRouter.post('/flashcards/generate', generateFlashcards)
studyRouter.get('/flashcards/:id', getFlashcardDeck)
studyRouter.post('/flashcards/:id/review', recordFlashcardReview)

studyRouter.get('/quizzes', listQuizzes)
studyRouter.post('/quiz/generate', generateQuiz)
studyRouter.get('/quizzes/:id', getQuiz)
studyRouter.post('/quizzes/:id/attempt', recordQuizAttempt)
