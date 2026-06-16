import { studyService } from './study.service.js'

export async function listFlashcardDecks(request, response) {
  const decks = await studyService.listFlashcardDecks(request.user.id)
  response.json({ success: true, data: decks })
}

export async function getFlashcardDeck(request, response) {
  const deck = await studyService.getFlashcardDeck(request.params.id, request.user.id)
  response.json({ success: true, data: deck })
}

export async function getMaterialsForSource(request, response) {
  const { sourceType, sourceId } = request.query
  const materials = await studyService.getMaterialsForSource(request.user.id, {
    sourceType,
    sourceId,
  })
  response.json({ success: true, data: materials })
}

export async function generateFlashcards(request, response) {
  const result = await studyService.generateFlashcards(request.user.id, request.body)
  response.status(result.existing ? 200 : 201).json({ success: true, data: result })
}

export async function listQuizzes(request, response) {
  const quizzes = await studyService.listQuizzes(request.user.id)
  response.json({ success: true, data: quizzes })
}

export async function getQuiz(request, response) {
  const quiz = await studyService.getQuiz(request.params.id, request.user.id)
  response.json({ success: true, data: quiz })
}

export async function generateQuiz(request, response) {
  const result = await studyService.generateQuiz(request.user.id, request.body)
  response.status(result.existing ? 200 : 201).json({ success: true, data: result })
}
