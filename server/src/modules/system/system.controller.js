import { systemService } from './system.service.js'

export async function getSystemManifest(_request, response) {
  const manifest = await systemService.getManifest()

  response.json({
    success: true,
    data: manifest,
  })
}
