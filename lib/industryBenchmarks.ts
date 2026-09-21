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
  sourceLinks?: { label: string; url: string }[]                             // separately linked when multiple sources support distinct claims
  lastUpdated: string                                                        // YYYY-MM-DD — date this entry was last confirmed
  nextReviewDue: string                                                      // YYYY-MM-DD — when to recheck the value
  reviewCadence: 'monthly' | 'quarterly' | 'semi-annual'
  notes: string                                                              // what it measures, caveats, how to update it
}

export const BENCHMARKS = {

  // ─── GPU Supply Status ─────────────────────────────────────────────────────

  gpuSupplyStatus: {
    value: 'H100 $2.99–$10.98/hr · H200 $3.96–$10.85/hr · B200 $5.99–$16.11/hr; availability varies by provider and access model',
    source: 'Thunder Compute dedicated GPU pricing comparisons — September 18, 2026 (H100, H200, B200); NVIDIA Q2 FY2027 earnings (NVIDIA-specific demand commentary)',
    sourceUrl: 'https://www.thundercompute.com/blog/nvidia-h100-pricing',
    sourceLinks: [
      { label: 'Thunder Compute — H100 pricing (September 2026)', url: 'https://www.thundercompute.com/blog/nvidia-h100-pricing' },
      { label: 'Thunder Compute — H200 pricing (September 2026)', url: 'https://www.thundercompute.com/blog/nvidia-h200-pricing' },
      { label: 'Thunder Compute — B200 pricing (September 2026)', url: 'https://www.thundercompute.com/blog/nvidia-b200-pricing' },
      { label: 'NVIDIA — Q2 FY2027 earnings', url: 'https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027' },
    ],
    lastUpdated: '2026-09-20',
    nextReviewDue: '2026-10-20',
    reviewCadence: 'monthly',
    notes: 'September 18, 2026 dedicated comparisons: H100 $2.99–$10.98/GPU-hour; H200 $3.96–$10.85; B200 $5.99–$16.11. Availability language differs by provider and purchase model, so the benchmark does not characterize any generation as uniformly available or supply-constrained. Provider, commitment, marketplace, and configuration differences make rental ranges non-comparable to hardware purchase prices. NVIDIA Q2 FY2027 is retained separately only for NVIDIA-specific demand and product-ramp commentary.',
  } satisfies Benchmark,

  // ─── Data Center Supply/Demand ─────────────────────────────────────────────

  dataCenterConstructionYoY: {
    value: 'Absorption +11.7% / construction +24.8% YoY · vacancy 1.4%',
    numeric: { absorption_yoy_pct: 11.7, construction_yoy_pct: 24.8, supply_yoy_pct: 33.7, vacancy_pct: 1.4, construction_preleased_pct: 80.4 },
    source: 'CBRE North America Data Center Trends H1 2026',
    sourceUrl: 'https://www.cbre.com/insights/books/north-america-data-center-trends-h1-2026',
    lastUpdated: '2026-08-31',
    nextReviewDue: '2027-02-28',
    reviewCadence: 'semi-annual',
    notes: 'CBRE H1 2026 primary-market figures: net absorption 1,456.2 MW (+11.7% YoY), under construction 7,481.1 MW (+24.8%), and total supply 10,903 MW (+33.7%). Capacity remains tight despite construction growth: vacancy reached a record-low 1.4%, 80.4% of construction was preleased, and less than 1,500 MW remained available. The prior construction-decline explanation is no longer current.',
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
    source: 'Amazon, Microsoft, Alphabet, and Meta Q2 2026 earnings; Oracle Q1 FY2027 results',
    sourceUrl: 'https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Second-Quarter-Results/',
    sourceLinks: [
      { label: 'Amazon — Q2 2026 results', url: 'https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Second-Quarter-Results/' },
      { label: 'Microsoft — FY2026 Q4 earnings', url: 'https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q4' },
      { label: 'Alphabet — Q2 2026 earnings call', url: 'https://abc.xyz/investor/events/event-details/2026/2026-Q2-Earnings-Call-2026-GgTAq7Is0z/default.aspx' },
      { label: 'Meta — Q2 2026 results', url: 'https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Second-Quarter-2026-Results/default.aspx' },
      { label: 'AWS & NVIDIA — 2 million additional GPUs', url: 'https://nvidianews.nvidia.com/news/aws-and-nvidia-to-deliver-2-million-additional-gpus-and-next-generation-infrastructure-for-agentic-and-physical-ai' },
      { label: 'Oracle — Q1 FY2027 results', url: 'https://investor.oracle.com/investor-news/news-details/2026/Oracle-Announces-Q1-Results-Driven-by-Triple-Digit-Growth-in-Cloud-Infrastructure-Revenues/default.aspx' },
      { label: 'Google — Finland AI infrastructure', url: 'https://www.googlecloudpresscorner.com/2026-09-09-Google-Deepens-Commitment-to-Finland-with-Two-Year-EUR13-Billion-investment-in-AI-Infrastructure' },
    ],
    lastUpdated: '2026-09-13',
    nextReviewDue: '2026-11-01',
    reviewCadence: 'quarterly',
    notes: 'Full-year 2026 guidance after Q2 earnings: Amazon approximately $220B; Microsoft approximately $175B (lease classification shifted); Alphabet $195–205B; Meta $130–145B. Oracle Q1 FY2027 cloud infrastructure revenue was $7.4B (+121% YoY); RPO $664B, with more than $30B of new AI cloud bookings, 850 MW of added data-center capacity and over 300,000 GPUs delivered since Q4. Those Oracle aggregates are not individual customer compute contract values. Google plans at least €13B of Finland digital-infrastructure investment during 2027–28, with a 22-year nuclear PPA and other energy support. AWS and NVIDIA plan 2 million additional NVIDIA GPUs in 2027–28. All are capex/capacity or earnings context, not signed customer-deal totals. Values: Expanding / Stable / Contracting. Recheck after the next earnings cycle.',
  } satisfies Benchmark,

  // ─── NVIDIA Data Center Revenue ───────────────────────────────────────────

  nvidiaDcRevenue: {
    value: '$89.0B Q2 FY2027 (+117% YoY, +18% QoQ) · Q3 guidance $108.0B ±2%',
    numeric: { q2_dc_revenue_b: 89, q2_total_revenue_b: 96.2, q3_guidance_b: 108 },
    source: 'NVIDIA Q2 FY2027 earnings (reported August 26, 2026)',
    sourceUrl: 'https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027',
    lastUpdated: '2026-08-31',
    nextReviewDue: '2026-11-25',
    reviewCadence: 'quarterly',
    notes: 'NVIDIA Q2 FY2027 (quarter ended July 26, 2026). Total revenue was $96.2B (+106% YoY, +18% QoQ); Data Center revenue was $89.0B (+117% YoY, +18% QoQ). Q3 FY2027 total-revenue guidance is $108.0B ±2%. Vera Rubin is in full production. NVIDIA did not disclose a directly comparable standalone networking figure under the new presentation, so none is shown.',
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
  baskets?: Record<string, { source: 'live' | 'fallback'; dataAsOf: string }>
}): string {
  const b = BENCHMARKS
  const sourceNote = (basket: string) => liveMultiples.baskets?.[basket]?.source === 'live'
    ? `Yahoo Finance basket median, fetched ${liveMultiples.baskets[basket].dataAsOf}`
    : `UNAVAILABLE; archived fallback dated 2026-04-24 is suppressed, do not quote a multiple`

  return `CLOUD INFRASTRUCTURE CONTEXT (source-attributed — use only what is listed here; do not extrapolate or cite additional statistics):
- Public Cloud NTM P/S (est.): ${liveMultiples.publicCloud} [source: ${sourceNote('publicCloud')}]
- SaaS Average NTM P/S (est.): ${liveMultiples.saas} (historical peak ${b.saas2021PeakMultiple.value} in 2021; do not infer present compression when current multiple is unavailable) [source: ${sourceNote('saas')}]
- AI Infrastructure NTM P/S (est.): ${liveMultiples.aiInfra} [source: ${sourceNote('aiInfra')}]
- Hyperscaler CapEx Trend: ${b.hyperscalerCapexTrend.value} [source: ${b.hyperscalerCapexTrend.source}]
- GPU Supply Status: ${b.gpuSupplyStatus.value} [source: ${b.gpuSupplyStatus.source}]
- Data Center Supply/Demand: ${b.dataCenterConstructionYoY.value}; capacity remains tight because vacancy is at a record low and most construction is preleased [source: ${b.dataCenterConstructionYoY.source}, updated ${b.dataCenterConstructionYoY.lastUpdated}]
- NVIDIA Data Center Revenue: ${b.nvidiaDcRevenue.value} [source: ${b.nvidiaDcRevenue.source}]`
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
