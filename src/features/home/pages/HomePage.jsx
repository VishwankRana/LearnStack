import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/useAuth';
import logo from '../../../assets/studysmarter-logo.svg';
import {
  ContentIcon,
  SparklesIcon,
  TrendUpIcon,
} from '../../dashboard/components/DashboardIcons';
import '../home.css';

const features = [
  {
    title: 'Capture everything',
    description: 'Write notes, upload PDFs, and save bookmarks in organized collections.',
    Icon: ContentIcon,
  },
  {
    title: 'Learn with AI',
    description: 'Generate summaries, flashcards, and quizzes from your own content.',
    Icon: SparklesIcon,
  },
  {
    title: 'Track progress',
    description: 'Dashboard analytics show content growth and quiz performance over time.',
    Icon: TrendUpIcon,
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className="home-page">
      <header className="home-header">
        <Link to="/" className="home-header__brand">
          <img src={logo} alt="" className="home-header__logo" aria-hidden="true" />
          <span className="home-header__brand-name">LearnStack</span>
        </Link>
        <nav className="home-header__nav" aria-label="Account navigation">
          <Link className="home-header__link" to="/login">
            Sign in
          </Link>
          <Link className="home-btn home-btn--primary" to="/register">
            Get started
          </Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Knowledge learning platform</p>
          <h1 className="home-hero__title">
            Store knowledge.
            <span className="home-hero__title-accent"> Learn from it.</span>
          </h1>
          <p className="home-hero__description">
            LearnStack helps you organize notes and documents, then turn them into
            AI-powered study guides, flashcards, and quizzes — all in one place.
          </p>
          <div className="home-hero__actions">
            <Link className="home-btn home-btn--primary" to="/register">
              Get started free
            </Link>
            <Link className="home-btn home-btn--secondary" to="/login">
              Sign in
            </Link>
          </div>
        </div>

        <div className="home-hero__visual" aria-hidden="true">
          <div className="home-hero__card home-hero__card--back" />
          <div className="home-hero__card home-hero__card--mid" />
          <div className="home-hero__card home-hero__card--front">
            <span className="home-hero__card-label">AI Study Guide</span>
            <strong>Key Concepts</strong>
            <ul>
              <li>Definitions & terminology</li>
              <li>Exam-ready summaries</li>
              <li>Quick revision notes</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="home-features">
        <h2 className="home-features__title">Everything you need to learn</h2>
        <div className="home-features__grid">
          {features.map(({ title, description, Icon }) => (
            <article key={title} className="home-feature-card">
              <span className="home-feature-card__icon" aria-hidden="true">
                <Icon />
              </span>
              <h3 className="home-feature-card__title">{title}</h3>
              <p className="home-feature-card__text">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <h2 className="home-cta__title">Ready to build your knowledge vault?</h2>
        <p className="home-cta__text">Create a free account and start learning from your notes today.</p>
        <Link className="home-btn home-btn--primary home-btn--lg" to="/register">
          Create your account
        </Link>
      </section>
    </main>
  );
}
