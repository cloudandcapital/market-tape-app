#!/usr/bin/env tsx
// Usage: npm run check-benchmarks
// Reads lib/industryBenchmarks.ts and reports freshness of every benchmark.
// Exits with code 1 if any benchmark is overdue (useful in pre-deploy CI checks).

import { BENCHMARKS } from '../lib/industryBenchmarks'
import { aiComputeData, getSignedDollarSummary, getStatusSafeAiComputeFallback, isCacheableAiComputeResponse, isStatusSafeAiComputeBrief, resolveAiComputeBrief, validateAiComputeProvenance } from '../lib/aiCompute'
import { readFileSync } from 'node:fs'
import { QUARTERLY_MULTIPLES, fetchLiveMultiples } from '../lib/liveMultiples'

const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN  = '\x1b[32m'
const BOLD   = '\x1b[1m'
const DIM    = '\x1b[2m'
const RESET  = '\x1b[0m'

const WARN_DAYS = 14
const now = new Date()
const todayStr = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')

const intelligentBriefModule = readFileSync(new URL('../lib/intelligentBrief.ts', import.meta.url), 'utf8')
const intelligentProvider = readFileSync(new URL('../components/IntelligentProvider.tsx', import.meta.url), 'utf8')
const intelligentSignals = readFileSync(new URL('../components/IntelligentSignals.tsx', import.meta.url), 'utf8')
for (const contract of [
  'COMMODITY ETF PROXY RULE',
  'GLD gold ETF proxy:',
  'USO oil ETF proxy:',
  'ETF share price',
  'dollars-per-ounce',
  'dollars-per-barrel',
  'Never claim Blackwell or B200 supply cannot be resolved through standard procurement channels',
  "result.cloudValuations.publicCloud = 'Unavailable — current basket data not available'",
  'MARKET DATA — ${marketSessionLabel}',
  '"generatedAt": "${new Date().toISOString()}"',
  "['intelligent-brief-v19', INTELLIGENT_BRIEF_MODEL]",
]) {
  if (!intelligentBriefModule.includes(contract)) throw new Error(`Intelligent-brief prompt contract missing: ${contract}`)
}
if (!intelligentProvider.includes("const CACHE_KEY = 'intelligent-brief-v16'")) {
  throw new Error('Intelligent-brief browser cache version was not bumped')
}
for (const forbidden of ['review or defer non-critical expansion', 'raise the approval threshold']) {
  if (intelligentBriefModule.includes(forbidden)) throw new Error(`Prescriptive Lumen language remains: ${forbidden}`)
}
if (!intelligentBriefModule.includes('could warrant a review of non-critical expansion')) {
  throw new Error('Conditional Lumen cloud-expansion guardrail is missing')
}
if (!intelligentSignals.includes('Live multiple unavailable · Archived')) {
  throw new Error('Unavailable live valuations are not labeled with archived historical context')
}

function calendarDayNumber(dateStr: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!match) throw new Error(`Invalid calendar date: ${dateStr}`)
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / (1000 * 60 * 60 * 24)
}

function daysUntilDue(dueDateStr: string, fromDateStr = todayStr): number {
  return calendarDayNumber(dueDateStr) - calendarDayNumber(fromDateStr)
}

if (daysUntilDue('2026-09-23', '2026-09-20') !== 3) throw new Error('Calendar-date check failed: Sep 20 to Sep 23 must be 3 days')
if (daysUntilDue('2026-09-23', '2026-09-23') !== 0) throw new Error('Calendar-date check failed: review date must be 0 days remaining')
if (daysUntilDue('2026-09-23', '2026-09-24') !== -1) throw new Error('Calendar-date check failed: Sep 23 must be 1 day overdue on Sep 24')

