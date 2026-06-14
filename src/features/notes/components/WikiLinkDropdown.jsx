import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Highlights the matching part of a title.
 * E.g. title="Tokenization", query="tok" → <span>Tok</span>enization
 */
function HighlightMatch({ title, query }) {
  if (!query) return <>{title}</>;

  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIdx   = lowerTitle.indexOf(lowerQuery);

  if (matchIdx === -1) return <>{title}</>;

  const before = title.slice(0, matchIdx);
  const match  = title.slice(matchIdx, matchIdx + query.length);
  const after  = title.slice(matchIdx + query.length);

  return (
    <>
      {before}
      <mark className="wiki-dropdown__highlight">{match}</mark>
      {after}
    </>
  );
}

/**
 * WikiLinkDropdown — rendered in a portal so it floats above the editor layout.
 *
 * Props:
 *   isOpen        — boolean
 *   suggestions   — [{ id, title, collection? }]
 *   query         — the typed partial text (for highlighting)
 *   activeIndex   — the keyboard-highlighted row index
 *   dropdownStyle — { position, top, left, bottom, width }
 *   isLoading     — show loading state
 *   onSelect      — fn({ id, title }) called on click/enter
 *   onHover       — fn(index) called on mouseenter
 */
export function WikiLinkDropdown({
  isOpen,
  suggestions,
  query,
  activeIndex,
  dropdownStyle,
  isLoading,
  onSelect,
  onHover,
}) {
  const listRef = useRef(null);

  // Scroll active item into view when keyboard navigating
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  const content = (
    <div
      className="wiki-dropdown"
      style={dropdownStyle}
      role="listbox"
      aria-label="Note suggestions"
      onMouseDown={(e) => e.preventDefault()} // prevent textarea blur
    >
      <div className="wiki-dropdown__header">
        <span className="wiki-dropdown__header-icon">🔗</span>
        Link a note
        {query ? (
          <span className="wiki-dropdown__query">&ldquo;{query}&rdquo;</span>
        ) : null}
      </div>

      {isLoading && (
        <div className="wiki-dropdown__loading">
          <span className="wiki-dropdown__spinner" aria-hidden="true" />
          Searching…
        </div>
      )}

      {!isLoading && suggestions.length === 0 && (
        <div className="wiki-dropdown__empty">
          <span className="wiki-dropdown__empty-icon">😶</span>
          No matching notes
        </div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <ul className="wiki-dropdown__list" ref={listRef} role="listbox">
          {suggestions.map((note, idx) => (
            <li
              key={note.id}
              role="option"
              aria-selected={idx === activeIndex}
              data-active={idx === activeIndex}
              className={`wiki-dropdown__item ${idx === activeIndex ? 'wiki-dropdown__item--active' : ''}`}
              onMouseEnter={() => onHover(idx)}
              onClick={() => onSelect(note)}
            >
              <span className="wiki-dropdown__item-icon" aria-hidden="true">📝</span>
              <span className="wiki-dropdown__item-body">
                <span className="wiki-dropdown__item-title">
                  <HighlightMatch title={note.title} query={query} />
                </span>
                {note.collection && (
                  <span className="wiki-dropdown__item-meta">
                    in {note.collection.name}
                  </span>
                )}
              </span>
              {idx === activeIndex && (
                <span className="wiki-dropdown__item-enter" aria-hidden="true">↵</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="wiki-dropdown__footer">
        <span><kbd>↑↓</kbd> navigate</span>
        <span><kbd>↵</kbd> or <kbd>Tab</kbd> select</span>
        <span><kbd>Esc</kbd> close</span>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
