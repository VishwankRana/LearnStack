import bcrypt from 'bcryptjs'
import { HttpError } from '../../lib/http-error.js'
import { signAccessToken } from '../../lib/jwt.js'
import { prisma } from '../../lib/prisma.js'

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function validateAuthPayload(payload, mode) {
  const name = payload.name?.trim()
  const email = payload.email?.trim().toLowerCase()
  const password = payload.password?.trim()
  const avatar = payload.avatar?.trim() || null
  const bio = payload.bio?.trim() || null

  if (mode === 'register' && !name) {
    throw new HttpError(400, 'Name is required.')
  }

  if (!email) {
    throw new HttpError(400, 'Email is required.')
  }

  if (!password) {
    throw new HttpError(400, 'Password is required.')
  }

  if (password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters long.')
  }

  return { name, email, password, avatar, bio }
}

export const authService = {
  async register(payload) {
    const values = validateAuthPayload(payload, 'register')

    const existingUser = await prisma.user.findUnique({
      where: { email: values.email },
    })

    if (existingUser) {
      throw new HttpError(409, 'An account with that email already exists.')
    }

    const hashedPassword = await bcrypt.hash(values.password, 12)

    const user = await prisma.user.create({
      data: {
        name: values.name,
        email: values.email,
        password: hashedPassword,
        avatar: values.avatar,
        bio: values.bio,
      },
    })

    return {
      token: signAccessToken(user.id),
      user: sanitizeUser(user),
    }
  },

  async login(payload) {
    const values = validateAuthPayload(payload, 'login')

    const user = await prisma.user.findUnique({
      where: { email: values.email },
    })

    if (!user) {
      throw new HttpError(401, 'Invalid email or password.')
    }

    const passwordMatches = await bcrypt.compare(values.password, user.password)

    if (!passwordMatches) {
      throw new HttpError(401, 'Invalid email or password.')
    }

    return {
      token: signAccessToken(user.id),
      user: sanitizeUser(user),
    }
  },

  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new HttpError(404, 'User account not found.')
    }

    return sanitizeUser(user)
  },

  async logout() {
    return {
      message: 'Logout successful.',
    }
  },
}
