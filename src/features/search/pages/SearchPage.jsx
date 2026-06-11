import { useState, useDeferredValue } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Spinner } from '../../../components/ui/Spinner';
import { useSearch } from '../hooks/useSearch';
import '../search.css';

/* ── Icons ── */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 12h4" /><path d="M10 16h4" />
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}
function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" /><path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

/* ── Helpers ── */
function similarityLabel(score) {
  if (score >= 0.75) return { label: 'Strong match', cls: 'strong' };
  if (score >= 0.5)  return { label: 'Good match',   cls: 'good' };
  return               { label: 'Related',           cls: 'weak' };
}

function SimilarityBadge({ score }) {
  const { label, cls } = similarityLabel(score);
  return (
    <span className={`search-result__badge search-result__badge--${cls}`}>
      {Math.round(score * 100)}% — {label}
    </span>
  );
}

function snippet(text, maxWords = 30) {
  if (!text) return null;
  const words = text.replace(/[#*>`_\[\]]/g, '').split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(' ') + (words.length > maxWords ? '…' : '');
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Result cards ── */
function NoteResult({ item }) {
  return (
    <Link to={`/app/notes/${item.id}`} className="search-result search-result--note">
      <div className="search-result__icon"><NoteIcon /></div>
      <div className="search-result__body">
        <div className="search-result__meta">
          <span className="search-result__type">Note</span>
          <SimilarityBadge score={item.similarity} />
        </div>
        <h3 className="search-result__title">{item.title}</h3>
        {item.summary
          ? <p className="search-result__excerpt">{snippet(item.summary)}</p>
          : item.content && <p className="search-result__excerpt">{snippet(item.content)}</p>
        }
        <span className="search-result__date">{formatDate(item.createdAt)}</span>
      </div>
    </Link>
  );
}

function DocumentResult({ item }) {
  return (
    <Link to={`/app/documents/${item.id}`} className="search-result search-result--document">
      <div className="search-result__icon"><DocIcon /></div>
      <div className="search-result__body">
        <div className="search-result__meta">
          <span className="search-result__type">Document</span>
          <SimilarityBadge score={item.similarity} />
        </div>
        <h3 className="search-result__title">{item.title}</h3>
        {item.summary && <p className="search-result__excerpt">{snippet(item.summary)}</p>}
        <span className="search-result__date">{formatDate(item.createdAt)}</span>
      </div>
    </Link>
  );
}

function BookmarkResult({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="search-result search-result--bookmark"
    >
      <div className="search-result__icon"><BookmarkIcon /></div>
      <div className="search-result__body">
        <div className="search-result__meta">
          <span className="search-result__type">Bookmark</span>
          <SimilarityBadge score={item.similarity} />
        </div>
        <h3 className="search-result__title">
          {item.title} <ExternalLinkIcon />
        </h3>
        {item.description && <p className="search-result__excerpt">{snippet(item.description)}</p>}
        <span className="search-result__date">{formatDate(item.createdAt)}</span>
      </div>
    </a>
  );
}

function ResultCard({ item }) {
  if (item.type === 'note')     return <NoteResult     item={item} />;
  if (item.type === 'document') return <DocumentResult item={item} />;
  if (item.type === 'bookmark') return <BookmarkResult item={item} />;
  return null;
}

/* ══════════════════════════════════════════════════
   SearchPage
   ══════════════════════════════════════════════════ */
export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get('q') ?? '');
  const deferredQuery = useDeferredValue(input);

  const { data, isLoading, isFetching, isError } = useSearch(deferredQuery);

  const results = data?.ranked ?? [];
  const hasQuery = deferredQuery.trim().length >= 3;
  const isEmpty  = hasQuery && !isLoading && !isFetching && results.length === 0;

  function handleChange(e) {
    const val = e.target.value;
    setInput(val);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  return (
    <section className="search-page">
      {/* ── Hero / Search bar ── */}
      <div className="search-page__hero">
        <div className="search-page__hero-text">
          <span className="search-page__eyebrow">
            <SparklesIcon /> Semantic Search
          </span>
          <h2 className="search-page__title">Search your knowledge</h2>
          <p className="search-page__subtitle">
            Ask in plain language — AI finds the most relevant notes, documents,
            and bookmarks across your entire vault.
          </p>
        </div>

        <div className="search-page__input-wrap">
          <span className="search-page__input-icon"><SearchIcon /></span>
          <input
            type="search"
            className="search-page__input"
            placeholder='e.g. "How does JWT authentication work?"'
            value={input}
            onChange={handleChange}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          {(isLoading || isFetching) && hasQuery && (
            <span className="search-page__input-spinner"><Spinner size="sm" /></span>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="search-page__results">
        {!hasQuery && (
          <div className="search-page__empty">
            <span className="search-page__empty-icon"><SearchIcon /></span>
            <p>Type at least 3 characters to start searching.</p>
          </div>
        )}

        {isEmpty && (
          <div className="search-page__empty">
            <span className="search-page__empty-icon"><SparklesIcon /></span>
            <p>No semantic matches found for <strong>&ldquo;{deferredQuery}&rdquo;</strong>.</p>
            <p className="search-page__empty-hint">
              Try rephrasing, or create/update content — embeddings generate automatically.
            </p>
          </div>
        )}

        {isError && (
          <div className="search-page__error">
            Search failed. Make sure the server is running and the embedding model has loaded.
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="search-page__count">
              {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
              <strong>&ldquo;{data.query}&rdquo;</strong>
            </p>
            <div className="search-page__list">
              {results.map((item) => (
                <ResultCard key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
