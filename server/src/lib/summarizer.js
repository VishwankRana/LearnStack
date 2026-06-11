import { chat } from './openrouter.js'
import { HttpError } from './http-error.js'

const DOCUMENT_SYSTEM_PROMPT =
  'You are a concise summarization assistant. Produce clear, informative summaries in plain prose. No bullet lists, no headings, no preamble like "Here is a summary". Just the summary itself.'

const NOTE_SYSTEM_PROMPT = `You are an expert study assistant. Transform the provided notes into a student-friendly study guide using the exact markdown structure below. Do not add any text before the first heading.

# <Topic Title>

## Overview
A 4–5 sentence explanation of the topic.

## Key Concepts
- Concept 1
- Concept 2
- Concept 3

## Important Definitions
- **Term**: definition
- **Term**: definition

## Key Points for Exams
- Point 1
- Point 2
- Point 3

## Quick Revision Notes
Concise bullet points for fast review.

## Common Mistakes
Common misunderstandings or errors to avoid (skip this section if not applicable).

## Summary
A final 5-bullet revision sheet.`

/**
 * Summarize a document using its extracted text.
 * Falls back to title-based summary when no text is available.
 */
export async function summarizeDocument(title, extractedText) {
  if (!extractedText?.trim() && !title?.trim()) {
    throw new HttpError(422, 'Nothing to summarize — the document has no extracted text.')
  }

  const content = extractedText?.trim()
    ? `Document title: "${title}"\n\nContent:\n${extractedText.slice(0, 8000)}`
    : `Document title: "${title}"\n\nNo text content was extracted from this document.`

  return chat([
    { role: 'system', content: DOCUMENT_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Summarize the following document in 2–4 sentences:\n\n${content}`,
    },
  ])
}

/**
 * Transform a note into a structured student study guide.
 */
export async function summarizeNote(title, content) {
  if (!content?.trim() && !title?.trim()) {
    throw new HttpError(422, 'Nothing to summarize — the note is empty.')
  }

  const noteContent = content?.trim()
    ? `Notes title: "${title}"\n\nNotes:\n${content.slice(0, 8000)}`
    : `Notes title: "${title}"\n\n(No content written yet.)`

  return chat(
    [
      { role: 'system', content: NOTE_SYSTEM_PROMPT },
      { role: 'user', content: noteContent },
    ],
    { maxTokens: 1500 },
  )
}

/**
 * Summarize a bookmark using its title, URL, and optional description.
 */
export async function summarizeBookmark(title, url, description) {
  if (!title?.trim()) {
    throw new HttpError(422, 'Nothing to summarize — the bookmark has no title.')
  }

  const parts = [`Bookmark title: "${title}"`, `URL: ${url}`]
  if (description?.trim()) {
    parts.push(`Description: ${description}`)
  }

  return chat([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Summarize the following bookmarked resource in 2–3 sentences:\n\n${parts.join('\n')}`,
    },
  ])
}
