import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useVersions, useVersion, useRestoreVersion } from '../hooks/useVersions';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';

/* ══════════════════════════════════════════════════════════════
   WORD-LEVEL DIFF ENGINE
   ══════════════════════════════════════════════════════════════

   Algorithm: Myers shortest-edit-script (SES) diff.
   - Same algorithm used by git diff, adapted for token arrays.
   - O((N+M)*D) time, where D is the number of differences.
   - Produces the minimum number of insertions + deletions.

   Tokenizer:
   - Splits text into meaningful tokens:
     words, whitespace, punctuation, Markdown syntax ([[, ]], #, *, etc.)
   - Preserves all characters so the reconstructed text is identical.
   - Each token diffs independently — [[Tokenization]] vs Tokenization
     shows exactly the brackets as removed/added.
*/

/**
 * Splits a single line into tokens that preserve all characters.
 * Tokens: wiki-link brackets [[ ]], markdown sigils, words, spaces, punctuation.
 */
function tokenizeLine(line) {
  // Match (in order of priority):
  //   [[  or  ]]  — wiki-link delimiters as single tokens
  //   \n          — newlines
  //   \s+         — runs of whitespace
  //   [#*>`~_-]+  — markdown symbols
  //   \w+         — word characters (letters, digits, underscore)
  //   .           — any other single character
  return line.match(/\[\[|\]\]|\s+|[#*>`~_\-]+|\w+|./g) ?? [];
}

/**
 * Myers diff on two arrays of tokens.
 * Returns an array of { token, type } where type is 'unchanged'|'removed'|'added'.
 *
 * Complexity: O((N+M)*D) — fast for small diffs, acceptable for large ones.
 * We cap at MAX_TOKENS to prevent UI freezes on huge documents.
 */
const MAX_TOKENS = 4000;

function myersDiff(oldTokens, newTokens) {
  const a = oldTokens.slice(0, MAX_TOKENS);
  const b = newTokens.slice(0, MAX_TOKENS);
  const N = a.length;
  const M = b.length;
  const MAX = N + M;

  if (MAX === 0) return [];

  // V[k] stores the furthest-reaching x position on diagonal k
  const V = new Array(2 * MAX + 1).fill(0);
  // trace[d] = snapshot of V after d edits (for backtracking)
  const trace = [];

  outer: for (let d = 0; d <= MAX; d++) {
    trace.push(V.slice());
    for (let k = -d; k <= d; k += 2) {
      const idx = k + MAX;
      let x;
      if (k === -d || (k !== d && V[idx - 1] < V[idx + 1])) {
        x = V[idx + 1]; // move down (insert from b)
      } else {
        x = V[idx - 1] + 1; // move right (delete from a)
      }
      let y = x - k;
      // Follow the diagonal (matching tokens)
      while (x < N && y < M && a[x] === b[y]) { x++; y++; }
      V[idx] = x;
      if (x >= N && y >= M) break outer;
    }
  }

  // Backtrack through trace to build the edit script
  const ops = []; // { type: 'eq'|'del'|'ins', token }
  let x = N;
  let y = M;

  for (let d = trace.length - 1; d >= 0 && (x > 0 || y > 0); d--) {
    const Vprev = trace[d];
    const k = x - y;
    const idx = k + MAX;
    let prevK;
    if (k === -d || (k !== d && Vprev[idx - 1] < Vprev[idx + 1])) {
      prevK = k + 1; // came from down (insert)
    } else {
      prevK = k - 1; // came from right (delete)
    }
    const prevX = Vprev[prevK + MAX];
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      ops.unshift({ type: 'eq', token: a[x - 1] });
      x--; y--;
    }
    if (d > 0) {
      if (x > prevX) {
        ops.unshift({ type: 'del', token: a[x - 1] });
        x--;
      } else if (y > prevY) {
        ops.unshift({ type: 'ins', token: b[y - 1] });
        y--;
      }
    }
  }

  return ops.map((op) => ({
    token: op.token,
    type: op.type === 'eq' ? 'unchanged' : op.type === 'del' ? 'removed' : 'added',
  }));
}

/**
 * Computes a word-level diff between version (old) and current (new) content.
 *
 * Returns an array of paragraph objects, each containing an array of tokens:
 *   [{ paragraph: [ { token, type } ] }]
 *
 * Also returns a summary: { added: number, removed: number }
 */
function computeWordDiff(versionContent, currentContent) {
  const oldLines = (versionContent ?? '').split('\n');
  const newLines = (currentContent  ?? '').split('\n');

  // First diff the lines to find which lines changed
  const lineDiff = myersDiff(oldLines, newLines);

  // Group consecutive operations into logical paragraphs for rendering.
  // Each element is: { lineTokens: [{token, type}][], isBlank: boolean }
  const paragraphs = [];
  let i = 0;

  while (i < lineDiff.length) {
    const op = lineDiff[i];

    // Blank line — emit as separator
    if (op.token.trim() === '' && op.type === 'unchanged') {
      paragraphs.push({ isBlank: true, tokens: [] });
      i++;
      continue;
    }

    // For unchanged lines, check if the NEXT iteration might pair with a removed
    // or added to do intra-line word diff
    if (op.type === 'unchanged') {
      paragraphs.push({
        isBlank: false,
        tokens: tokenizeLine(op.token).map((t) => ({ token: t, type: 'unchanged' })),
      });
      i++;
      continue;
    }

    // Collect consecutive removed lines, then consecutive added lines
    const removedLines = [];
    const addedLines   = [];

    while (i < lineDiff.length && lineDiff[i].type === 'removed') {
      removedLines.push(lineDiff[i].token);
      i++;
    }
    while (i < lineDiff.length && lineDiff[i].type === 'added') {
      addedLines.push(lineDiff[i].token);
      i++;
    }

    // If both removed and added — do word-level diff per paired line
    const maxLen = Math.max(removedLines.length, addedLines.length);
    for (let j = 0; j < maxLen; j++) {
      const oldLine = removedLines[j] ?? '';
      const newLine = addedLines[j]   ?? '';

      if (removedLines[j] !== undefined && addedLines[j] !== undefined) {
        // Pair: word-level diff between old and new line
        const wordOps = myersDiff(tokenizeLine(oldLine), tokenizeLine(newLine));
        paragraphs.push({ isBlank: false, tokens: wordOps });
      } else if (removedLines[j] !== undefined) {
        // Only removed — entire line marked removed
        paragraphs.push({
          isBlank: false,
          tokens: tokenizeLine(oldLine).map((t) => ({ token: t, type: 'removed' })),
        });
      } else {
        // Only added — entire line marked added
        paragraphs.push({
          isBlank: false,
          tokens: tokenizeLine(newLine).map((t) => ({ token: t, type: 'added' })),
        });
      }
    }
  }

  // Summary counts (word tokens only, not whitespace)
  let added = 0;
  let removed = 0;
  for (const para of paragraphs) {
    for (const tok of para.tokens) {
      if (tok.token.trim() === '') continue;
      if (tok.type === 'added')   added++;
      if (tok.type === 'removed') removed++;
    }
  }

  return { paragraphs, summary: { added, removed } };
}

/* ── Date Helpers ── */
function formatRelative(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1)   return 'Just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7)   return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFull(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ── Icons ── */
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 1l12 12M13 1 1 13" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}

/* ── Word-level diff renderer ── */
function WordDiffView({ versionContent, currentContent }) {
  // Memoize — only recompute when the two contents change
  const { paragraphs, summary } = useMemo(
    () => computeWordDiff(versionContent, currentContent),
    [versionContent, currentContent],
  );

  const hasChanges = summary.added > 0 || summary.removed > 0;

  return (
    <div className="version-diff__word-view">
      {/* Change summary */}
      {hasChanges && (
        <div className="version-diff__summary">
          {summary.added > 0 && (
            <span className="version-diff__summary-chip version-diff__summary-chip--added">
              +{summary.added} added
            </span>
          )}
          {summary.removed > 0 && (
            <span className="version-diff__summary-chip version-diff__summary-chip--removed">
              −{summary.removed} removed
            </span>
          )}
        </div>
      )}

      {!hasChanges && (
        <p className="version-diff__no-changes">No word-level differences detected.</p>
      )}

      {/* Paragraph-by-paragraph diff */}
      <div className="version-diff__paragraphs">
        {paragraphs.map((para, pi) => {
          if (para.isBlank) {
            return <div key={pi} className="version-diff__para-gap" />;
          }

          // Determine if the whole paragraph is purely added or removed
          // (to show the line-gutter indicator)
          const allRemoved = para.tokens.length > 0 && para.tokens.every(
            (t) => t.type === 'removed' || t.token.trim() === '',
          );
          const allAdded = para.tokens.length > 0 && para.tokens.every(
            (t) => t.type === 'added' || t.token.trim() === '',
          );

          let paraClass = 'version-diff__para';
          if (allRemoved) paraClass += ' version-diff__para--removed-line';
          if (allAdded)   paraClass += ' version-diff__para--added-line';

          return (
            <div key={pi} className={paraClass}>
              {allRemoved && <span className="version-diff__gutter version-diff__gutter--removed">−</span>}
              {allAdded   && <span className="version-diff__gutter version-diff__gutter--added">+</span>}
              {!allRemoved && !allAdded && <span className="version-diff__gutter" />}

              <span className="version-diff__para-content">
                {para.tokens.map((tok, ti) => {
                  if (tok.type === 'unchanged') {
                    return <span key={ti}>{tok.token}</span>;
                  }
                  if (tok.type === 'removed') {
                    return (
                      <span key={ti} className="version-diff__token--removed">
                        {tok.token}
                      </span>
                    );
                  }
                  // added
                  return (
                    <span key={ti} className="version-diff__token--added">
                      {tok.token}
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Version preview / diff panel ── */
function VersionPreviewPanel({ versionId, noteId, currentContent }) {
  const [tab, setTab] = useState('diff');
  const { data: version, isLoading } = useVersion(noteId, versionId);

  if (isLoading) {
    return (
      <div className="version-diff">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Spinner size="sm" />
        </div>
      </div>
    );
  }

  if (!version) return null;

  return (
    <div className="version-diff">
      <div className="version-diff__header">
        <span className="version-diff__label">Snapshot preview</span>
        <div className="version-diff__tabs">
          <button
            type="button"
            className={`version-diff__tab ${tab === 'diff' ? 'version-diff__tab--active' : ''}`}
            onClick={() => setTab('diff')}
          >
            Diff
          </button>
          <button
            type="button"
            className={`version-diff__tab ${tab === 'preview' ? 'version-diff__tab--active' : ''}`}
            onClick={() => setTab('preview')}
          >
            Content
          </button>
        </div>
      </div>

      <div className="version-diff__body">
        {tab === 'preview' ? (
          <pre className="version-diff__preview">{version.content || '(empty)'}</pre>
        ) : (
          <WordDiffView
            versionContent={version.content}
            currentContent={currentContent}
          />
        )}
      </div>
    </div>
  );
}

/* ── Main drawer ── */
function DrawerContent({ noteId, noteTitle, currentContent, onClose, onRestored }) {
  const { data: versions, isLoading } = useVersions(noteId);
  const restoreMutation = useRestoreVersion(noteId);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  // Auto-select first version
  useEffect(() => {
    if (versions?.length && !selectedId) {
      setSelectedId(versions[0].id);
    }
  }, [versions, selectedId]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleRestore = useCallback(async (versionId) => {
    try {
      const restored = await restoreMutation.mutateAsync(versionId);
      onRestored(restored);
      onClose();
    } catch {
      // error handled by mutation state
    }
  }, [restoreMutation, onRestored, onClose]);

  return (
    <div className="version-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="version-drawer" role="dialog" aria-modal="true" aria-label="Version History">

        {/* Header */}
        <div className="version-drawer__header">
          <HistoryIcon />
          <h2 className="version-drawer__title">
            Version History
            <span className="version-drawer__subtitle">{noteTitle}</span>
          </h2>
          <button type="button" className="version-drawer__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {/* Timeline */}
        <div className="version-list">
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Spinner size="md" />
            </div>
          )}

          {!isLoading && versions?.length === 0 && (
            <div className="version-list__empty">
              <span className="version-list__empty-icon">📋</span>
              <p className="version-list__empty-text">
                No snapshots yet. Versions are saved automatically each time you edit this note.
              </p>
            </div>
          )}

          {!isLoading && versions?.map((v, idx) => {
            const isActive = v.id === selectedId;
            const isLast   = idx === versions.length - 1;

            return (
              <div
                key={v.id}
                className={`version-item ${isActive ? 'version-item--active' : ''}`}
                onClick={() => setSelectedId(v.id)}
              >
                <div className="version-item__timeline">
                  <div className="version-item__dot" />
                  {!isLast && <div className="version-item__line" />}
                </div>

                <div className="version-item__body">
                  <span className="version-item__time">{formatRelative(v.createdAt)}</span>
                  <span className="version-item__date">{formatFull(v.createdAt)}</span>
                  <span className="version-item__title">📝 {v.title}</span>
                </div>

                <button
                  type="button"
                  className="version-item__restore"
                  onClick={(e) => { e.stopPropagation(); setConfirmId(v.id); }}
                  title="Restore this version"
                >
                  Restore
                </button>
              </div>
            );
          })}
        </div>

        {/* Preview panel for selected version */}
        {selectedId && (
          <VersionPreviewPanel
            versionId={selectedId}
            noteId={noteId}
            currentContent={currentContent}
          />
        )}

        {/* Restore confirm bar */}
        {confirmId && (
          <div className="version-restore-bar">
            <span className="version-restore-bar__text">
              This will replace the current note content. The current version will be saved first.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={restoreMutation.isPending}
              onClick={() => handleRestore(confirmId)}
            >
              Confirm Restore
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * VersionHistoryDrawer — slide-in side panel rendered in a portal.
 *
 * Props:
 *   open          — boolean
 *   onClose       — fn()
 *   noteId        — string
 *   noteTitle     — string  (current title for display)
 *   currentContent — string (current editor content for diff)
 *   onRestored    — fn(restoredNote) — called after a successful restore
 */
export function VersionHistoryDrawer({ open, onClose, noteId, noteTitle, currentContent, onRestored }) {
  if (!open || !noteId) return null;

  return createPortal(
    <DrawerContent
      noteId={noteId}
      noteTitle={noteTitle}
      currentContent={currentContent}
      onClose={onClose}
      onRestored={onRestored}
    />,
    document.body,
  );
}
