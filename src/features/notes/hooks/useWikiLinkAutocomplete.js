import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/useAuth';
import { fetchNotes } from '../api/notesApi';

/**
 * Detects an open wiki-link trigger at the current cursor position.
 *
 * Returns the partial text typed after [[ if the cursor is inside an
 * unclosed [[...]] pattern, otherwise returns null.
 *
 * Examples:
 *   "See [[Tok|"     → "Tok"       (| = cursor)
 *   "See [[|"        → ""          (just opened, no chars yet — triggers but returns "")
 *   "See [[Tok]]|"   → null        (already closed)
 *   "See [[Tok]] |"  → null        (cursor after closed link)
 */
function detectWikiTrigger(value, cursorPos) {
  const textBeforeCursor = value.slice(0, cursorPos);

  // Find the last [[ before the cursor
  const openIdx = textBeforeCursor.lastIndexOf('[[');
  if (openIdx === -1) return null;

  // Make sure there's no closing ]] between [[ and cursor
  const between = textBeforeCursor.slice(openIdx + 2);
  if (between.includes(']]')) return null;

  // Also make sure there's no newline between [[ and cursor (links are inline)
  if (between.includes('\n')) return null;

  return between; // may be empty string ""
}

/**
 * Calculates pixel coordinates for the dropdown.
 * Uses a hidden mirror div technique to measure where the [[ trigger sits.
 */
function getCaretCoordinates(textarea, position) {
  const mirrorId = '__wiki_caret_mirror__';
  let mirror = document.getElementById(mirrorId);

  if (!mirror) {
    mirror = document.createElement('div');
    mirror.id = mirrorId;
    mirror.style.cssText = [
      'position:absolute', 'top:0', 'left:0', 'visibility:hidden',
      'pointer-events:none', 'overflow:hidden', 'white-space:pre-wrap',
      'word-wrap:break-word',
    ].join(';');
    document.body.appendChild(mirror);
  }

  const computed = window.getComputedStyle(textarea);
  const props = [
    'boxSizing', 'width', 'height', 'paddingTop', 'paddingRight',
    'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth',
    'borderBottomWidth', 'borderLeftWidth', 'fontFamily', 'fontSize',
    'fontWeight', 'lineHeight', 'letterSpacing',
  ];
  props.forEach((p) => { mirror.style[p] = computed[p]; });

  // Text up to the cursor position, with a span marking the exact spot
  const textBefore = textarea.value.slice(0, position);
  mirror.innerHTML = escapeHtml(textBefore) + '<span id="__wiki_caret_span__"></span>';

  const taRect = textarea.getBoundingClientRect();
  mirror.style.top  = `${taRect.top  + window.scrollY - textarea.scrollTop}px`;
  mirror.style.left = `${taRect.left + window.scrollX - textarea.scrollLeft}px`;

  const span = document.getElementById('__wiki_caret_span__');
  if (!span) return { top: 0, left: 0 };

  const spanRect = span.getBoundingClientRect();
  return {
    top:  spanRect.top  + window.scrollY,
    left: spanRect.left + window.scrollX,
  };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/ /g, '&nbsp;')
    .replace(/\n/g, '<br>');
}

const DROPDOWN_HEIGHT_ESTIMATE = 220; // px — approximate max dropdown height
const DROPDOWN_WIDTH = 280;           // px

/**
 * Main hook — drives the entire wiki-link autocomplete experience.
 *
 * @param {React.RefObject} textareaRef   — the editor textarea
 * @param {string}          content       — controlled textarea value
 * @param {Function}        setContent    — setter for the content
 * @param {string|null}     excludeNoteId — current note's own id (excluded from results)
 *
 * Returns:
 *   {
 *     isOpen,           — whether the dropdown is visible
 *     suggestions,      — array of { id, title, collection? }
 *     query,            — the partial text the user has typed after [[
 *     activeIndex,      — keyboard-highlighted suggestion index
 *     dropdownStyle,    — { top, left, width } for absolute positioning
 *     isLoading,        — debounced search in flight
 *     onKeyDown,        — keydown handler to wire onto the textarea
 *     onSelect,         — call with a note { id, title } to complete the link
 *     close,            — close without selecting
 *   }
 */
