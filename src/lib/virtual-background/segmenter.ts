import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision'

const WASM_BASE_PATH = '/mediapipe/wasm'
const MODEL_ASSET_PATH = '/mediapipe/models/selfie_segmenter.tflite'

let segmenterPromise: Promise<ImageSegmenter> | null = null

async function createSegmenter(): Promise<ImageSegmenter> {
  const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_PATH)

  try {
    return await ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_ASSET_PATH, delegate: 'GPU' },
      runningMode: 'VIDEO',
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    })
  } catch {
    return ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_ASSET_PATH, delegate: 'CPU' },
      runningMode: 'VIDEO',
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    })
  }
}

export function getImageSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = createSegmenter().catch((error) => {
      segmenterPromise = null
      throw error
    })
  }
  return segmenterPromise
}
