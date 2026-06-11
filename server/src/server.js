import { createApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'
import { warmupEmbeddingModel } from './lib/embeddings.js'

const app = createApp()

app.listen(env.PORT, () => {
  logger.info(`MindVault API listening on http://localhost:${env.PORT}`)
  // Warm up embedding model in the background so first search is fast
  warmupEmbeddingModel().catch(() => {})
})
