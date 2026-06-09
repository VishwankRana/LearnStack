import { collectionService } from './collection.service.js'

export async function listCollections(request, response) {
  const collections = await collectionService.list(request.user.id)

  response.json({
    success: true,
    data: collections,
  })
}

export async function getCollection(request, response) {
  const collection = await collectionService.getById(
    request.params.id,
    request.user.id,
  )

  response.json({
    success: true,
    data: collection,
  })
}

export async function createCollection(request, response) {
  const collection = await collectionService.create(
    request.user.id,
    request.body,
  )

  response.status(201).json({
    success: true,
    data: collection,
  })
}

export async function updateCollection(request, response) {
  const collection = await collectionService.update(
    request.params.id,
    request.user.id,
    request.body,
  )

  response.json({
    success: true,
    data: collection,
  })
}

export async function deleteCollection(request, response) {
  const result = await collectionService.remove(
    request.params.id,
    request.user.id,
  )

  response.json({
    success: true,
    data: result,
  })
}
