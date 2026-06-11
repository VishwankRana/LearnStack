import { env } from '../config/env.js'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct'

/**
 * Send a chat completion request to OpenRouter.
 * Returns the assistant message text.
 */
export async function chat(messages, { model = DEFAULT_MODEL, maxTokens = 512 } = {}) {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured.')
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mindvault.app',
      'X-Title': 'MindVault',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText)
    throw new Error(`OpenRouter request failed (${response.status}): ${text}`)
  }

  const json = await response.json()
  const content = json.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenRouter returned an empty response.')
  }

  return content.trim()
}
