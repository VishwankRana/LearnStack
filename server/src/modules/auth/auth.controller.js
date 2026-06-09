import { authService } from './auth.service.js'

export async function register(request, response) {
  const result = await authService.register(request.body)

  response.status(201).json({
    success: true,
    data: result,
  })
}

export async function login(request, response) {
  const result = await authService.login(request.body)

  response.json({
    success: true,
    data: result,
  })
}

export async function logout(_request, response) {
  const result = await authService.logout()

  response.json({
    success: true,
    data: result,
  })
}

export async function getCurrentUser(request, response) {
  const user = await authService.getCurrentUser(request.user.id)

  response.json({
    success: true,
    data: {
      user,
    },
  })
}
