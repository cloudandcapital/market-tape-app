import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { validateMarketData, snapshotIsOld, yieldChangeBasisPoints } from '../lib/marketIntegrity'
import { formatMarketSessionLabel } from '../lib/data'
import { assertBriefResponse } from '../lib/briefValidation'
import { validateRiskAlerts } from '../lib/intelligentGuardrails'
import { BENCHMARKS } from '../lib/industryBenchmarks'
import CloudReview from '../components/CloudReview'
import MacroContext from '../components/MacroContext'
import TechConcentration from '../components/TechConcentration'
import AllInstruments from '../components/AllInstruments'
import AIComputeCommitments from '../components/AIComputeCommitments'
import { CountriesGlobal } from '../components/SectorLeaders'
import { equityBreadth } from '../lib/equityBreadth'
import { numberTone, signedNumber } from '../lib/numberFormat'
import { aiComputeData, getSignedDollarSummary } from '../lib/aiCompute'
import { buildContextData } from '../lib/marketContext'
import { CloudValuations } from '../components/IntelligentSignals'
import { enforceMorningBriefGuardrails, MORNING_BRIEF_DECISION_CONTEXT, MORNING_BRIEF_SAFE_FALLBACK } from '../lib/morningBriefGuardrails'
import { IntelligentCtx } from '../components/IntelligentProvider'
import type { Meta, Snapshot, SnapshotRow } from '../lib/types'
import type { BriefResponse, MarketContextData } from '../lib/intelligentTypes'
import type { LiveMultiples } from '../lib/liveMultiples'

function fixture() {
  const row = (ticker: string, rs1m: number): SnapshotRow => ({ ticker, name: ticker, short_name: ticker, last: 100,
    price_date: '2026-10-22', price_source: 'test fixture', price_status: 'current', intra_pct: 1,
    d1_pct: 1, d5_pct: 1, d20_pct: 1, atr_pct: 1, dist50_atr: 1, rs1m,
    trend_grade: 'B', above_20d: true, above_50d: true, mini_rs_chart: '', tradingview_symbol: ticker, leveraged: { long: null, short: null } })
  const qqq = row('QQQ', -1)
  const snapshot: Snapshot = { generated_at_utc: '2026-10-23T00:15:00Z', benchmark: 'SPY', groups: [
    { name: 'Macro', rows: [row('SPY', 0), row('^VIX', 2), qqq] },
    { name: 'Tech', rows: [structuredClone(qqq)] },
  ] }
  const meta: Meta = { app: 'test', generated_at_utc: snapshot.generated_at_utc, benchmark: 'SPY', group_count: 2,
    instrument_count: 3, display_row_count: 4, leaders: { sectors: [], countries: [] },
    status: { exposure: { level: 33, guidance: 'Defensive' }, trend: { long_term: 'Sideways', intermediate_term: 'Sideways', short_term: 'Up' },
      risk: { volatility: 'Neutral', sentiment: 'Bullish', momentum: 'Neutral' }, breadth: { above_20d_pct: 100, above_50d_pct: 100, breadth_label: 'Strong' }, momentum_env: { score: 85, label: 'Momentum-Friendly' } },
    leaderboard: { leaders: [], laggards: [], universe_count: 3 } }
  return { meta, snapshot }
}

test('four displayed rows reconcile to three unique instruments and the price date survives a later publication date', () => {
  const { meta, snapshot } = fixture()
  assert.equal(validateMarketData(meta, snapshot).meta.instrument_count, 3)
  assert.equal(formatMarketSessionLabel(snapshot.groups[0].rows[0].price_date), 'Prices dated · Oct 22, 2026 · ET')
})

test('mismatched runs, conflicting duplicates, stale prices, invalid numbers, and inflated breadth fail closed', () => {
  const mutations: Array<(data: ReturnType<typeof fixture>) => void> = [
    d => { d.meta.generated_at_utc = '2026-10-23T01:00:00Z' },
    d => { d.snapshot.groups[1].rows[0].last = 101 },
    d => { d.snapshot.groups[0].rows[0].price_status = 'stale' },
    d => { d.snapshot.groups[0].rows[0].price_date = '2026-10-21' },
    d => { d.snapshot.groups[0].rows[0].d1_pct = NaN },
    d => { d.meta.status.breadth.above_50d_pct = 75 },
    d => { d.meta.instrument_count = 4 },
    d => { d.meta.status.exposure.guidance = 'Risk-On' },
  ]
  for (const mutate of mutations) { const data = fixture(); mutate(data); assert.throws(() => validateMarketData(data.meta, data.snapshot)) }
})

