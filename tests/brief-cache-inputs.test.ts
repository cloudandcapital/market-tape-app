import test from 'node:test'
import assert from 'node:assert/strict'
import { briefMultiplesInput } from '../lib/briefCacheInputs.js'
import { buildInfraContextBlock } from '../lib/industryBenchmarks'

const values = { publicCloud: '~8.3×', saas: '~6.4×', aiInfra: '~12.2×', source: 'live' as const }
const baskets = { publicCloud: { source: 'live' as const }, saas: { source: 'live' as const }, aiInfra: { source: 'live' as const } }

test('request timestamps and display metadata do not create a new model cache entry', () => {
  const first = { ...values, asOf: '2026-10-25T12:00:00Z', baskets: Object.fromEntries(Object.entries(baskets).map(([name, basket]) => [name, { ...basket, dataAsOf: '2026-10-25T12:00:00Z' }])) }
  const second = { ...values, asOf: '2026-10-25T12:00:01Z', baskets: Object.fromEntries(Object.entries(baskets).map(([name, basket]) => [name, { ...basket, dataAsOf: '2026-10-25T12:00:01Z' }])) }
  assert.notEqual(JSON.stringify(first), JSON.stringify(second))
  assert.equal(JSON.stringify(briefMultiplesInput(first)), JSON.stringify(briefMultiplesInput(second)))
  assert.deepEqual(briefMultiplesInput(first), { ...values, baskets })
  assert.equal(first.asOf, '2026-10-25T12:00:00Z')
})

test('changed valuation inputs or live versus fallback provenance invalidate the cache', () => {
  const key = JSON.stringify(briefMultiplesInput(values))
  for (const changed of [
    { ...values, publicCloud: '~9.0×' },
    { ...values, saas: '~7.0×' },
    { ...values, aiInfra: '~14.0×' },
    { ...values, source: 'fallback' as const },
  ]) assert.notEqual(JSON.stringify(briefMultiplesInput(changed)), key)
})

test('the cache key is canonical even when the caller builds properties in a different order', () => {
  const reordered = { source: values.source, aiInfra: values.aiInfra, saas: values.saas, publicCloud: values.publicCloud }
  assert.equal(JSON.stringify(briefMultiplesInput(values)), JSON.stringify(briefMultiplesInput(reordered)))
})

test('mixed live and fallback sources survive normalization and source changes invalidate the cache', () => {
  const mixed = { ...values, source: 'fallback' as const, baskets: { ...baskets, saas: { source: 'fallback' as const } } }
  assert.deepEqual(briefMultiplesInput(mixed).baskets, mixed.baskets)
  const changed = { ...mixed, baskets: { ...mixed.baskets, publicCloud: { source: 'fallback' as const } } }
  assert.notEqual(JSON.stringify(briefMultiplesInput(mixed)), JSON.stringify(briefMultiplesInput(changed)))
})

test('missing sources stay missing and output does not invent a live source', () => {
  assert.deepEqual(briefMultiplesInput({ publicCloud: 'Unavailable', saas: 'Unavailable', aiInfra: 'Unavailable' }), {
    publicCloud: 'Unavailable', saas: 'Unavailable', aiInfra: 'Unavailable',
  })
})

test('source projection is canonical, excludes unrelated display fields, and does not mutate its input', () => {
  const original = { ...values, baskets: { aiInfra: { source: 'live' as const, dataAsOf: 'later' }, publicCloud: { source: 'live' as const, dataAsOf: 'now' }, saas: { source: 'live' as const, lastKnownValue: '6.5×' } } }
  const before = structuredClone(original)
  const projected = briefMultiplesInput(original)
  assert.deepEqual(projected, { ...values, baskets })
  assert.equal(JSON.stringify(projected), JSON.stringify(briefMultiplesInput({ ...values, baskets })))
  assert.deepEqual(original, before)
  assert.notEqual(projected.baskets?.publicCloud, original.baskets.publicCloud)
})

test('normalized mixed sources produce correct model attribution without an undefined fetch date', () => {
  const mixed = { ...values, saas: 'Unavailable', source: 'fallback' as const, baskets: { ...baskets, saas: { source: 'fallback' as const } } }
  const prompt = buildInfraContextBlock(briefMultiplesInput(mixed))
  assert.match(prompt, /Public Cloud[^\n]+source: Yahoo Finance basket median, live/)
  assert.match(prompt, /SaaS Average[^\n]+source: UNAVAILABLE/)
  assert.match(prompt, /AI Infrastructure[^\n]+source: Yahoo Finance basket median, live/)
  assert.doesNotMatch(prompt, /fetched undefined/)
})

test('the unnormalized source display keeps its supplied date', () => {
  const raw = { ...values, baskets: Object.fromEntries(Object.entries(baskets).map(([name, basket]) => [name, { ...basket, dataAsOf: '2026-10-25T12:00:00Z' }])) }
  const prompt = buildInfraContextBlock(raw)
  assert.equal((prompt.match(/fetched 2026-10-25T12:00:00Z/g) || []).length, 3)
})
