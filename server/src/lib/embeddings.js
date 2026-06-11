import { logger } from './logger.js'

// Lazily initialised — model downloads once to ~/.cache/huggingface on first use
let _pipeline = null

async function getPipeline() {
  if (_pipeline) return _pipeline

  // Dynamic import so the heavy ONNX runtime only loads when first needed
  const { pipeline, env } = await import('@xenova/transformers')

  // Run inference in the main thread (no worker needed for server-side use)
  env.backends.onnx.wasm.numThreads = 1

  logger.info('Loading embedding model (Xenova/all-MiniLM-L6-v2)…')
  _pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  logger.info('Embedding model ready.')

  return _pipeline
}

/**
 * Convert text into a 384-dimensional float32 embedding vector.
 * Returns a plain number[] suitable for pgvector storage.
 */
export async function generateEmbedding(text) {
  if (!text?.trim()) return null

  // Truncate to ~500 words to keep inference fast
  const input = text.trim().split(/\s+/).slice(0, 500).join(' ')

  const extractor = await getPipeline()
  const output = await extractor(input, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

/**
 * Warm up the model at server startup so first user request isn't slow.
 * Call fire-and-forget: warmupEmbeddingModel().catch(() => {})
 */
export async function warmupEmbeddingModel() {
  try {
    await generateEmbedding('warmup')
  } catch (err) {
    logger.error('Embedding model warmup failed', { cause: err?.message })
  }
}
