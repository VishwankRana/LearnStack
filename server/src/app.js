import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { apiRouter } from './routes/index.js'
import { errorHandler } from './middleware/error-handler.js'
import { notFoundHandler } from './middleware/not-found.js'
import { requestContext } from './middleware/request-context.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  )
  app.use(requestContext)
  app.use(morgan('dev'))
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.get('/', (_request, response) => {
    response.json({
      message: 'MindVault API foundation is running.',
      docs: '/api/v1/system/manifest',
    })
  })

  app.use('/api/v1', apiRouter)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
