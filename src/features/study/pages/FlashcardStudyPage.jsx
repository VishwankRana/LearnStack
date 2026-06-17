import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useFlashcardDeck, useRecordFlashcardReview } from '../hooks/useStudy';
import '../study.css';

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="14" height="16" rx="2" />
      <rect x="8" y="2" width="14" height="16" rx="2" />
    </svg>
  );
}

export function FlashcardStudyPage() {
  const { id } = useParams();
  const { data: deck, isLoading, isError } = useFlashcardDeck(id);
  const recordReview = useRecordFlashcardReview();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const recordedRef = useRef(false);

  const cards = deck?.flashcards ?? [];
  const currentCard = cards[currentIndex];
  const total = cards.length;

  function goTo(index) {
    setCurrentIndex(index);
    setFlipped(false);
  }

  function handlePrev() {
    if (currentIndex > 0) goTo(currentIndex - 1);
  }

  function handleNext() {
    if (currentIndex < total - 1) goTo(currentIndex + 1);
  }

  function handleFlip() {
    setFlipped((prev) => !prev);
  }

  useEffect(() => {
    if (!id || recordedRef.current || total === 0) return;
    if (currentIndex === total - 1 && flipped) {
      recordedRef.current = true;
      recordReview.mutate(id);
    }
  }, [currentIndex, flipped, id, total, recordReview.mutate]);

  if (isLoading) {
    return (
      <section className="study-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spinner size="lg" />
      </section>
    );
  }

  if (isError || !deck) {
    return (
      <section className="study-page">
        <Link to="/app/notes" className="study-page__back">
          <ArrowLeftIcon /> Back
        </Link>
        <EmptyState
          icon={<CardsIcon />}
          title="Flashcard deck not found"
          description="This deck may have been deleted or you don't have access."
        />
      </section>
    );
  }

  if (total === 0) {
    return (
      <section className="study-page">
        <Link to="/app/notes" className="study-page__back">
          <ArrowLeftIcon /> Back
        </Link>
        <EmptyState
          icon={<CardsIcon />}
          title="No flashcards in this deck"
          description="Try generating flashcards again from your note or document."
        />
      </section>
    );
  }

  return (
    <section className="study-page">
      <Link to="/app/notes" className="study-page__back">
        <ArrowLeftIcon /> Back
      </Link>

      <div className="study-page__header">
        <h1 className="study-page__title">{deck.title}</h1>
        <p className="study-page__meta">
          Card {currentIndex + 1} / {total}
        </p>
      </div>

      <div className="flashcard-study__card-wrap">
        <div
          className={`flashcard-study__card ${flipped ? 'flashcard-study__card--flipped' : ''}`}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFlip(); } }}
          aria-label={flipped ? 'Show question' : 'Show answer'}
        >
          <div className="flashcard-study__face flashcard-study__face--front">
            <span className="flashcard-study__label">Question</span>
            <p className="flashcard-study__text">{currentCard.question}</p>
            <span className="flashcard-study__hint">Click to flip</span>
          </div>
          <div className="flashcard-study__face flashcard-study__face--back">
            <span className="flashcard-study__label">Answer</span>
            <p className="flashcard-study__text">{currentCard.answer}</p>
            <span className="flashcard-study__hint">Click to flip back</span>
          </div>
        </div>
      </div>

      <div className="flashcard-study__controls">
        <span className="flashcard-study__count">
          Card {currentIndex + 1} / {total}
        </span>
        <div className="flashcard-study__nav">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFlip}
          >
            {flipped ? 'Show Question' : 'Flip'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === total - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
