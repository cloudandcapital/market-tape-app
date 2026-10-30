import test from 'node:test'
import assert from 'node:assert/strict'
import { BriefGenerationDeferredError, briefGenerationCacheKey, createBriefGenerationGate } from '../lib/briefGenerationPolicy'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((accept, fail) => { resolve = accept; reject = fail })
  return { promise, resolve, reject }
}

test('the generation clock does not invalidate otherwise identical model inputs', () => {
  const prompt = { marketData: { spy: 100 }, infrastructure: 'Fictional benchmark: 1.4%', instructions: ['Use score units'], generationTime: '2026-10-01T00:00:00Z' }
  const key = briefGenerationCacheKey('fictional-model', 'Ground claims in sources', JSON.stringify(prompt))
  assert.equal(key, briefGenerationCacheKey('fictional-model', 'Ground claims in sources', JSON.stringify({ ...prompt, generationTime: '2026-10-02T00:00:00Z' })))
  for (const changed of [
    { ...prompt, marketData: { spy: 101 } },
    { ...prompt, infrastructure: 'Fictional benchmark: 2.1%' },
    { ...prompt, instructions: ['Check changed source units'] },
  ]) assert.notEqual(key, briefGenerationCacheKey('fictional-model', 'Ground claims in sources', JSON.stringify(changed)))
  assert.notEqual(key, briefGenerationCacheKey('another-model', 'Ground claims in sources', JSON.stringify(prompt)))
  assert.notEqual(key, briefGenerationCacheKey('fictional-model', 'New system contract', JSON.stringify(prompt)))
  assert.notEqual(
    briefGenerationCacheKey('fictional-model', 'Same system', JSON.stringify(prompt), { sourceReview: 'old' }),
    briefGenerationCacheKey('fictional-model', 'Same system', JSON.stringify(prompt), { sourceReview: 'new' }),
  )
})

test('simultaneous identical requests share one generation', async () => {
  const pending = deferred<string>()
  let calls = 0
  const generate = createBriefGenerationGate<string>()
  const operation = () => { calls++; return pending.promise }
  const requests = Array.from({ length: 12 }, () => generate('same-inputs', operation))
  await Promise.resolve()
  assert.equal(calls, 1)
  pending.resolve('fictional analysis')
  assert.deepEqual(await Promise.all(requests), Array(12).fill('fictional analysis'))
})

test('a completed result covers a delayed shared-cache write, then releases normally', async () => {
  let now = 0
  let calls = 0
  const generate = createBriefGenerationGate<number>({ now: () => now })
  const operation = async () => ++calls
  assert.equal(await generate('same-inputs', operation), 1)
  now = 59_000
  assert.equal(await generate('same-inputs', operation), 1)
  assert.equal(calls, 1)
  now = 60_001
  assert.equal(await generate('same-inputs', operation), 2)
})

test('a failed paid attempt has a cooldown, and a later request can recover', async () => {
  let now = 0
  let calls = 0
  const generate = createBriefGenerationGate<string>({ now: () => now })
  await assert.rejects(generate('same-inputs', async () => { calls++; throw new Error('Fictional provider failure') }), /Fictional provider failure/)
  now = 20_000
  await assert.rejects(generate('same-inputs', async () => { calls++; return 'must not run' }), error => error instanceof BriefGenerationDeferredError && error.retryAfterSeconds === 40)
  assert.equal(calls, 1)
  now = 60_001
  assert.equal(await generate('same-inputs', async () => { calls++; return 'recovered' }), 'recovered')
  assert.equal(calls, 2)
})

test('synchronous provider failures also release the active slot and back off', async () => {
  const generate = createBriefGenerationGate<string>()
  await assert.rejects(generate('first', () => { throw new Error('Fictional synchronous failure') }), /synchronous failure/)
  assert.equal(await generate('different-inputs', async () => 'allowed'), 'allowed')
  await assert.rejects(generate('first', async () => 'must not run'), BriefGenerationDeferredError)
})

test('a different cold input is deferred while another generation is active', async () => {
  const pending = deferred<string>()
  let secondCalls = 0
  const generate = createBriefGenerationGate<string>()
  const first = generate('first', () => pending.promise)
  await assert.rejects(generate('second', async () => { secondCalls++; return 'second' }), BriefGenerationDeferredError)
  assert.equal(secondCalls, 0)
  pending.resolve('first')
  await first
  assert.equal(await generate('second', async () => { secondCalls++; return 'second' }), 'second')
})

test('short-lived result retention stays bounded and expires without evicting an active operation', async () => {
  let now = 0
  const generate = createBriefGenerationGate<string>({ now: () => now })
  for (let i = 0; i < 32; i++) assert.equal(await generate(`input-${i}`, async () => `result-${i}`), `result-${i}`)
  await assert.rejects(generate('another-input', async () => 'must not run'), BriefGenerationDeferredError)
  now = 60_001
  assert.equal(await generate('another-input', async () => 'new result'), 'new result')
})
