// Single source of truth for slow-moving, manually-maintained industry benchmarks.
// Every number here is an external industry stat that changes quarterly or less often.
//
// What does NOT belong here:
//   - Live stock market data (prices, live P/S multiples) → lib/liveMultiples.ts
//   - yFinance pipeline data → fetched via lib/data.ts
//
// Run `npm run check-benchmarks` to see freshness status.
// See BENCHMARKS-MAINTENANCE.md for the update protocol.

export interface Benchmark {
  value: string                                                              // human-readable string used in UI + prompts
  numeric?: number | { min: number; max: number } | Record<string, number>  // machine-readable form for comparisons
  source: string                                                             // citation or "Industry consensus — needs verification"
  sourceUrl: string                                                          // direct link to report/post; empty if unverified
  lastUpdated: string                                                        // YYYY-MM-DD — date this entry was last confirmed
  nextReviewDue: string                                                      // YYYY-MM-DD — when to recheck the value
  reviewCadence: 'monthly' | 'quarterly' | 'semi-annual'
  notes: string                                                              // what it measures, caveats, how to update it
}

export const BENCHMARKS = {

  // ─── GPU Supply Status ─────────────────────────────────────────────────────

  gpuSupplyStatus: {
    value: 'Hopper sold out · Blackwell ~16-20 weeks (booked into Aug-Sep 2026)',
    source: 'SemiAnalysis (April 2026)',
    sourceUrl: 'https://newsletter.semianalysis.com/',
    lastUpdated: '2026-05-01',
    nextReviewDue: '2026-08-01',
    reviewCadence: 'quarterly',
    notes: 'H100/H200 (Hopper) essentially sold out market-wide as of March-April 2026. B100/B200 (Blackwell) lead times extending to August-September 2026 per SemiAnalysis. Refresh after each NVIDIA earnings call or major SemiAnalysis update.',
  } satisfies Benchmark,

  // ─── Data Center Supply/Demand ─────────────────────────────────────────────

  dataCenterConstructionYoY: {
    value: 'Demand +38% / construction -5.6% YoY',
    numeric: { absorption_yoy_pct: 38, construction_yoy_pct: -5.6 },
    source: 'CBRE North America Data Center Trends H2 2025',
    sourceUrl: 'https://www.cbre.com/insights/books/north-america-data-center-trends-h2-2025',
    lastUpdated: '2026-05-01',
    nextReviewDue: '2026-11-01',
    reviewCadence: 'semi-annual',
    notes: 'CBRE H2 2025 reported absorption of 2,497.6 MW vs 1,809.5 MW in 2024 (+38%) and construction pipeline of 5,994.4 MW vs 6,350.1 MW in 2024 (-5.6%, first decline since 2020). Story = demand outpacing supply, not construction boom.',
  } satisfies Benchmark,

  // ─── Historical reference (stable — infrequent review) ────────────────────

  saas2021PeakMultiple: {
    value: '20x+',
    numeric: 20,
    source: 'Bessemer Venture Partners Cloud Index — historical',
    sourceUrl: 'https://cloudindex.bvp.com/',
    lastUpdated: '2026-04-24',
    nextReviewDue: '2026-11-01',
    reviewCadence: 'semi-annual',
    notes: 'Peak NTM revenue multiple reached by the SaaS cohort during the 2021 bull market. Used as a compressed-from reference point. This is a historical data point and will not change. Review cadence is semi-annual only to confirm the narrative framing is still accurate.',
  } satisfies Benchmark,

  // ─── Hyperscaler CapEx Trend ───────────────────────────────────────────────

  hyperscalerCapexTrend: {
    value: 'Expanding',
    source: 'AWS / Azure / GCP Q1 2026 earnings guidance',
    sourceUrl: '',
    lastUpdated: '2026-04-24',
    nextReviewDue: '2026-08-01',
    reviewCadence: 'quarterly',
    notes: 'Qualitative CapEx trajectory for major hyperscalers based on most recent earnings guidance. Values: Expanding / Stable / Contracting. Next update due after Q2 2026 earnings (typically July–August). Source: earnings call transcripts and investor day slides from AWS, Azure, GCP.',
  } satisfies Benchmark,

} satisfies { [key: string]: Benchmark }

// ─── Prompt Context Builder ────────────────────────────────────────────────
// Generates the infrastructure context block injected into Lumen prompts.
// Live multiples (publicCloud, saas, aiInfra) are passed in from lib/liveMultiples.ts
// so they never come from hardcoded values or Claude's training knowledge.

export function buildInfraContextBlock(liveMultiples: {
  publicCloud: string
  saas: string
  aiInfra: string
  source?: 'live' | 'fallback'
}): string {
  const b = BENCHMARKS
  const sourceNote = liveMultiples.source === 'live'
    ? 'Yahoo Finance, approx. NTM P/S, basket median'
    : 'Quarterly earnings comps (Q1 2026, basket median — refreshed each earnings cycle)'

  return `CLOUD INFRASTRUCTURE CONTEXT (source-attributed — use only what is listed here; do not extrapolate or cite additional statistics):
- Public Cloud NTM P/S (est.): ${liveMultiples.publicCloud} [source: ${sourceNote}]
- SaaS Average NTM P/S (est.): ${liveMultiples.saas} (compressed from ${b.saas2021PeakMultiple.value} in 2021) [source: ${sourceNote}]
- AI Infrastructure NTM P/S (est.): ${liveMultiples.aiInfra} [source: ${sourceNote}]
- Hyperscaler CapEx Trend: ${b.hyperscalerCapexTrend.value} [source: ${b.hyperscalerCapexTrend.source}]
- GPU Supply Status: ${b.gpuSupplyStatus.value} [source: ${b.gpuSupplyStatus.source}]
- Data Center Supply/Demand: ${b.dataCenterConstructionYoY.value}; demand is outpacing supply (first time since 2020) [source: ${b.dataCenterConstructionYoY.source}, updated ${b.dataCenterConstructionYoY.lastUpdated}]`
}

// ─── Server-side staleness check ──────────────────────────────────────────
// Call from app/page.tsx (server component, runs on ISR revalidation).
// Only warns when a benchmark is >6 months past its nextReviewDue date.
// Output goes to deployment logs, not to users.

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000

export function checkServerStaleness(): void {
  const now = Date.now()
  for (const [key, bm] of Object.entries(BENCHMARKS)) {
    const due = new Date(bm.nextReviewDue).getTime()
    if (now - due > SIX_MONTHS_MS) {
      console.warn(
        `[market-tape:benchmarks] ${key} is >6 months past review due date ` +
        `(${bm.nextReviewDue}). Value: "${bm.value}" | Source: ${bm.source}`
      )
    }
  }
}
