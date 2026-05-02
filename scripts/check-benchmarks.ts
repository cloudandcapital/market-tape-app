#!/usr/bin/env tsx
// Usage: npm run check-benchmarks
// Reads lib/industryBenchmarks.ts and reports freshness of every benchmark.
// Exits with code 1 if any benchmark is overdue (useful in pre-deploy CI checks).

import { BENCHMARKS } from '../lib/industryBenchmarks'

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
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const entries = Object.entries(BENCHMARKS)
let overdueCount = 0
let dueSoonCount = 0

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
