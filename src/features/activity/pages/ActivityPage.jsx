import { useEffect, useRef } from 'react'
import { useActivities } from '../hooks/useActivities'
import '../activity.css'

/* ─── Icon helpers ────────────────────────────────────────── */
function TimelineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 8v4l3 3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  )
}

function CollectionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

function CommitIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <circle cx="12" cy="12" r="4" />
      <line x1="1.05" y1="12" x2="7" y2="12" />
      <line x1="17.01" y1="12" x2="22.96" y2="12" />
    </svg>
  )
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  )
}

/* ─── Type config ─────────────────────────────────────────── */
const TYPE_CONFIG = {
  NOTE_CREATED:       { label: 'Note Created',       Icon: NoteIcon },
  NOTE_UPDATED:       { label: 'Note Updated',       Icon: NoteIcon },
  NOTE_DELETED:       { label: 'Note Deleted',       Icon: TrashIcon },
  NOTE_COMMITTED:     { label: 'Version Committed',  Icon: CommitIcon },
  DOCUMENT_UPLOADED:  { label: 'Document Uploaded',  Icon: DocIcon },
  DOCUMENT_DELETED:   { label: 'Document Deleted',   Icon: TrashIcon },
  BOOKMARK_ADDED:     { label: 'Bookmark Saved',     Icon: BookmarkIcon },
  BOOKMARK_UPDATED:   { label: 'Bookmark Updated',   Icon: BookmarkIcon },
  BOOKMARK_DELETED:   { label: 'Bookmark Deleted',   Icon: TrashIcon },
  COLLECTION_CREATED: { label: 'Collection Created', Icon: CollectionIcon },
  COLLECTION_UPDATED: { label: 'Collection Updated', Icon: CollectionIcon },
  COLLECTION_DELETED: { label: 'Collection Deleted', Icon: TrashIcon },
}

/* ─── Formatting ──────────────────────────────────────────── */
function formatRelativeTime(dateStr) {
  const date = new Date(dateStr)
  const now   = new Date()
  const diffMs  = now - date
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr  = Math.floor(diffMs / 3_600_000)
  const diffDay = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1)  return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr  < 24) return `${diffHr}h ago`
  if (diffDay <  7) return `${diffDay}d ago`
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatGroupLabel(dateStr) {
  const date  = new Date(dateStr)
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const d     = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff  = Math.floor((today - d) / 86_400_000)

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff <  7)  return date.toLocaleDateString('en-US', { weekday: 'long' })
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function groupByDate(activities) {
  const groups = []
  const seen   = new Map()

  for (const act of activities) {
    const label = formatGroupLabel(act.createdAt)
    if (!seen.has(label)) {
      seen.set(label, groups.length)
      groups.push({ label, items: [] })
    }
    groups[seen.get(label)].items.push(act)
  }

  return groups
}

/* ─── Skeleton ─────────────────────────────────────────────── */
function ActivitySkeleton() {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="activity-skeleton__item">
          <div className="skeleton skeleton--circle" style={{ width: 22, height: 22, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: `${50 + i * 8}%`, height: 14, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: '30%', height: 11 }} />
          </div>
          <div className="skeleton" style={{ width: 44, height: 11 }} />
        </div>
      ))}
    </div>
  )
}

/* ─── Compute quick stats from pages ──────────────────────── */
function computeStats(pages) {
  const all = pages.flatMap((p) => p?.activities ?? [])
  let notes = 0, documents = 0, bookmarks = 0, collections = 0

  for (const act of all) {
    if (act.type.startsWith('NOTE')) notes++
    else if (act.type.startsWith('DOCUMENT')) documents++
    else if (act.type.startsWith('BOOKMARK')) bookmarks++
    else if (act.type.startsWith('COLLECTION')) collections++
  }

  return { notes, documents, bookmarks, collections, total: all.length }
}

/* ─── Page ────────────────────────────────────────────────── */
export function ActivityPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useActivities()

  // Intersection-observer for auto-load
  const sentinelRef = useRef(null)
  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allActivities = data?.pages.flatMap((p) => p?.activities ?? []) ?? []
  const groups = groupByDate(allActivities)
  const stats  = data ? computeStats(data.pages) : null
  const total  = data?.pages[0]?.meta?.total ?? 0

  return (
    <section className="activity-page">
      {/* Header */}
      <div className="activity-page__header">
        <div className="activity-page__icon">
          <TimelineIcon />
        </div>
        <div>
          <h2 className="activity-page__title">Activity Timeline</h2>
          <p className="activity-page__subtitle">
            {total > 0 ? `${total} total events tracked` : 'Track everything you do in MindVault'}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      {stats && total > 0 && (
        <div className="activity-stats">
          <div className="activity-stat">
            <span className="activity-stat__value">{stats.notes}</span>
            <span className="activity-stat__label">Note events</span>
          </div>
          <div className="activity-stat">
            <span className="activity-stat__value">{stats.documents}</span>
            <span className="activity-stat__label">Document events</span>
          </div>
          <div className="activity-stat">
            <span className="activity-stat__value">{stats.bookmarks}</span>
            <span className="activity-stat__label">Bookmark events</span>
          </div>
          <div className="activity-stat">
            <span className="activity-stat__value">{stats.collections}</span>
            <span className="activity-stat__label">Collection events</span>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="activity-timeline">
          <ActivitySkeleton />
        </div>
      )}

      {/* Empty */}
      {!isLoading && allActivities.length === 0 && (
        <div className="activity-page__empty">
          <div className="activity-page__empty-icon"><InboxIcon /></div>
          <h3 className="activity-page__empty-title">No activity yet</h3>
          <p className="activity-page__empty-desc">
            Every note you create, bookmark you save, or document you upload will appear here in a timeline.
          </p>
        </div>
      )}

      {/* Timeline */}
      {!isLoading && groups.length > 0 && (
        <div className="activity-timeline">
          {groups.map((group) => (
            <div key={group.label} className="activity-group">
              <div className="activity-group__label">{group.label}</div>

              {group.items.map((activity, idx) => {
                const config = TYPE_CONFIG[activity.type] ?? { label: activity.type, Icon: NoteIcon }
                const { Icon } = config

                return (
                  <div
                    key={activity.id}
                    className="timeline-item"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className={`timeline-item__dot timeline-item__dot--${activity.type}`}>
                      <Icon />
                    </div>
                    <div className="timeline-item__card">
                      <div className="timeline-item__content">
                        <span className={`timeline-item__badge timeline-item__badge--${activity.type}`}>
                          {config.label}
                        </span>
                        <p className="timeline-item__title">{activity.title}</p>
                      </div>
                      <time className="timeline-item__time">
                        {formatRelativeTime(activity.createdAt)}
                      </time>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height: 1 }} />

          {isFetchingNextPage && (
            <div className="activity-timeline" style={{ paddingTop: 8 }}>
              <ActivitySkeleton />
            </div>
          )}

          {!hasNextPage && allActivities.length > 0 && (
            <div className="activity-page__load-more">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)' }}>
                You've reached the beginning of your activity
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
