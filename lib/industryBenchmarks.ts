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
    value: 'H100 widely available ($2.19–$10.98/hr) · H200 $3.99–$10.85/hr · B200 extremely limited ($5.99–$16.11/hr); access constrained or waitlisted',
    source: 'Thunder Compute dedicated GPU pricing comparisons — August 21, 2026 (H100, H200, B200); NVIDIA Q1 FY2027 earnings (NVIDIA-specific supply commentary)',
    sourceUrl: 'https://www.thundercompute.com/blog/nvidia-h100-pricing',
    sourceLinks: [
      { label: 'Thunder Compute — H100 pricing (August 2026)', url: 'https://www.thundercompute.com/blog/nvidia-h100-pricing' },
      { label: 'Thunder Compute — H200 pricing (August 2026)', url: 'https://www.thundercompute.com/blog/nvidia-h200-pricing' },
      { label: 'Thunder Compute — B200 pricing (August 2026)', url: 'https://www.thundercompute.com/blog/nvidia-b200-pricing' },
      { label: 'NVIDIA — Q1 FY2027 supply commentary', url: 'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-First-Quarter-Fiscal-2027/default.aspx' },
    ],
    lastUpdated: '2026-08-23',
    nextReviewDue: '2026-09-23',
    reviewCadence: 'monthly',
    notes: 'August 21, 2026 dedicated comparisons: H100 $2.19–$10.98/GPU-hour and widely available (upper bound revised from $11.06); H200 $3.99–$10.85 (unchanged); B200 $5.99–$16.11 and extremely limited/supply-constrained (lower bound revised from $5.91). Provider, commitment, and configuration differences make rental ranges non-comparable to hardware purchase prices. NVIDIA is retained separately only for NVIDIA-specific supply commentary. B200 access remains constrained or waitlisted; TSMC CoWoS capacity relief not expected until Q4 2026 at earliest.',
  } satisfies Benchmark,

  // ─── Data Center Supply/Demand ─────────────────────────────────────────────

  dataCenterConstructionYoY: {
    value: 'Demand +38% / construction -5.6% YoY',
    numeric: { absorption_yoy_pct: 38, construction_yoy_pct: -5.6 },
    source: 'CBRE North America Data Center Trends H2 2025 + CBRE Global Data Center Trends 2026 (Q1 update)',
    sourceUrl: 'https://www.cbre.com/insights/books/north-america-data-center-trends-h2-2025',
    sourceLinks: [
      { label: 'CBRE — North America Data Center Trends H2 2025', url: 'https://www.cbre.com/insights/books/north-america-data-center-trends-h2-2025' },
      { label: 'CBRE — Global Data Center Trends 2026', url: 'https://www.cbre.com/insights/reports/global-data-center-trends-2026' },
    ],
    lastUpdated: '2026-07-06',
    nextReviewDue: '2026-11-01',
    reviewCadence: 'semi-annual',
    notes: 'CBRE H2 2025 reported absorption of 2,497.6 MW vs 1,809.5 MW in 2024 (+38%) and construction pipeline of 5,994.4 MW vs 6,350.1 MW in 2024 (-5.6%, first decline since 2020). Story = demand outpacing supply, not construction boom. Q1 2026 supplement (CBRE Global Data Center Trends 2026): Northern Virginia absorbed 1,148.3 MW in Q1 alone — largest single quarter since CBRE began this report in 2023 — with vacancy at an all-time low of 0.3%. Dallas-Ft. Worth is now the 3rd-largest US market (+43.7% inventory growth in Q1). Power availability flagged as the #1 industry challenge for the third consecutive year. Value/numeric fields retain the H2 2025 YoY baseline; next full refresh after H1 2026 CBRE report (est. Nov 2026).',
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
    source: 'Amazon, Microsoft, Alphabet, and Meta Q2 2026 earnings disclosures',
    sourceUrl: 'https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Second-Quarter-Results/',
    sourceLinks: [
      { label: 'Amazon — Q2 2026 results', url: 'https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Second-Quarter-Results/' },
      { label: 'Microsoft — FY2026 Q4 earnings', url: 'https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q4' },
      { label: 'Alphabet — Q2 2026 earnings call', url: 'https://abc.xyz/investor/events/event-details/2026/2026-Q2-Earnings-Call-2026-GgTAq7Is0z/default.aspx' },
      { label: 'Meta — Q2 2026 results', url: 'https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Second-Quarter-2026-Results/default.aspx' },
    ],
    lastUpdated: '2026-08-02',
    nextReviewDue: '2026-11-01',
    reviewCadence: 'quarterly',
    notes: 'Full-year 2026 guidance after Q2 earnings: Amazon approximately $220B, raised from approximately $200B; Microsoft approximately $175B, nominally reduced from approximately $190B because more data center leases are classified as operating leases, while management said underlying investment expectations are unchanged; Alphabet $195–205B, raised from $180–190B; Meta $130–145B, narrowed from $125–145B. Primary references: Amazon Q2 2026 earnings call (Amazon IR); Microsoft FY26 Q4 earnings call (Microsoft Investor Relations); Alphabet Q2 2026 earnings call (Alphabet Investor Relations); Meta Q2 2026 results (Meta Investor Relations). Values: Expanding / Stable / Contracting. Recheck after the Q3 earnings cycle around November 2026.',
  } satisfies Benchmark,

  // ─── NVIDIA Data Center Revenue ───────────────────────────────────────────

  nvidiaDcRevenue: {
    value: '$75.2B Q1 FY2027 (+92% YoY, +21% QoQ) · networking $14.8B (+199% YoY) · Q2 guidance ~$91B',
    numeric: { q1_dc_revenue_b: 75.2, q1_total_revenue_b: 81.6, q2_guidance_b: 91 },
    source: 'NVIDIA Q1 FY2027 earnings (reported May 2026)',
    sourceUrl: 'https://investor.nvidia.com/financial-information/financial-results/',
    lastUpdated: '2026-05-25',
    nextReviewDue: '2026-08-26',
    reviewCadence: 'quarterly',
    notes: 'NVIDIA Q1 FY2027 (quarter ended April 2026, reported May 20–22 2026). Total revenue $81.6B (+85% YoY). Data center segment $75.2B (+92% YoY, +21% QoQ) — the primary demand signal for hyperscaler AI CapEx flowing through to silicon. Data center networking (InfiniBand + Ethernet for AI) $14.8B (+199% YoY). Q2 FY2027 guidance ~$91B total. Refresh after each NVIDIA earnings call (next: ~Aug 2026).',
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
- Data Center Supply/Demand: ${b.dataCenterConstructionYoY.value}; demand is outpacing supply (first time since 2020) [source: ${b.dataCenterConstructionYoY.source}, updated ${b.dataCenterConstructionYoY.lastUpdated}]
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