function formatDate(str: string): string {
  return new Date(`${str}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const entries = Object.entries(BENCHMARKS)
let overdueCount = 0
let dueSoonCount = 0

const safeAiComputeFallback = getStatusSafeAiComputeFallback()
const validClaudeOutput = 'Company-disclosed signed compute contracts remain structurally distinct, so finance teams should compare agreement terms and provenance before making capacity decisions.'
const validResolution = resolveAiComputeBrief(validClaudeOutput)
if (validResolution.fallback || !isCacheableAiComputeResponse(validResolution)) {
  throw new Error('A valid AI compute response was not accepted for the 24-hour Lumen cache')
}
const validationFallback = resolveAiComputeBrief('$500B of announced and signed commitments are now in the pipeline.')
if (!validationFallback.fallback || validationFallback.analysis !== safeAiComputeFallback) {
  throw new Error('A validation-rejected AI compute response was not marked as fallback')
}
if (isCacheableAiComputeResponse(validationFallback)) {
  throw new Error('A validation fallback was accepted for the 24-hour Lumen cache')
}
const exceptionFallback = resolveAiComputeBrief(null)
if (!exceptionFallback.fallback || isCacheableAiComputeResponse(exceptionFallback)) {
  throw new Error('An exception-path AI compute fallback was accepted for the 24-hour Lumen cache')
}
if (isCacheableAiComputeResponse({ analysis: safeAiComputeFallback, fallback: true })) {
  throw new Error('AI compute deterministic fallback was accepted for the 24-hour Lumen cache')
}
if (!isCacheableAiComputeResponse({ analysis: safeAiComputeFallback, fallback: false })) {
  throw new Error('A validated non-fallback AI compute response was rejected from the Lumen cache')
}
const provenanceErrors = validateAiComputeProvenance()
if (provenanceErrors.length) throw new Error(`AI compute provenance errors:\n${provenanceErrors.join('\n')}`)
for (const [basket, fallback] of Object.entries(QUARTERLY_MULTIPLES)) {
  if (fallback.lastUpdated !== '2026-04-24') throw new Error(`${basket} fallback provenance date changed without review`)
  if (daysUntilDue('2026-07-24') < 0) console.warn(`${basket}: archived ${fallback.value} fallback dated ${fallback.lastUpdated} is overdue for review and suppressed from current valuations`)
}
const originalFetch = globalThis.fetch
globalThis.fetch = async () => new Response(null, { status: 503 })
fetchLiveMultiples().then(unavailable => {
  if (unavailable.asOf !== '2026-04-24' || unavailable.source !== 'fallback') throw new Error('Fallback data was stamped with the request date')
  for (const basket of ['publicCloud', 'saas', 'aiInfra'] as const) {
    if (unavailable[basket] !== 'Unavailable' || unavailable.baskets[basket].dataAsOf !== '2026-04-24' || unavailable.baskets[basket].source !== 'fallback') {
      throw new Error(`${basket} stale fallback was presented as current`)
    }
  }
}).finally(() => {
  globalThis.fetch = originalFetch
})
const signedSummary = getSignedDollarSummary()
if (signedSummary.totalBillions !== 265 || signedSummary.totalLabel !== '$265B+' || signedSummary.count !== 4) {
  throw new Error(`AI compute disclosed signed total is not reproducible: ${JSON.stringify(signedSummary)}`)
}
const reportedTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test reported', amountBillions: 999, amountBasis: 'reported' }])
if (reportedTrap.totalBillions !== 265) throw new Error('A reported amount entered the disclosed signed total')
const estimatedTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test estimated', amountBillions: 999, amountBasis: 'estimated' }])
if (estimatedTrap.totalBillions !== 265) throw new Error('An estimated amount entered the disclosed signed total')
const equityTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test equity', amountBillions: 999, agreementType: 'equity investment' }])
if (equityTrap.totalBillions !== 265) throw new Error('An equity investment entered the compute total')
const statusTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test announced', amountBillions: 999, status: 'Announced' }])
if (statusTrap.totalBillions !== 265) throw new Error('An unlike status entered the disclosed signed total')
const equityRows = aiComputeData.filter(row => row.equityInvestment)
if (equityRows.length !== 2) throw new Error(`Expected exactly 2 rows with equityInvestment, found ${equityRows.length}`)
const equityBuyers = equityRows.map(row => `${row.buyer}–${row.provider}`).sort()
const expectedEquityBuyers = ['Anthropic–AMD (Instinct MI450 / Helios)', 'OpenAI–NVIDIA (Vera Rubin)'].sort()
if (JSON.stringify(equityBuyers) !== JSON.stringify(expectedEquityBuyers)) {
  throw new Error(`Equity rows do not match expected entries: ${JSON.stringify(equityBuyers)}`)
}
for (const row of equityRows) {
  if (!row.equityInvestmentBasis) throw new Error(`${row.buyer}–${row.provider}: equityInvestment is set but equityInvestmentBasis is missing`)
}
const noEquityRows = aiComputeData.filter(row => !row.equityInvestment)
if (noEquityRows.some(row => row.equityInvestmentBasis)) throw new Error('A row has equityInvestmentBasis without equityInvestment')

// Row count and status distribution
if (aiComputeData.length !== 22) throw new Error(`Expected 22 rows in aiComputeData, found ${aiComputeData.length}`)
const statusCounts = aiComputeData.reduce<Record<string, number>>((acc, row) => { acc[row.status] = (acc[row.status] ?? 0) + 1; return acc }, {})
if (statusCounts['Signed'] !== 11) throw new Error(`Expected 11 Signed rows, found ${statusCounts['Signed']}`)
if (statusCounts['Announced'] !== 4) throw new Error(`Expected 4 Announced rows, found ${statusCounts['Announced']}`)
if (statusCounts['Target'] !== 2) throw new Error(`Expected 2 Target rows, found ${statusCounts['Target']}`)
if (statusCounts['Reported / in talks'] !== 5) throw new Error(`Expected 5 Reported / in talks rows, found ${statusCounts['Reported / in talks']}`)

const anthropicSpaceX = aiComputeData.find(row => row.buyer === 'Anthropic' && row.provider.includes('Colossus 1'))
if (!anthropicSpaceX || anthropicSpaceX.status !== 'Signed' || anthropicSpaceX.capacityBasis !== 'company-disclosed') {
  throw new Error('Anthropic–SpaceX must be Signed with company-disclosed capacity')
}
if (anthropicSpaceX.amountBasis !== 'reported' || anthropicSpaceX.term !== '3 years reported') {
  throw new Error('Anthropic–SpaceX value and term must remain reported')
}
const anthropicNscale = aiComputeData.find(row => row.buyer === 'Anthropic' && row.provider.includes('Nscale'))
if (!anthropicNscale || anthropicNscale.status !== 'Reported / in talks') throw new Error('Anthropic–Nscale must remain reported')
if (anthropicNscale.amountBasis !== 'reported' || anthropicNscale.capacityBasis !== 'reported' || anthropicNscale.term !== '6 years reported') {
  throw new Error('Anthropic–Nscale value, capacity, and term must all remain reported')
}
const anthropicLambda = aiComputeData.find(row => row.buyer === 'Anthropic' && row.provider.includes('Lambda'))
if (!anthropicLambda || anthropicLambda.status !== 'Reported / in talks') throw new Error('Anthropic–Lambda must remain reported')
if (anthropicLambda.amount !== '~$35B reported' || anthropicLambda.amountBillions !== 35 || anthropicLambda.amountBasis !== 'reported') {
  throw new Error('Anthropic–Lambda value must remain explicitly reported')
}
if (anthropicLambda.capacity !== '~350 MW reported' || anthropicLambda.capacityBasis !== 'reported') {
  throw new Error('Anthropic–Lambda capacity must remain explicitly reported')
}
if (anthropicLambda.sources.length !== 1 || anthropicLambda.sources[0].label !== 'Reuters' || anthropicLambda.sources[0].kind !== 'supplemental reported') {
  throw new Error('Anthropic–Lambda must use Reuters as its reported canonical source')
}
if (getSignedDollarSummary(aiComputeData.filter(row => row !== anthropicLambda)).totalBillions !== signedSummary.totalBillions) {
  throw new Error('Anthropic–Lambda entered the company-disclosed signed-dollar total')
}
const qualifyingRows = aiComputeData.filter(row => row.status === 'Signed' && row.amountBasis === 'company-disclosed' && row.agreementType === 'compute/cloud service' && typeof row.amountBillions === 'number')
const qualifyingIds = qualifyingRows.map(row => `${row.buyer}–${row.provider}`).sort()
const expectedQualifyingIds = ['Anthropic–AWS (Trainium / Inferentia)', 'Jane Street–CoreWeave', 'Meta–CoreWeave (Vera Rubin)', 'OpenAI–AWS (Trainium)'].sort()
if (JSON.stringify(qualifyingIds) !== JSON.stringify(expectedQualifyingIds)) {
  throw new Error(`Unexpected $265B+ qualifying rows: ${JSON.stringify(qualifyingIds)}`)
}
const openAiAws = aiComputeData.find(row => row.buyer === 'OpenAI' && row.provider === 'AWS (Trainium)')
if (!openAiAws || openAiAws.amountBillions !== 138 || openAiAws.sources.length !== 2) throw new Error('OpenAI–AWS original $38B and incremental $100B must be counted once')
const firmus = aiComputeData.find(row => row.provider.includes('Firmus'))
if (!firmus || firmus.capacityBasis !== 'undisclosed' || /900/.test(firmus.capacity)) throw new Error('Firmus portfolio capacity was attributed to OpenAI')
const qualcomm = aiComputeData.find(row => row.provider.includes('Qualcomm'))
if (!qualcomm || qualcomm.amountBillions !== undefined || qualcomm.agreementType !== 'hardware/chip partnership') throw new Error('Qualcomm warrant ceiling entered compute value')
const australia = aiComputeData.find(row => row.buyer === 'Australian AI ecosystem')
if (!australia || australia.status !== 'Target' || australia.amountBillions !== undefined) throw new Error('Australian 2 GW target entered signed value')
const mysterySpaceX = aiComputeData.find(row => row.buyer === 'Unidentified customer')
if (!mysterySpaceX || mysterySpaceX.status !== 'Reported / in talks' || mysterySpaceX.amountBillions !== undefined) throw new Error('SpaceX monthly reported rate entered total value')

// PORTS-Pike row guards: compute value undisclosed; $105B conditional guarantee and $1.5B SB Energy equity must not enter signed totals
const portsPikeRow = aiComputeData.find(r => r.buyer === 'OpenAI' && r.provider.includes('PORTS-Pike'))
if (!portsPikeRow) throw new Error('PORTS-Pike row not found in aiComputeData')
if (portsPikeRow.amountBasis !== 'undisclosed') throw new Error('PORTS-Pike compute value must be undisclosed and cannot enter the signed-dollar total')
if (portsPikeRow.amountBillions !== undefined) throw new Error('PORTS-Pike must not carry a numeric compute amount')
if (portsPikeRow.equityInvestment !== undefined) throw new Error('PORTS-Pike must not carry the NVIDIA $1.5B SB Energy investment as an equity field')
const guaranteeTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test $105B guarantee', amountBillions: 105, amountBasis: 'company-disclosed', agreementType: 'equity investment' }])
if (guaranteeTrap.totalBillions !== 265) throw new Error('The $105B conditional residual-value guarantee entered the compute total')
const sbEnergyTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test $1.5B SB Energy equity', amountBillions: 1.5, amountBasis: 'company-disclosed', agreementType: 'equity investment' }])
if (sbEnergyTrap.totalBillions !== 265) throw new Error('The NVIDIA $1.5B SB Energy equity investment entered the compute total')

if (!isStatusSafeAiComputeBrief(safeAiComputeFallback)) {
  throw new Error('AI compute fallback violates status-safe aggregation rules')
}
for (const unsafeBrief of [
  '$1.5T+ pipeline spans signed, announced, and reported deals.',
  'The combined 35 GW total includes signed agreements and targets.',
  '$500B of announced and signed commitments are now in the pipeline.',
  'The reported arrangement is now a signed commitment worth $127B+.',
]) {
  if (isStatusSafeAiComputeBrief(unsafeBrief)) {
    throw new Error(`AI compute status-safety check accepted an invalid aggregate: ${unsafeBrief}`)
  }
}

console.log(`\n${BOLD}Industry Benchmarks — Freshness Report${RESET}`)
console.log(`${DIM}Run date: ${todayStr} · ${entries.length} benchmarks · warn threshold: ${WARN_DAYS} days${RESET}\n`)

for (const [key, bm] of entries) {
  const days = daysUntilDue(bm.nextReviewDue)

  let icon: string
  let color: string
  let statusLabel: string

  if (days < 0) {
    icon = '🔴'
    color = RED
    statusLabel = `OVERDUE by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
    overdueCount++
  } else if (days <= WARN_DAYS) {
    icon = '🟡'
    color = YELLOW
    statusLabel = `DUE SOON — ${days} day${days !== 1 ? 's' : ''} remaining`
    dueSoonCount++
  } else {
    icon = '🟢'
    color = GREEN
    statusLabel = `FRESH — ${days} days remaining`
  }

  console.log(`${icon} ${color}${BOLD}${key}${RESET}`)
  console.log(`   ${color}${statusLabel}${RESET}`)
  console.log(`   ${DIM}value:${RESET}      ${BOLD}${bm.value}${RESET}`)
  console.log(`   ${DIM}source:${RESET}     ${bm.source}`)
  console.log(`   ${DIM}updated:${RESET}    ${formatDate(bm.lastUpdated)}`)
  console.log(`   ${DIM}review by:${RESET}  ${formatDate(bm.nextReviewDue)}  (${bm.reviewCadence})`)
  console.log(`   ${DIM}notes:${RESET}      ${bm.notes.slice(0, 100)}${bm.notes.length > 100 ? '…' : ''}`)
  console.log()
}

// ─── Summary ────────────────────────────────────────────────────────────────

console.log('─'.repeat(60))
if (overdueCount > 0) {
  console.log(`\n${RED}${BOLD}⚠  ${overdueCount} benchmark${overdueCount !== 1 ? 's are' : ' is'} OVERDUE.${RESET}`)
  console.log(`${RED}   Update lib/industryBenchmarks.ts before deploying to production.${RESET}`)
  console.log(`${RED}   See BENCHMARKS-MAINTENANCE.md for the update protocol.${RESET}\n`)
  process.exit(1)
} else if (dueSoonCount > 0) {
  console.log(`\n${YELLOW}${BOLD}△  ${dueSoonCount} benchmark${dueSoonCount !== 1 ? 's are' : ' is'} due within ${WARN_DAYS} days.${RESET}`)
  console.log(`${YELLOW}   Consider updating before they go stale.${RESET}\n`)
} else {
  console.log(`\n${GREEN}${BOLD}✓  All ${entries.length} benchmarks are fresh.${RESET}\n`)
}