test('snapshot age backstop does not call a weekend snapshot stale after only two days', () => {
  const published = '2026-10-23T21:30:00Z'
  assert.equal(snapshotIsOld(published, Date.parse('2026-10-25T21:30:00Z')), false)
  assert.equal(snapshotIsOld(published, Date.parse('2026-10-28T21:30:00Z')), true)
})

test('yield movement uses basis points rather than confusing a relative percent with percentage points', () => {
  assert.ok(Math.abs(yieldChangeBasisPoints(4.95, -3.8)! - (-19.55)) < 0.02)
  assert.equal(yieldChangeBasisPoints(4, -100), null)
})

test('macro flags use actual price changes, even when relative-strength scores point the other way', () => {
  const inputs = { market: { macroData: { tlt: { rs1m: -9, d20: 2, grade: 'A', d1: 1 }, dxy: { rs1m: -10, d20: 1, last: 100 }, hyg: null, gld: null, uso: null, iwm: null, qqq: null } }, multiples: { saas: '6×' }, benchmarks: BENCHMARKS }
  const alerts: BriefResponse['riskAlerts'] = ['Bond ETF Weakness', 'Dollar Weakening', 'SaaS Discount Window'].map(title => ({ type: 'warning', title, message: 'Test observation' }))
  assert.deepEqual(validateRiskAlerts(alerts, inputs), [])
  inputs.market.macroData.tlt.d20 = -3
  inputs.market.macroData.tlt.rs1m = 2
  assert.deepEqual(validateRiskAlerts(alerts, inputs).map(alert => alert.title), ['Bond ETF Weakness'])
})

test('cloud questions work without AI and never label Spot safe', () => {
  const html = renderToStaticMarkup(createElement(CloudReview))
  assert.match(html, /Can the job stop and restart/)
  assert.match(html, /unused capacity/)
  assert.doesNotMatch(html, /FAVORABLE|SAFE|RISKY|Lumen analysis is temporarily unavailable/)
})

test('a falling relative score does not become a falling ETF price or a widening credit spread', () => {
  const { snapshot } = fixture()
  snapshot.groups[0].rows = [
    { ...snapshot.groups[0].rows[0], ticker: 'TLT', d20_pct: 3, rs1m: -2 },
    { ...snapshot.groups[0].rows[0], ticker: 'HYG', d20_pct: 1, rs1m: -4, trend_grade: 'C' },
  ]
  const html = renderToStaticMarkup(createElement(MacroContext, { snapshot }))
  assert.match(html, /\+3\.00% · 20D/)
  assert.match(html, /-2\.00 score/)
  assert.doesNotMatch(html, /Widening|Tight|Falling/)
})

test('a cached model cannot replace a real valuation value', () => {
  const multiples: LiveMultiples = { publicCloud: '~9.1×', saas: 'Unavailable', aiInfra: 'Unavailable', asOf: '2026-10-22', source: 'fallback', baskets: {
    publicCloud: { source: 'live', dataAsOf: '2026-10-22' }, saas: { source: 'fallback', dataAsOf: '2026-04-24' }, aiInfra: { source: 'fallback', dataAsOf: '2026-04-24' },
  } }
  const fake = { cloudValuations: { publicCloud: '999×', saasAverage: '999×', aiInfrastructure: '999×' } } as BriefResponse
  const html = renderToStaticMarkup(createElement(IntelligentCtx.Provider, { value: { data: fake, loading: false, error: false, cachedAt: null, contextData: null, refresh() {} } }, createElement(CloudValuations, { multiples })))
  assert.match(html, /9\.1×/)
  assert.doesNotMatch(html, /999/)
})

