import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

const DEFAULT_EXPIRY = '7d'

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN ?? DEFAULT_EXPIRY,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET)
}
