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
    value: 'H100 broadly available ($0.67–$1.38/hr spot · $12–18K secondhand) · H200 4–8 weeks / $31–40K · Blackwell B200/GB200 heavily constrained (~3.6M unit backlog; 8–16 wk priority / 30+ wk standard)',
    source: 'Thunder Compute / GPUaaS pricing guides (July 2026)',
    sourceUrl: 'https://www.thundercompute.com/blog/nvidia-h100-pricing',
    lastUpdated: '2026-07-20',
    nextReviewDue: '2026-10-20',
    reviewCadence: 'quarterly',
    notes: 'As of July 2026: H100 (Hopper) broadly available — spot rates $0.67–$1.38/hr across budget neoclouds, median ~$2.45/hr; secondhand hardware $12–18K. H200 standard lead time 4–8 weeks, $31–40K/unit hardware (~$308–315K for 8-GPU system); NVIDIA holds ~700K H200 units in inventory as production transitions to Blackwell. B200/GB200 (Blackwell) still heavily constrained — ~3.6M unit backlog (April 2026 figure), TSMC CoWoS-L packaging fully allocated through at least mid-2027; lead times improving to 8–16 weeks for priority OEM buyers (down from 12–24 weeks in Q4 2025), 30+ weeks for standard enterprise. Vera Rubin (VR200/GB300): first samples shipped to 8 cloud partners (AWS, Azure, GCP, Oracle, CoreWeave, Lambda, Nebius, Nscale) as of June 2026; volume availability targeted for fall 2026 — delayed from Q1 2027 by thermal lid manufacturing issue + SK Hynix HBM4 qualification. Refresh after each NVIDIA earnings call or major SemiAnalysis update.',
  } satisfies Benchmark,

  // ─── Data Center Supply/Demand ─────────────────────────────────────────────

  dataCenterConstructionYoY: {
    value: 'Demand +38% / construction -5.6% YoY',
    numeric: { absorption_yoy_pct: 38, construction_yoy_pct: -5.6 },
    source: 'CBRE North America Data Center Trends H2 2025 + CBRE Global Data Center Trends 2026 (Q1 update)',
    sourceUrl: 'https://www.cbre.com/insights/books/north-america-data-center-trends-h2-2025',
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
    sourceUrl: 'https://ir.aboutamazon.com/events/event-details/default.aspx',
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
