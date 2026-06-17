import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useQuiz, useRecordQuizAttempt } from '../hooks/useStudy';
import '../study.css';

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
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

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function getOptionText(question, letter) {
  const map = { A: question.optionA, B: question.optionB, C: question.optionC, D: question.optionD };
  return map[letter];
}

export function QuizPage() {
  const { id } = useParams();
  const { data: quiz, isLoading, isError } = useQuiz(id);
  const recordAttempt = useRecordQuizAttempt();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const recordedRef = useRef(false);

  const questions = quiz?.questions ?? [];

  function handleSelect(questionId, letter) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  }

  function handleSubmit() {
    if (questions.length === 0) return;
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) return;
    setSubmitted(true);
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
    recordedRef.current = false;
  }

  const score = submitted
    ? questions.filter((q) => answers[q.id] === q.correctAnswer).length
    : 0;
  const total = questions.length;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const allAnswered = questions.every((q) => answers[q.id]);

  useEffect(() => {
    if (!submitted || !id || recordedRef.current || total === 0) return;
    recordedRef.current = true;
    recordAttempt.mutate({ quizId: id, score, total });
  }, [submitted, id, score, total, recordAttempt.mutate]);

  if (isLoading) {
    return (
      <section className="study-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spinner size="lg" />
      </section>
    );
  }

  if (isError || !quiz) {
    return (
      <section className="study-page">
        <Link to="/app/notes" className="study-page__back">
          <ArrowLeftIcon /> Back
        </Link>
        <EmptyState
          icon={<QuizIcon />}
          title="Quiz not found"
          description="This quiz may have been deleted or you don't have access."
        />
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="study-page">
        <Link to="/app/notes" className="study-page__back">
          <ArrowLeftIcon /> Back
        </Link>

        <div className="quiz-page__results">
          <h1 className="study-page__title">{quiz.title}</h1>
          <p className="quiz-page__score">{score} / {total}</p>
          <p className="quiz-page__score-label">{percent}%</p>
          <Button variant="secondary" size="md" onClick={handleRetry}>
            Try Again
          </Button>
        </div>

        <div className="quiz-page__review">
          {questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;

            return (
              <div key={q.id} className="quiz-page__review-item">
                <h4>Question {index + 1}: {q.question}</h4>
                <p style={{ margin: '0 0 8px', fontSize: '0.875rem' }}>
                  Your answer: {userAnswer}. Correct answer: {q.correctAnswer}.
                  {isCorrect ? ' ✓' : ' ✗'}
                </p>
                <p className="quiz-page__explanation">{q.explanation}</p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="study-page">
      <Link to="/app/notes" className="study-page__back">
        <ArrowLeftIcon /> Back
      </Link>

      <div className="study-page__header">
        <h1 className="study-page__title">{quiz.title}</h1>
        <p className="quiz-page__progress">
          {Object.keys(answers).length} of {total} answered
        </p>
      </div>

      {questions.map((q, index) => (
        <div key={q.id} className="quiz-page__question">
          <p className="quiz-page__question-text">
            {index + 1}. {q.question}
          </p>
          <div className="quiz-page__options">
            {OPTION_KEYS.map((letter) => {
              const selected = answers[q.id] === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  className={`quiz-page__option ${selected ? 'quiz-page__option--selected' : ''}`}
                  onClick={() => handleSelect(q.id, letter)}
                >
                  <span className="quiz-page__option-letter">{letter}</span>
                  <span>{getOptionText(q, letter)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="quiz-page__actions">
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={!allAnswered}
        >
          Submit Quiz
        </Button>
      </div>
    </section>
  );
}