export function useWikiLinkAutocomplete(textareaRef, content, setContent, excludeNoteId) {
  const { token } = useAuth();

  const [isOpen, setIsOpen]           = useState(false);
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });
  const [isLoading, setIsLoading]     = useState(false);

  // Track the cursor position at the moment [[ was detected
  const triggerPosRef = useRef(null);
  const debounceRef   = useRef(null);
  const abortRef      = useRef(null);

  /* ── Close helper ── */
  const close = useCallback(() => {
    setIsOpen(false);
    setSuggestions([]);
    setQuery('');
    setActiveIndex(0);
    triggerPosRef.current = null;
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();
  }, []);

  /* ── Search notes via existing /notes?q= endpoint ── */
  const search = useCallback(async (term) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const results = await fetchNotes({ search: term || '' }, token);
      if (controller.signal.aborted) return;

      const filtered = (results || [])
        .filter((n) => !excludeNoteId || n.id !== excludeNoteId)
        .slice(0, 10);

      setSuggestions(filtered);
      setActiveIndex(0);
    } catch {
      if (!controller.signal.aborted) setSuggestions([]);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [token, excludeNoteId]);

  /* ── Calculate dropdown position — anchored to textarea top-right ── */
  const updatePosition = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const rect = ta.getBoundingClientRect();

    setDropdownStyle({
      position: 'fixed',
      top:   rect.top + 8,
      right: window.innerWidth - rect.right + 8,
      left:  undefined,
      width: DROPDOWN_WIDTH,
    });
  }, [textareaRef]);

  /* ── React to content / cursor changes ── */
  const handleContentChange = useCallback((value) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const cursor = ta.selectionStart;
    const partial = detectWikiTrigger(value, cursor);

    if (partial === null) {
      if (isOpen) close();
      return;
    }

    // Track where [[ started (for replacement later)
    const openIdx = value.lastIndexOf('[[', cursor);
    triggerPosRef.current = openIdx;

    setQuery(partial);
    updatePosition();

    if (!isOpen) setIsOpen(true);

    // Debounced search — only search when ≥1 character typed after [[
    clearTimeout(debounceRef.current);
    if (partial.length === 0) {
      // Show all notes immediately when just [[  is typed
      debounceRef.current = setTimeout(() => search(''), 0);
    } else {
      debounceRef.current = setTimeout(() => search(partial), 300);
    }
  }, [isOpen, close, search, updatePosition, textareaRef]);

  /* ── Select a suggestion ── */
  const onSelect = useCallback((note) => {
    const ta = textareaRef.current;
    if (!ta || triggerPosRef.current === null) return;

    const value = ta.value;
    const openIdx = triggerPosRef.current;

    // Replace from [[ up to current cursor with [[Title]]
    const cursor = ta.selectionStart;
    const before = value.slice(0, openIdx);
    const after  = value.slice(cursor);
    const replacement = `[[${note.title}]]`;
    const newValue = before + replacement + after;
    const newCursor = openIdx + replacement.length;

    setContent(newValue);

    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newCursor, newCursor);
    });

    close();
  }, [textareaRef, setContent, close]);

  /* ── Keyboard handler (wire onto textarea) ── */
  const onKeyDown = useCallback((e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(suggestions.length, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + Math.max(suggestions.length, 1)) % Math.max(suggestions.length, 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[activeIndex]) onSelect(suggestions[activeIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        close();
        break;
      case 'Tab':
        if (suggestions[activeIndex]) {
          e.preventDefault();
          onSelect(suggestions[activeIndex]);
        }
        break;
      default:
        break;
    }
  }, [isOpen, suggestions, activeIndex, onSelect, close]);

  /* ── Close dropdown when textarea loses focus ── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const onBlur = () => setTimeout(close, 150); // 150ms to allow mouse click on item
    ta.addEventListener('blur', onBlur);
    return () => ta.removeEventListener('blur', onBlur);
  }, [textareaRef, close]);

  /* ── Cleanup on unmount ── */
  useEffect(() => () => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();
  }, []);

  return {
    isOpen,
    suggestions,
    query,
    activeIndex,
    dropdownStyle,
    isLoading,
    onKeyDown,
    onSelect,
    close,
    handleContentChange,
    setActiveIndex,
  };
}
