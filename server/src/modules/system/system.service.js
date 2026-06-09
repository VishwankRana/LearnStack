import { env } from '../../config/env.js'

export const systemService = {
  async getManifest() {
    return {
      name: 'MindVault API',
      version: '1.0.0-phase-1',
      environment: env.NODE_ENV,
      modules: [
        'health',
        'system',
        'authentication',
        'collections (planned)',
        'notes (planned)',
        'bookmarks (planned)',
        'documents (planned)',
      ],
      integrations: {
        database: 'Prisma + PostgreSQL',
        auth: 'JWT + bcrypt',
        storage: 'Supabase Storage (phase 7)',
        ai: 'OpenRouter (phase 8)',
        vectorSearch: 'pgvector (phase 9)',
      },
    }
  },
}
