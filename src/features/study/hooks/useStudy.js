import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/useAuth';
import {
  fetchFlashcardDeck,
  fetchFlashcardDecks,
  fetchQuiz,
  fetchQuizzes,
  fetchStudyMaterials,
  generateFlashcards,
  generateQuiz,
} from '../api/studyApi';

export const FLASHCARD_DECKS_KEY = ['flashcard-decks'];
export const QUIZZES_KEY = ['quizzes'];
export const STUDY_MATERIALS_KEY = ['study-materials'];

export function useStudyMaterials(sourceType, sourceId) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...STUDY_MATERIALS_KEY, sourceType, sourceId],
    queryFn: () => fetchStudyMaterials({ sourceType, sourceId }, token),
    enabled: !!token && !!sourceType && !!sourceId,
  });
}

export function useFlashcardDecks() {
  const { token } = useAuth();

  return useQuery({
    queryKey: FLASHCARD_DECKS_KEY,
    queryFn: () => fetchFlashcardDecks(token),
    enabled: !!token,
  });
}

export function useFlashcardDeck(id) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...FLASHCARD_DECKS_KEY, id],
    queryFn: () => fetchFlashcardDeck(id, token),
    enabled: !!token && !!id,
  });
}

export function useGenerateFlashcards() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => generateFlashcards(payload, token),
    onSuccess: (_result, payload) => {
      queryClient.invalidateQueries({ queryKey: FLASHCARD_DECKS_KEY });
      queryClient.invalidateQueries({ queryKey: ['recent-content'] });
      if (payload?.sourceType && payload?.sourceId) {
        queryClient.invalidateQueries({
          queryKey: [...STUDY_MATERIALS_KEY, payload.sourceType, payload.sourceId],
        });
      }
    },
  });
}

export function useQuizzes() {
  const { token } = useAuth();

  return useQuery({
    queryKey: QUIZZES_KEY,
    queryFn: () => fetchQuizzes(token),
    enabled: !!token,
  });
}

export function useQuiz(id) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...QUIZZES_KEY, id],
    queryFn: () => fetchQuiz(id, token),
    enabled: !!token && !!id,
  });
}

export function useGenerateQuiz() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => generateQuiz(payload, token),
    onSuccess: (_result, payload) => {
      queryClient.invalidateQueries({ queryKey: QUIZZES_KEY });
      queryClient.invalidateQueries({ queryKey: ['recent-content'] });
      if (payload?.sourceType && payload?.sourceId) {
        queryClient.invalidateQueries({
          queryKey: [...STUDY_MATERIALS_KEY, payload.sourceType, payload.sourceId],
        });
      }
    },
  });
}
