import { backgroundOptions } from '@/features/pre-join/data/backgrounds'

const cache = new Map<string, HTMLImageElement>()

export function loadBackgroundImage(imageId: string): Promise<HTMLImageElement> {
  const cached = cache.get(imageId)
  if (cached) return Promise.resolve(cached)

  const option = backgroundOptions.find((candidate) => candidate.id === imageId)
  if (!option) return Promise.reject(new Error(`Unknown background image: ${imageId}`))

  const img = new Image()
  img.src = option.fullSrc
  return img.decode().then(() => {
    cache.set(imageId, img)
    return img
  })
}
