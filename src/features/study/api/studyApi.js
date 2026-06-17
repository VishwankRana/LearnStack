import { apiRequest } from '../../../lib/api';

export function fetchStudyMaterials({ sourceType, sourceId }, token) {
  const params = new URLSearchParams({ sourceType, sourceId });
  return apiRequest(`/study/materials?${params}`, { method: 'GET', token });
}

export function fetchFlashcardDecks(token) {
  return apiRequest('/study/flashcards', { method: 'GET', token });
}

export function fetchFlashcardDeck(id, token) {
  return apiRequest(`/study/flashcards/${id}`, { method: 'GET', token });
}

export function generateFlashcards({ sourceType, sourceId }, token) {
  return apiRequest('/study/flashcards/generate', {
    method: 'POST',
    token,
    body: { sourceType, sourceId },
  });
}

export function fetchQuizzes(token) {
  return apiRequest('/study/quizzes', { method: 'GET', token });
}

export function fetchQuiz(id, token) {
  return apiRequest(`/study/quizzes/${id}`, { method: 'GET', token });
}

export function generateQuiz({ sourceType, sourceId }, token) {
  return apiRequest('/study/quiz/generate', {
    method: 'POST',
    token,
    body: { sourceType, sourceId },
  });
}

export function recordFlashcardReview(deckId, token) {
  return apiRequest(`/study/flashcards/${deckId}/review`, { method: 'POST', token });
}

export function recordQuizAttempt(quizId, { score, total }, token) {
  return apiRequest(`/study/quizzes/${quizId}/attempt`, {
    method: 'POST',
    token,
    body: { score, total },
  });
}
