import test from 'node:test'
import assert from 'node:assert/strict'
import { enforceSnapshotLanguage } from '../lib/briefSnapshotLanguage'
import type { BriefResponse, MarketContextData } from '../lib/intelligentTypes'

const context = {
  marketSessionLabel: 'Prices dated · Nov 11, 2026 · ET',
  marketData: { spy: 760.35, spyD1: 1.39, vix: 17.46, vixD1: -10.28 },
} as MarketContextData

function fixture(): BriefResponse {
  return {
    morningBrief: {
      headline: 'Mixed breadth in the dated snapshot',
      marketRead: 'SPY closed at 760.35 on Nov 11, 2026, gaining 1.39% while VIX fell 10.28%.',
      whatChanged: ['QQQ closed higher.', 'SMH rose 5.31% over one session.'],
      cloudFinanceImplications: ['Which seats are used?'],
      action: 'Compare the sector scores.',
    },
    sectorInsights: 'XLV has the highest 20-session score.',
    generatedAt: '2026-11-12T11:18:00Z',
  } as BriefResponse
}

test('a cached final-close claim becomes a dated observation using the supplied figures', () => {
  const original = fixture()
  const before = JSON.stringify(original)
  const result = enforceSnapshotLanguage(original, context)
  assert.equal(result.morningBrief.marketRead, 'Prices dated · Nov 11, 2026 · ET. In that snapshot, SPY was $760.35 (+1.39% over one session) and VIX was 17.46 (-10.28% over one session).')
  assert.deepEqual(result.morningBrief.whatChanged, ['SMH rose 5.31% over one session.'])
  assert.equal(result.generatedAt, original.generatedAt, 'a display correction does not claim a new generation')
  assert.equal(JSON.stringify(original), before, 'the cached record stays intact')
  assert.deepEqual(enforceSnapshotLanguage(result, context), result, 'repeated renders are stable')
})

test('valid snapshot observations and prior-close comparisons remain unchanged', () => {
  const original = fixture()
  original.morningBrief.marketRead = 'SPY was $760.35 in the snapshot. It rose 1.39% versus the previous close.'
  original.morningBrief.whatChanged = ['VIX fell 10.28% over one session.', 'A closed-beta product is mentioned separately.']
  assert.deepEqual(enforceSnapshotLanguage(original, context), original)
})

test('unsupported close language is removed from headline and sector commentary too', () => {
  const original = fixture()
  original.morningBrief.headline = 'Stocks closed higher'
  original.sectorInsights = 'Technology finished at the close. XLV has the highest 20-session score.'
  const result = enforceSnapshotLanguage(original, context)
  assert.equal(result.morningBrief.headline, 'The dated market snapshot')
  assert.equal(result.sectorInsights, 'XLV has the highest 20-session score.')
})
