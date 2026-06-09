import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import {
  getCurrentUser,
  login,
  logout,
  register,
} from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', authenticate, logout)
authRouter.get('/me', authenticate, getCurrentUser)
