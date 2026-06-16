import { HttpError } from '../../lib/http-error.js'
import { chat } from '../../lib/openrouter.js'
import { prisma } from '../../lib/prisma.js'
import { activityService, ACTIVITY_TYPES } from '../activity/activity.service.js'

const VALID_SOURCE_TYPES = new Set(['note', 'document'])
const MAX_CONTENT_LENGTH = 8000
const MAX_AI_RETRIES = 3

const FLASHCARD_SYSTEM_PROMPT = `You are an educational content generator. Generate flashcards from the provided content.

Requirements:
- Focus on important concepts, definitions, facts, and terminology
- Each flashcard must have a clear question and concise answer
- Generate between 10 and 20 flashcards

Return JSON only with this exact shape:
{
  "flashcards": [
    { "question": "...", "answer": "..." }
  ]
}`

const QUIZ_SYSTEM_PROMPT = `You are an educational content generator. Generate multiple choice quiz questions from the provided content.

Requirements:
- Educational quality questions based on the content
- Exactly 4 options per question (optionA, optionB, optionC, optionD)
- Exactly one correct answer (A, B, C, or D)
- Include a brief explanation for each question
- Generate exactly 10 questions

Return JSON only with this exact shape:
{
  "questions": [
    {
      "question": "...",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctAnswer": "B",
      "explanation": "..."
    }
  ]
}`

const deckListSelect = {
  id: true,
  title: true,
  sourceType: true,
  sourceId: true,
  createdAt: true,
  _count: { select: { flashcards: true } },
}

const deckDetailSelect = {
  id: true,
  title: true,
  sourceType: true,
  sourceId: true,
  createdAt: true,
  flashcards: {
    select: { id: true, question: true, answer: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  },
}

const quizListSelect = {
  id: true,
  title: true,
  sourceType: true,
  sourceId: true,
  createdAt: true,
  _count: { select: { questions: true } },
}

const quizDetailSelect = {
  id: true,
  title: true,
  sourceType: true,
  sourceId: true,
  createdAt: true,
  questions: {
    select: {
      id: true,
      question: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      correctAnswer: true,
      explanation: true,
    },
    orderBy: { id: 'asc' },
  },
}

function validateSourcePayload({ sourceType, sourceId }) {
  if (!sourceType || !VALID_SOURCE_TYPES.has(sourceType)) {
    throw new HttpError(400, 'sourceType must be "note" or "document".')
  }
  if (!sourceId?.trim()) {
    throw new HttpError(400, 'sourceId is required.')
  }
  return { sourceType, sourceId: sourceId.trim() }
}

async function resolveSourceContent(sourceType, sourceId, userId) {
  if (sourceType === 'note') {
    const note = await prisma.note.findUnique({
      where: { id: sourceId },
      select: { title: true, content: true, userId: true },
    })

    if (!note) {
      throw new HttpError(404, 'Note not found.')
    }
    if (note.userId !== userId) {
      throw new HttpError(403, 'You do not have access to this note.')
    }
    if (!note.content?.trim()) {
      throw new HttpError(422, 'This note is empty. Add content before generating study materials.')
    }

    return {
      title: note.title,
      content: note.content.trim().slice(0, MAX_CONTENT_LENGTH),
    }
  }

  const doc = await prisma.document.findUnique({
    where: { id: sourceId },
    select: { title: true, extractedText: true, userId: true },
  })

  if (!doc) {
    throw new HttpError(404, 'Document not found.')
  }
  if (doc.userId !== userId) {
    throw new HttpError(403, 'You do not have access to this document.')
  }
  if (!doc.extractedText?.trim()) {
    throw new HttpError(422, 'This document has no extracted text. Upload a readable PDF or document first.')
  }

  return {
    title: doc.title,
    content: doc.extractedText.trim().slice(0, MAX_CONTENT_LENGTH),
  }
}

function parseJsonResponse(raw) {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonText = fenced ? fenced[1].trim() : trimmed
  return JSON.parse(jsonText)
}

function validateFlashcards(items) {
  if (!Array.isArray(items) || items.length < 5) {
    throw new Error('Expected at least 5 flashcards.')
  }

  const slice = items.length > 20 ? items.slice(0, 20) : items

  return slice.map((item, index) => {
    const question = item?.question?.trim()
    const answer = item?.answer?.trim()
    if (!question || !answer) {
      throw new Error(`Flashcard ${index + 1} is missing question or answer.`)
    }
    return { question, answer }
  })
}

function validateQuizQuestions(items) {
  if (!Array.isArray(items) || items.length !== 10) {
    throw new Error('Expected exactly 10 quiz questions.')
  }

  return items.map((item, index) => {
    const question = item?.question?.trim()
    const optionA = item?.optionA?.trim()
    const optionB = item?.optionB?.trim()
    const optionC = item?.optionC?.trim()
    const optionD = item?.optionD?.trim()
    const correctAnswer = item?.correctAnswer?.trim()?.toUpperCase()
    const explanation = item?.explanation?.trim()

    if (!question || !optionA || !optionB || !optionC || !optionD) {
      throw new Error(`Question ${index + 1} is missing required fields.`)
    }
    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      throw new Error(`Question ${index + 1} has an invalid correctAnswer.`)
    }
    if (!explanation) {
      throw new Error(`Question ${index + 1} is missing an explanation.`)
    }

    return { question, optionA, optionB, optionC, optionD, correctAnswer, explanation }
  })
}