test('incomplete prose and explicit score-as-percentage claims are rejected', () => {
  const brief = { morningBrief: { headline: 'Mixed signals', marketRead: 'TLT has a score of +1.08.', action: 'Compare the sector scores.', whatChanged: [], cloudFinanceImplications: [] }, finopsSignals: { cloudSpend: 'Check usage.', saasRenewals: 'Check notice dates.', infrastructure: 'Check provider terms.' }, riskAlerts: [], sectorInsights: 'XLP has the highest score.' }
  assert.doesNotThrow(() => assertBriefResponse(brief))
  for (const text of ['TLT has RS of +1.08%.', 'TLT +1.08% 1M RS', 'The relative strength score is -2.5%.']) {
    assert.throws(() => assertBriefResponse({ ...brief, sectorInsights: text }), /score and percentage/)
  }
  assert.throws(() => assertBriefResponse({ morningBrief: {} }), /Incomplete/)
  for (const text of ['54.17% of stocks above their 20-day average.', 'Stocks above the 50-day moving average are weakening.']) {
    assert.throws(() => assertBriefResponse({ ...brief, sectorInsights: text }), /breadth stocks/)
  }
})

test('legacy morning brief rejects investment-like directives and always adds operating context', () => {
  const productionFailure = [
    'Market participation remains mixed.',
    'This is not a market rewarding aggression, so exposure guidance is parked at a cautious hold.',
    'Watch whether defensive sector leadership holds or fades intraday.',
  ].join('\n\n')
  assert.equal(enforceMorningBriefGuardrails(productionFailure), MORNING_BRIEF_SAFE_FALLBACK)
  assert.doesNotMatch(MORNING_BRIEF_SAFE_FALLBACK, /exposure guidance|cautious hold|aggression|risk[- ]on|risk[- ]off/i)

  const neutral = [
    'Tracked equity ETF participation is mixed in the dated snapshot.',
    'Technology-finance teams should verify current operating evidence.',
    'Watch the next dated breadth reading.',
  ].join('\n\n')
  const guarded = enforceMorningBriefGuardrails(neutral)
  assert.match(guarded, new RegExp(MORNING_BRIEF_DECISION_CONTEXT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.equal(guarded.split(/\n\s*\n/).length, 3)
})

test('hyperscaler benchmark carries Meta Q3 guidance without closing the remaining earnings review', () => {
  const benchmark = BENCHMARKS.hyperscalerCapexTrend
  assert.equal(benchmark.lastUpdated, '2026-10-21')
  assert.equal(benchmark.nextReviewDue, '2026-11-01')
  assert.match(benchmark.notes, /Meta \$135–145B/)
  assert.ok(benchmark.sourceLinks?.some(link => link.label === 'Meta — Q3 2026 results'))
})

test('a stress move in VIX or bonds cannot improve equity ETF breadth; repeated funds count once', () => {
  const { snapshot } = fixture()
  const base = snapshot.groups[0].rows[0]
  snapshot.groups[0].rows.push({ ...base, ticker: 'IWM', rs1m: 1, above_50d: false })
  const before = equityBreadth(snapshot)
  assert.deepEqual({ count: before.count, positive: before.positiveCount, level: before.level, above50d: before.above50d, band: before.band }, { count: 2, positive: 1, level: 50, above50d: 50, band: 'Middle band' })
  snapshot.groups[0].rows.find(row => row.ticker === '^VIX')!.rs1m = 100
  snapshot.groups[0].rows.push({ ...base, ticker: 'TLT', rs1m: 100 }, { ...base, ticker: 'BIL', rs1m: 100 })
  assert.deepEqual(equityBreadth(snapshot), before)
})

test('small caps compare with SPY, while the XLK grade is labeled as its own trend', () => {
  const { snapshot } = fixture()
  const base = snapshot.groups[0].rows[0]
  snapshot.groups[0].rows.push({ ...base, ticker: 'IWM', rs1m: -0.336 }, { ...base, ticker: 'XLK', rs1m: -0.92, trend_grade: 'C' })
  const macro = renderToStaticMarkup(createElement(MacroContext, { snapshot }))
  assert.match(macro, /Small caps vs S&amp;P 500/)
  assert.match(macro, /IWM behind/)
  assert.match(macro, /-0.34 score gap/)
  const tech = renderToStaticMarkup(createElement(TechConcentration, { snapshot }))
  assert.match(tech, /XLK trend/)
  assert.match(tech, /XLK · RS1M vs SPY/)
})

test('rounded zero has no positive sign or gain color, including negative zero', () => {
  for (const value of [-0, -0.001, 0, 0.001]) {
    assert.equal(signedNumber(value), '0.00')
    assert.equal(numberTone(value), 'text-charcoal/65')
  }
  const { meta } = fixture()
  meta.leaders.countries = [{ ticker: 'INDA', name: 'India', rs1m: -0 }]
  const html = renderToStaticMarkup(createElement(CountriesGlobal, { meta }))
  assert.doesNotMatch(html, /\+0\.00|text-sage-dark/)
})

test('the full instrument table includes source instruments once and labels price changes separately', () => {
  const { snapshot } = fixture()
  const html = renderToStaticMarkup(createElement(AllInstruments, { snapshot }))
  assert.match(html, /All 3 tracked instruments/)
  assert.equal((html.match(/href="https:\/\/finance.yahoo.com\/quote\/QQQ\//g) ?? []).length, 1)
  assert.match(html, /20D/)
  assert.match(html, /RS1M score/)
  assert.match(html, /Macro/)
})

test('AI compute summary is fixed at every width and never claims a visitor budget horizon', () => {
  const html = renderToStaticMarkup(createElement(AIComputeCommitments))
  assert.match(html, /\$265B\+/)
  assert.match(html, /4 qualifying contracts/)
  assert.doesNotMatch(html, /forcing|next 6 months|Loading AI|Refresh analysis/)
})

test('analysis context uses equity breadth and includes Treasury yields and infrastructure ETF price moves', () => {
  const { snapshot, meta } = fixture()
  const base = snapshot.groups[0].rows[0]
  snapshot.groups[0].rows.push({ ...base, ticker: '^TNX', last: 4.95, d1_pct: -3.8 })
  snapshot.groups.push({ name: 'AI & Infrastructure', rows: [{ ...base, ticker: 'SMH', d1_pct: -6 }] })
  const context = buildContextData(meta, snapshot)
  assert.equal(context.marketData.equityBasket?.count, 2)
  assert.equal(context.marketData.guidance, 'Lower band')
  assert.ok(context.macroData.tnx!.dailyBasisPoints! < -19)
  assert.equal(context.infrastructureData![0].d1, -6)
})

test('an entirely unavailable valuation section is suppressed rather than filled with archived cards', () => {
  const { baskets } = { baskets: Object.fromEntries(['publicCloud', 'saas', 'aiInfra'].map(key => [key, { source: 'fallback', dataAsOf: '2026-04-24' }])) }
  const html = renderToStaticMarkup(createElement(CloudValuations, { multiples: { publicCloud: 'Unavailable', saas: 'Unavailable', aiInfra: 'Unavailable', source: 'fallback', asOf: '2026-04-24', baskets } as LiveMultiples }))
  assert.equal(html, '')
})

test('supported data-center alerts describe the source, without internal trigger or invented record language', () => {
  const { meta, snapshot } = fixture()
  const inputs = { market: buildContextData(meta, snapshot), multiples: { saas: 'Unavailable' }, benchmarks: BENCHMARKS }
  const alerts = validateRiskAlerts([{ title: 'Data Center Capacity Tightness', type: 'warning', message: 'At or below the ≤2% threshold, a new record low.' }], inputs)
  assert.match(alerts[0].message, /unchanged from year-end 2025/)
  assert.doesNotMatch(alerts[0].message, /threshold|≤|record.low/)
})

test('a cancellable monthly compute agreement is sourced to the filing and never annualized into the headline', () => {
  const row = aiComputeData.find(row => row.buyer === 'Anthropic' && row.provider.startsWith('xAI / SpaceX'))!
  assert.match(row.term, /90 days/)
  assert.equal(row.amountBasis, 'undisclosed')
  assert.equal(row.amountBillions, undefined)
  assert.ok(row.sources.some(source => source.url.includes('sec.gov/Archives')))
  assert.equal(getSignedDollarSummary().totalBillions, 265)
})
