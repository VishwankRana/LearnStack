import { HttpError } from '../lib/http-error.js'
import { prisma } from '../lib/prisma.js'
import { verifyAccessToken } from '../lib/jwt.js'

export async function authenticate(request, _response, next) {
  try {
    const authorizationHeader = request.headers.authorization

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Authentication token is required.')
    }

    const token = authorizationHeader.replace('Bearer ', '')
    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new HttpError(401, 'Authentication token is invalid.')
    }

    request.user = user
    request.auth = { token, userId: user.id }
    next()
  } catch {
    next(new HttpError(401, 'Authentication token is invalid.'))
  }
}
