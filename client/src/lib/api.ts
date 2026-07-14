export interface PredictionResult {
  model: string
  sentiment: string
  confidence: number
  probabilities: Record<string, number>
  processing_time_ms: number
}

export interface PredictResponse {
  success: boolean
  data?: {
    text: string
    sentiment?: string
    confidence?: number
    probabilities?: Record<string, number>
    model?: string
    processing_time_ms?: number
    truncated?: boolean
    comparison?: boolean
    results?: PredictionResult[]
  }
  error?: {
    code: string
    message: string
  }
}

export interface HealthResponse {
  success: boolean
  data: {
    status: string
    model_loaded: boolean
  }
}

const BASE_URL = 'http://localhost:8000'

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`)
  if (!res.ok) throw new Error('API unavailable')
  return res.json()
}

export async function predictSentiment(
  text: string,
  model: 'svm' | 'lr' | 'both' = 'svm',
): Promise<PredictResponse> {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model }),
  })
  return res.json()
}
