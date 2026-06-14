import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch'
import { Spinner } from '../../../components/ui/Spinner'
import '../search.css'

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function SearchInputIcon() {
  return (
    <svg className="search-page__input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="6" />
      <path d="m15 15 3 3" strokeLinecap="round" />
    </svg>
  )
}

const TYPE_CONFIG = {
  note:       { icon: '📝', label: 'Notes',       iconClass: 'search-page__result-icon--note' },
  document:   { icon: '📄', label: 'Documents',   iconClass: 'search-page__result-icon--document' },
  bookmark:   { icon: '🔖', label: 'Bookmarks',   iconClass: 'search-page__result-icon--bookmark' },
  collection: { icon: '📁', label: 'Collections', iconClass: 'search-page__result-icon--collection' },
}

function getHref(type, item) {
  if (type === 'note') return `/app/notes/${item.id}`
  if (type === 'document') return `/app/documents/${item.id}`
  if (type === 'bookmark') return `/app/bookmarks`
  if (type === 'collection') return `/app/collections/${item.id}`
  return '/app'
}

function getMeta(type, item) {
  if (type === 'note') {
    const parts = []
    if (item.collection?.name) parts.push(`in ${item.collection.name}`)
    if (item.summary) parts.push(item.summary.slice(0, 80))
    return parts.join(' · ') || null
  }
  if (type === 'document') return item.summary?.slice(0, 80) || item.fileType || null
  if (type === 'bookmark') return item.url || item.description?.slice(0, 80) || null
  if (type === 'collection') return item.description?.slice(0, 80) || null
  return null
}

function ResultSection({ type, items }) {
  if (!items?.length) return null
  const config = TYPE_CONFIG[type]

  return (
    <section className="search-page__section">
      <div className="search-page__section-header">
        <h2 className="search-page__section-title">
          <span>{config.icon}</span>
          {config.label}
        </h2>
        <span className="search-page__section-count">{items.length}</span>
      </div>
      <div className="search-page__section-list">
        {items.map((item) => {
          const href = getHref(type, item)
          const title = type === 'collection' ? item.name : item.title
          const meta = getMeta(type, item)

          return (
            <Link key={item.id} to={href} className="search-page__result-row">
              <span className={`search-page__result-icon ${config.iconClass}`}>
                {config.icon}
              </span>
              <span className="search-page__result-body">
                <span className="search-page__result-title">{title}</span>
                {meta && <span className="search-page__result-meta">{meta}</span>}
              </span>
              <span className="search-page__result-arrow">→</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(initialQ)
  const inputRef = useRef(null)
  const debouncedQuery = useDebounce(inputValue, 400)

  const { data, isFetching, isError } = useSearch(debouncedQuery)

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setSearchParams({ q: debouncedQuery }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [debouncedQuery, setSearchParams])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const hasResults = data && (
    data.notes.length > 0 ||
    data.documents.length > 0 ||
    data.bookmarks.length > 0 ||
    data.collections.length > 0
  )

  const showEmpty = !isFetching && debouncedQuery.trim() && !isError && !hasResults
  const showHint  = !debouncedQuery.trim()

  return (
    <div className="search-page">
      <header className="search-page__header">
        <p className="search-page__eyebrow">MindVault</p>
        <h1 className="search-page__title">Global Search</h1>
        <p className="search-page__subtitle">
          Search across notes, documents, bookmarks, and collections.
        </p>
      </header>

      <div className="search-page__input-wrap">
        <SearchInputIcon />
        <input
          ref={inputRef}
          type="search"
          className="search-page__input"
          placeholder="Type to search your knowledge base…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      {isFetching && (
        <div className="search-page__loading">
          <Spinner size="md" />
          Searching…
        </div>
      )}

      {!isFetching && showHint && (
        <div className="search-page__empty">
          <span className="search-page__empty-icon">🔍</span>
          <h2 className="search-page__empty-title">What are you looking for?</h2>
          <p className="search-page__empty-text">
            Start typing to search notes, documents, bookmarks, and collections all at once.
          </p>
        </div>
      )}

      {!isFetching && showEmpty && (
        <div className="search-page__no-results">
          <span className="search-page__no-results-icon">😶‍🌫️</span>
          <h2 className="search-page__no-results-title">No results found</h2>
          <p className="search-page__no-results-text">
            Nothing matched &ldquo;{debouncedQuery}&rdquo;. Try a different keyword.
          </p>
        </div>
      )}

      {!isFetching && hasResults && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Results for <strong>&ldquo;{debouncedQuery}&rdquo;</strong>
            </p>
            <span className="search-page__total-badge">{data.meta.total} result{data.meta.total !== 1 ? 's' : ''}</span>
          </div>

          <div className="search-page__results">
            <ResultSection type="note"       items={data.notes} />
            <ResultSection type="document"   items={data.documents} />
            <ResultSection type="bookmark"   items={data.bookmarks} />
            <ResultSection type="collection" items={data.collections} />
          </div>
        </>
      )}
    </div>
  )
}
