import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch'
import { Spinner } from '../../../components/ui/Spinner'
import '../search.css'

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function SearchIcon() {
  return (
    <svg className="search-modal__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="6" />
      <path d="m15 15 3 3" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 1l12 12M13 1 1 13" />
    </svg>
  )
}

const TYPE_CONFIG = {
  note:       { icon: '📝', label: 'Notes',       iconClass: 'search-result-item__icon-wrap--note' },
  document:   { icon: '📄', label: 'Documents',   iconClass: 'search-result-item__icon-wrap--document' },
  bookmark:   { icon: '🔖', label: 'Bookmarks',   iconClass: 'search-result-item__icon-wrap--bookmark' },
  collection: { icon: '📁', label: 'Collections', iconClass: 'search-result-item__icon-wrap--collection' },
}

function ResultItem({ type, title, meta, href, onSelect }) {
  const config = TYPE_CONFIG[type]
  return (
    <button
      type="button"
      className="search-result-item"
      onClick={() => onSelect(href)}
    >
      <span className={`search-result-item__icon-wrap ${config.iconClass}`}>
        {config.icon}
      </span>
      <span className="search-result-item__body">
        <span className="search-result-item__title">{title}</span>
        {meta && <span className="search-result-item__meta">{meta}</span>}
      </span>
    </button>
  )
}

function ResultGroup({ type, items, onSelect }) {
  if (!items?.length) return null
  const config = TYPE_CONFIG[type]

  const getHref = (item) => {
    if (type === 'note') return `/app/notes/${item.id}`
    if (type === 'document') return `/app/documents/${item.id}`
    if (type === 'bookmark') return `/app/bookmarks`
    if (type === 'collection') return `/app/collections/${item.id}`
    return '/app'
  }

  const getMeta = (item) => {
    if (type === 'note') return item.summary || item.collection?.name || null
    if (type === 'document') return item.summary || item.fileType || null
    if (type === 'bookmark') return item.url || item.description || null
    if (type === 'collection') return item.description || null
    return null
  }

  return (
    <div className="search-group">
      <p className="search-group__label">
        <span className="search-group__icon">{config.icon}</span>
        {config.label} ({items.length})
      </p>
      {items.map((item) => (
        <ResultItem
          key={item.id}
          type={type}
          title={type === 'collection' ? item.name : item.title}
          meta={getMeta(item)}
          href={getHref(item)}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export function SearchModal({ onClose }) {
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data, isFetching, isError } = useSearch(debouncedQuery)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSelect = useCallback((href) => {
    navigate(href)
    onClose()
  }, [navigate, onClose])

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const hasResults = data && (
    data.notes.length > 0 ||
    data.documents.length > 0 ||
    data.bookmarks.length > 0 ||
    data.collections.length > 0
  )

  const showViewAll = hasResults && debouncedQuery.trim()

  return (
    <div className="search-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Search">
      <div className="search-modal">
        <div className="search-modal__input-row">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            className="search-modal__input"
            placeholder="Search notes, documents, bookmarks, collections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          <button type="button" className="search-modal__close" onClick={onClose} aria-label="Close search">
            <CloseIcon />
          </button>
        </div>

        <div className="search-modal__results">
          {isFetching && (
            <div className="search-modal__loading">
              <Spinner size="sm" />
              Searching…
            </div>
          )}

          {!isFetching && !debouncedQuery.trim() && (
            <div className="search-modal__hint">
              <span className="search-modal__hint-icon">🔍</span>
              <p>Type to search across your entire knowledge base</p>
            </div>
          )}

          {!isFetching && debouncedQuery.trim() && !isError && !hasResults && (
            <div className="search-modal__empty">
              <span className="search-modal__empty-icon">😶‍🌫️</span>
              <p>No results found for &ldquo;{debouncedQuery}&rdquo;</p>
            </div>
          )}

          {!isFetching && hasResults && (
            <>
              <ResultGroup type="note"       items={data.notes}       onSelect={handleSelect} />
              <ResultGroup type="document"   items={data.documents}   onSelect={handleSelect} />
              <ResultGroup type="bookmark"   items={data.bookmarks}   onSelect={handleSelect} />
              <ResultGroup type="collection" items={data.collections} onSelect={handleSelect} />
            </>
          )}
        </div>

        <div className="search-modal__footer">
          <div className="search-modal__footer-hint">
            <span><kbd className="search-modal__footer-kbd">↑↓</kbd> navigate</span>
            <span><kbd className="search-modal__footer-kbd">↵</kbd> open</span>
            <span><kbd className="search-modal__footer-kbd">Esc</kbd> close</span>
          </div>
          {showViewAll && (
            <button
              type="button"
              className="search-result-item"
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              onClick={() => handleSelect(`/app/search?q=${encodeURIComponent(debouncedQuery)}`)}
            >
              View all results →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
