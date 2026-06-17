import { prisma } from '../../lib/prisma.js'
import { ACTIVITY_TYPES } from '../activity/activity.service.js'

const HEATMAP_ACTIVITY_TYPES = [
  ACTIVITY_TYPES.NOTE_CREATED,
  ACTIVITY_TYPES.FLASHCARD_REVIEWED,
  ACTIVITY_TYPES.QUIZ_ATTEMPTED,
]

const WEEKS_DEFAULT = 12
const HEATMAP_DAYS_DEFAULT = 84

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatWeekLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function buildWeekBuckets(weekCount) {
  const buckets = []
  const now = startOfWeek(new Date())

  for (let i = weekCount - 1; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7)
    buckets.push({
      weekStart,
      weekKey: toDateKey(weekStart),
      label: formatWeekLabel(weekStart),
      notes: 0,
      documents: 0,
      bookmarks: 0,
    })
  }

  return buckets
}

function assignToWeekBucket(buckets, createdAt, field) {
  const date = new Date(createdAt)
  const weekStart = startOfWeek(date)
  const weekKey = toDateKey(weekStart)
  const bucket = buckets.find((b) => b.weekKey === weekKey)
  if (bucket) {
    bucket[field] += 1
  }
}

function buildDayBuckets(dayCount) {
  const buckets = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = dayCount - 1; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    buckets.push({
      date: toDateKey(day),
      count: 0,
    })
  }

  return buckets
}

export const analyticsService = {
  async getContentGrowth(userId, weeks = WEEKS_DEFAULT) {
    const safeWeeks = Math.min(52, Math.max(4, parseInt(weeks) || WEEKS_DEFAULT))
    const buckets = buildWeekBuckets(safeWeeks)
    const rangeStart = buckets[0].weekStart

    const [notes, documents, bookmarks] = await Promise.all([
      prisma.note.findMany({
        where: { userId, createdAt: { gte: rangeStart } },
        select: { createdAt: true },
      }),
      prisma.document.findMany({
        where: { userId, createdAt: { gte: rangeStart } },
        select: { createdAt: true },
      }),
      prisma.bookmark.findMany({
        where: { userId, createdAt: { gte: rangeStart } },
        select: { createdAt: true },
      }),
    ])

    for (const note of notes) assignToWeekBucket(buckets, note.createdAt, 'notes')
    for (const doc of documents) assignToWeekBucket(buckets, doc.createdAt, 'documents')
    for (const bookmark of bookmarks) assignToWeekBucket(buckets, bookmark.createdAt, 'bookmarks')

    return buckets.map(({ label, notes: n, documents: d, bookmarks: b }) => ({
      week: label,
      notes: n,
      documents: d,
      bookmarks: b,
    }))
  },

  async getStudyHeatmap(userId, days = HEATMAP_DAYS_DEFAULT) {
    const safeDays = Math.min(365, Math.max(28, parseInt(days) || HEATMAP_DAYS_DEFAULT))
    const buckets = buildDayBuckets(safeDays)
    const rangeStart = new Date(buckets[0].date)

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        type: { in: HEATMAP_ACTIVITY_TYPES },
        createdAt: { gte: rangeStart },
      },
      select: { createdAt: true },
    })

    const bucketMap = new Map(buckets.map((b) => [b.date, b]))
    for (const activity of activities) {
      const key = toDateKey(activity.createdAt)
      const bucket = bucketMap.get(key)
      if (bucket) bucket.count += 1
    }

    const counts = buckets.map((b) => b.count)
    const maxCount = Math.max(1, ...counts)

    return {
      days: buckets.map((b) => ({
        date: b.date,
        count: b.count,
        level: b.count === 0 ? 0 : Math.min(4, Math.ceil((b.count / maxCount) * 4)),
      })),
      maxCount,
    }
  },

  async getQuizPerformance(userId) {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        score: true,
        total: true,
        percent: true,
        createdAt: true,
        quiz: { select: { title: true } },
      },
    })

    if (attempts.length === 0) {
      return {
        attempts: [],
        averageScore: 0,
        highestScore: 0,
      }
    }

    const percents = attempts.map((a) => a.percent)
    const averageScore = Math.round(
      percents.reduce((sum, p) => sum + p, 0) / percents.length,
    )
    const highestScore = Math.max(...percents)

    return {
      attempts: attempts.map((a) => ({
        id: a.id,
        label: new Date(a.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        date: a.createdAt,
        score: a.score,
        total: a.total,
        percent: a.percent,
        quizTitle: a.quiz.title,
      })),
      averageScore,
      highestScore,
    }
  },

  async getDashboardAnalytics(userId) {
    const [contentGrowth, studyHeatmap, quizPerformance] = await Promise.all([
      this.getContentGrowth(userId),
      this.getStudyHeatmap(userId),
      this.getQuizPerformance(userId),
    ])

    return { contentGrowth, studyHeatmap, quizPerformance }
  },
}
