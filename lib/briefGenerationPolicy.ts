import { createHash } from 'node:crypto'

const RETAIN_RESULT_MS = 60_000
const FAILURE_COOLDOWN_MS = 60_000
const MAX_ENTRIES = 32

export class BriefGenerationDeferredError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super('Analysis generation is temporarily deferred.')
    this.name = 'BriefGenerationDeferredError'
  }
}

/** Include the actual prompt contract, but never its server-assigned generation clock. */
export function briefGenerationCacheKey(model: string, system: string, prompt: string, generationInputs?: unknown): string {
  const stablePrompt = { ...JSON.parse(prompt) }
  delete stablePrompt.generationTime
  return createHash('sha256').update(JSON.stringify({ model, system, prompt: stablePrompt, generationInputs })).digest('hex')
}

/** Process-local coalescing and failure backoff; this is not a durable spending quota. */
export function createBriefGenerationGate<T>({ now = Date.now }: { now?: () => number } = {}) {
  const entries = new Map<string, { promise: Promise<T>; state: 'pending' | 'success' | 'failed'; expiresAt: number }>()
  let active = 0

  return async function generate(key: string, operation: () => Promise<T>): Promise<T> {
    const timestamp = now()
    for (const [storedKey, entry] of entries) {
      if (entry.state !== 'pending' && entry.expiresAt <= timestamp) entries.delete(storedKey)
    }

    const existing = entries.get(key)
    if (existing) {
      if (existing.state === 'failed') {
        throw new BriefGenerationDeferredError(Math.max(1, Math.ceil((existing.expiresAt - timestamp) / 1000)))
      }
      return existing.promise
    }
    if (active > 0) throw new BriefGenerationDeferredError(15)
    if (entries.size >= MAX_ENTRIES) {
      const nextExpiry = Math.min(...Array.from(entries.values(), entry => entry.expiresAt))
      throw new BriefGenerationDeferredError(Math.max(1, Math.ceil((nextExpiry - timestamp) / 1000)))
    }

    const promise = Promise.resolve().then(operation)
    const entry = { promise, state: 'pending' as 'pending' | 'success' | 'failed', expiresAt: Infinity }
    entries.set(key, entry)
    active++
    promise.then(
      () => {
        active--
        entry.state = 'success'
        // Bridge the interval between generation finishing and the shared cache write.
        entry.expiresAt = now() + RETAIN_RESULT_MS
      },
      () => {
        active--
        entry.state = 'failed'
        entry.expiresAt = now() + FAILURE_COOLDOWN_MS
      },
    )
    return promise
  }
}
