#!/usr/bin/env tsx
// Usage: npm run check-benchmarks
// Reads lib/industryBenchmarks.ts and reports freshness of every benchmark.
// Exits with code 1 if any benchmark is overdue (useful in pre-deploy CI checks).

import { BENCHMARKS } from '../lib/industryBenchmarks'
import { aiComputeData, getSignedDollarSummary, getStatusSafeAiComputeFallback, isCacheableAiComputeResponse, isStatusSafeAiComputeBrief, resolveAiComputeBrief, validateAiComputeProvenance } from '../lib/aiCompute'

const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN  = '\x1b[32m'
const BOLD   = '\x1b[1m'
const DIM    = '\x1b[2m'
const RESET  = '\x1b[0m'

const WARN_DAYS = 14
const today = new Date()
today.setHours(0, 0, 0, 0)

function daysUntilDue(dueDateStr: string): number {
  const due = new Date(dueDateStr)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

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
const signedSummary = getSignedDollarSummary()
if (signedSummary.totalBillions !== 127 || signedSummary.totalLabel !== '$127B+' || signedSummary.count !== 3) {
  throw new Error(`AI compute disclosed signed total is not reproducible: ${JSON.stringify(signedSummary)}`)
}
const reportedTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test reported', amountBillions: 999, amountBasis: 'reported' }])
if (reportedTrap.totalBillions !== 127) throw new Error('A reported amount entered the disclosed signed total')
const estimatedTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test estimated', amountBillions: 999, amountBasis: 'estimated' }])
if (estimatedTrap.totalBillions !== 127) throw new Error('An estimated amount entered the disclosed signed total')
const equityTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test equity', amountBillions: 999, agreementType: 'equity investment' }])
if (equityTrap.totalBillions !== 127) throw new Error('An equity investment entered the compute total')
const statusTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test announced', amountBillions: 999, status: 'Announced' }])
if (statusTrap.totalBillions !== 127) throw new Error('An unlike status entered the disclosed signed total')
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
if (aiComputeData.length !== 15) throw new Error(`Expected 15 rows in aiComputeData, found ${aiComputeData.length}`)
const statusCounts = aiComputeData.reduce<Record<string, number>>((acc, row) => { acc[row.status] = (acc[row.status] ?? 0) + 1; return acc }, {})
if (statusCounts['Signed'] !== 8) throw new Error(`Expected 8 Signed rows, found ${statusCounts['Signed']}`)
if (statusCounts['Announced'] !== 3) throw new Error(`Expected 3 Announced rows, found ${statusCounts['Announced']}`)
if (statusCounts['Target'] !== 1) throw new Error(`Expected 1 Target row, found ${statusCounts['Target']}`)
if (statusCounts['Reported / in talks'] !== 3) throw new Error(`Expected 3 Reported / in talks rows, found ${statusCounts['Reported / in talks']}`)

// PORTS-Pike row guards: compute value undisclosed; $105B conditional guarantee and $1.5B SB Energy equity must not enter signed totals
const portsPikeRow = aiComputeData.find(r => r.buyer === 'OpenAI' && r.provider.includes('PORTS-Pike'))
if (!portsPikeRow) throw new Error('PORTS-Pike row not found in aiComputeData')
if (portsPikeRow.amountBasis !== 'undisclosed') throw new Error('PORTS-Pike compute value must be undisclosed and cannot enter the signed-dollar total')
if (portsPikeRow.amountBillions !== undefined) throw new Error('PORTS-Pike must not carry a numeric compute amount')
if (portsPikeRow.equityInvestment !== undefined) throw new Error('PORTS-Pike must not carry the NVIDIA $1.5B SB Energy investment as an equity field')
const guaranteeTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test $105B guarantee', amountBillions: 105, amountBasis: 'company-disclosed', agreementType: 'equity investment' }])
if (guaranteeTrap.totalBillions !== 127) throw new Error('The $105B conditional residual-value guarantee entered the compute total')
const sbEnergyTrap = getSignedDollarSummary([...aiComputeData, { ...aiComputeData[0], buyer: 'Test $1.5B SB Energy equity', amountBillions: 1.5, amountBasis: 'company-disclosed', agreementType: 'equity investment' }])
if (sbEnergyTrap.totalBillions !== 127) throw new Error('The NVIDIA $1.5B SB Energy equity investment entered the compute total')

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

const todayStr = today.toISOString().split('T')[0]
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
