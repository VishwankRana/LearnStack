import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useGenerateFlashcards, useGenerateQuiz, useStudyMaterials } from '../hooks/useStudy';
import '../study.css';

function CardsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="14" height="16" rx="2" />
      <rect x="8" y="2" width="14" height="16" rx="2" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function StudyGeneratePanel({ sourceType, sourceId, disabled = false }) {
  const navigate = useNavigate();
  const { data: materials } = useStudyMaterials(sourceType, sourceId);
  const flashcardsMutation = useGenerateFlashcards();
  const quizMutation = useGenerateQuiz();

  const deckId = materials?.deckId;
  const quizId = materials?.quizId;
  const isGenerating = flashcardsMutation.isPending || quizMutation.isPending;
  const error = flashcardsMutation.error || quizMutation.error;

  async function handleGenerateFlashcards() {
    if (deckId) {
      navigate(`/app/study/flashcards/${deckId}`);
      return;
    }
    try {
      const result = await flashcardsMutation.mutateAsync({ sourceType, sourceId });
      navigate(`/app/study/flashcards/${result.deckId}`);
    } catch {
      // error shown via mutation state
    }
  }

  async function handleGenerateQuiz() {
    if (quizId) {
      navigate(`/app/study/quizzes/${quizId}`);
      return;
    }
    try {
      const result = await quizMutation.mutateAsync({ sourceType, sourceId });
      navigate(`/app/study/quizzes/${result.quizId}`);
    } catch {
      // error shown via mutation state
    }
  }

  const hasSavedMaterials = deckId || quizId;

  return (
    <div className="study-generate-panel">
      <div className="study-generate-panel__header">
        <h3 className="study-generate-panel__title">
          <CardsIcon /> Learn from this content
        </h3>
      </div>
      <div className="study-generate-panel__actions">
        <Button
          variant={deckId ? 'primary' : 'secondary'}
          size="sm"
          onClick={handleGenerateFlashcards}
          isLoading={flashcardsMutation.isPending}
          disabled={disabled || isGenerating}
        >
          <CardsIcon /> {deckId ? 'Study Flashcards' : 'Generate Flashcards'}
        </Button>
        <Button
          variant={quizId ? 'primary' : 'secondary'}
          size="sm"
          onClick={handleGenerateQuiz}
          isLoading={quizMutation.isPending}
          disabled={disabled || isGenerating}
        >
          <QuizIcon /> {quizId ? 'Take Quiz' : 'Generate Quiz'}
        </Button>
      </div>
      {error && (
        <p className="study-generate-panel__error">
          {error.message ?? 'Generation failed. Please try again.'}
        </p>
      )}
      {!error && (
        <p className="study-generate-panel__hint">
          {hasSavedMaterials
            ? 'Your flashcards and quiz are saved for this content. Open them anytime without regenerating.'
            : 'AI will create study materials from your content. This may take a few seconds.'}
        </p>
      )}
    </div>
  );
}