async function callAiWithRetry(systemPrompt, userContent, validateFn, maxTokens) {
  let lastError

  for (let attempt = 1; attempt <= MAX_AI_RETRIES; attempt++) {
    try {
      const raw = await chat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        { maxTokens, jsonMode: true },
      )

      const parsed = parseJsonResponse(raw)
      const items = parsed.flashcards ?? parsed.questions ?? parsed
      return validateFn(items)
    } catch (err) {
      lastError = err
      if (err.message?.startsWith('RATE_LIMIT')) {
        throw new HttpError(429, 'AI service is temporarily rate-limited. Please try again in a moment.')
      }
    }
  }

  throw new HttpError(422, `AI returned invalid content after ${MAX_AI_RETRIES} attempts. Please try again.`, lastError?.message)
}

function wrapAiError(err) {
  if (err instanceof HttpError) {
    throw err
  }
  if (err.message?.startsWith('RATE_LIMIT')) {
    throw new HttpError(429, 'AI service is temporarily rate-limited. Please try again in a moment.')
  }
  if (err.message?.includes('OPENROUTER_API_KEY')) {
    throw new HttpError(503, 'AI service is not configured. Please contact support.')
  }
  throw new HttpError(502, 'AI generation failed. Please try again.', err.message)
}

async function assertDeckOwnership(deckId, userId) {
  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    select: { userId: true },
  })

  if (!deck) {
    throw new HttpError(404, 'Flashcard deck not found.')
  }
  if (deck.userId !== userId) {
    throw new HttpError(403, 'You do not have access to this flashcard deck.')
  }
}

async function assertQuizOwnership(quizId, userId) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { userId: true },
  })

  if (!quiz) {
    throw new HttpError(404, 'Quiz not found.')
  }
  if (quiz.userId !== userId) {
    throw new HttpError(403, 'You do not have access to this quiz.')
  }
}

async function findExistingDeck(userId, sourceType, sourceId) {
  return prisma.flashcardDeck.findFirst({
    where: { userId, sourceType, sourceId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
}

async function findExistingQuiz(userId, sourceType, sourceId) {
  return prisma.quiz.findFirst({
    where: { userId, sourceType, sourceId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
}

export const studyService = {
  async listFlashcardDecks(userId) {
    return prisma.flashcardDeck.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: deckListSelect,
    })
  },

  async getFlashcardDeck(deckId, userId) {
    await assertDeckOwnership(deckId, userId)

    return prisma.flashcardDeck.findUnique({
      where: { id: deckId },
      select: deckDetailSelect,
    })
  },

  async listQuizzes(userId) {
    return prisma.quiz.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: quizListSelect,
    })
  },

  async getQuiz(quizId, userId) {
    await assertQuizOwnership(quizId, userId)

    return prisma.quiz.findUnique({
      where: { id: quizId },
      select: quizDetailSelect,
    })
  },

  async getMaterialsForSource(userId, payload) {
    const { sourceType, sourceId } = validateSourcePayload(payload)

    const [deck, quiz] = await Promise.all([
      findExistingDeck(userId, sourceType, sourceId),
      findExistingQuiz(userId, sourceType, sourceId),
    ])

    return {
      deckId: deck?.id ?? null,
      quizId: quiz?.id ?? null,
    }
  },

  async generateFlashcards(userId, payload) {
    const { sourceType, sourceId } = validateSourcePayload(payload)

    const existing = await findExistingDeck(userId, sourceType, sourceId)
    if (existing) {
      return { deckId: existing.id, existing: true }
    }

    let source
    try {
      source = await resolveSourceContent(sourceType, sourceId, userId)
    } catch (err) {
      if (err instanceof HttpError) throw err
      throw wrapAiError(err)
    }

    const userContent = `Title: "${source.title}"\n\nContent:\n${source.content}`

    let flashcards
    try {
      flashcards = await callAiWithRetry(
        FLASHCARD_SYSTEM_PROMPT,
        userContent,
        validateFlashcards,
        3000,
      )
    } catch (err) {
      throw wrapAiError(err)
    }

    const deck = await prisma.flashcardDeck.create({
      data: {
        title: `${source.title} — Flashcards`,
        sourceType,
        sourceId,
        userId,
        flashcards: {
          create: flashcards,
        },
      },
      select: { id: true },
    })

    activityService.log(
      userId,
      ACTIVITY_TYPES.FLASHCARDS_GENERATED,
      `Generated flashcards for "${source.title}"`,
      `${flashcards.length} cards`,
    )

    return { deckId: deck.id }
  },

  async generateQuiz(userId, payload) {
    const { sourceType, sourceId } = validateSourcePayload(payload)

    const existing = await findExistingQuiz(userId, sourceType, sourceId)
    if (existing) {
      return { quizId: existing.id, existing: true }
    }

    let source
    try {
      source = await resolveSourceContent(sourceType, sourceId, userId)
    } catch (err) {
      if (err instanceof HttpError) throw err
      throw wrapAiError(err)
    }

    const userContent = `Title: "${source.title}"\n\nContent:\n${source.content}`

    let questions
    try {
      questions = await callAiWithRetry(
        QUIZ_SYSTEM_PROMPT,
        userContent,
        validateQuizQuestions,
        4000,
      )
    } catch (err) {
      throw wrapAiError(err)
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: `${source.title} — Quiz`,
        sourceType,
        sourceId,
        userId,
        questions: {
          create: questions,
        },
      },
      select: { id: true },
    })

    activityService.log(
      userId,
      ACTIVITY_TYPES.QUIZ_GENERATED,
      `Generated quiz for "${source.title}"`,
      `${questions.length} questions`,
    )

    return { quizId: quiz.id }
  },
}
