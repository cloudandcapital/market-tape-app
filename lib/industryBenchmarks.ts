// Single source of truth for slow-moving, manually-maintained industry benchmarks.
// Every number here is an external industry stat that is reviewed monthly, quarterly, or semi-annually.
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
    value: 'H100 $2.40–$10.98/hr · H200 $3.85–$10.85/hr · B200 $5.99–$16.11/hr; availability varies materially by generation, provider, region, commitment, marketplace, and access model',
    source: 'Thunder Compute selected published GPU rental comparisons (one vendor’s compilation; includes marketplace and reservation-only endpoints) — reviewed November 3, 2026 (H100, H200, B200); NVIDIA Q2 FY2027 earnings (NVIDIA-specific demand commentary)',
    sourceUrl: 'https://www.thundercompute.com/blog/nvidia-h100-pricing',
    sourceLinks: [
      { label: 'Thunder Compute — H100 pricing (November 2026)', url: 'https://www.thundercompute.com/blog/nvidia-h100-pricing' },
      { label: 'Thunder Compute — H200 pricing (November 2026)', url: 'https://www.thundercompute.com/blog/nvidia-h200-pricing' },
      { label: 'Thunder Compute — B200 pricing (November 2026)', url: 'https://www.thundercompute.com/blog/nvidia-b200-pricing' },
      { label: 'NVIDIA — Q2 FY2027 earnings', url: 'https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027' },
    ],
    lastUpdated: '2026-11-08',
    nextReviewDue: '2026-12-08',
    reviewCadence: 'monthly',
    notes: 'November 3, 2026 selected comparisons from one GPU vendor: H100 $2.40–$10.98/GPU-hour; H200 $3.85–$10.85; B200 $5.99–$16.11. The H100 and H200 lows are marketplace endpoints whose host, storage, and bandwidth terms can vary; H200’s $10.85 Google Cloud endpoint is reservation-only. B200’s $16.11 Google Cloud endpoint is an on-demand-equivalent rate available through reservation, Spot, or Flex-start. Multi-GPU endpoints are normalized per GPU. These are not market-wide lows/highs or executable quotes. Availability language differs by provider and purchase model, so the benchmark does not characterize any generation as uniformly available or supply-constrained. Provider, commitment, marketplace, region, configuration, and ancillary-charge differences make the rental ranges non-comparable to hardware purchase prices. NVIDIA Q2 FY2027 is retained separately only for NVIDIA-specific demand and product-ramp commentary; refresh that commentary after NVIDIA reports Q3 FY2027.',
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
    notes: 'CBRE H1 2026 primary-market figures: net absorption 1,456.2 MW (+11.7% YoY), under construction 7,481.1 MW (+24.8%), and total supply 10,903 MW (+33.7%). Capacity remains tight despite construction growth: vacancy held steady at 1.4% versus year-end 2025, 80.4% of construction was preleased, and less than 1,500 MW remained available. The prior construction-decline explanation is no longer current.',
  } satisfies Benchmark,

  // ─── Historical reference (stable — infrequent review) ────────────────────

  saas2021PeakMultiple: {
    value: '20x+',
    numeric: 20,
    source: 'Bessemer Venture Partners State of the Cloud 2021 (historical 20x+ reference); BVP Cloud Index current context checked November 8, 2026',
    sourceUrl: 'https://www.bvp.com/atlas/state-of-the-cloud-2021',
    sourceLinks: [
      { label: 'Bessemer — State of the Cloud 2021', url: 'https://www.bvp.com/atlas/state-of-the-cloud-2021' },
      { label: 'BVP Nasdaq Emerging Cloud Index — current context', url: 'https://cloudindex.bvp.com/' },
    ],
    lastUpdated: '2026-11-08',
    nextReviewDue: '2027-05-07',
    reviewCadence: 'semi-annual',
    notes: 'Historical framing: Bessemer’s State of the Cloud 2021 said public and private cloud companies were trading above 20x revenue. The current BVP Cloud Index displayed a 7.4x average revenue multiple when checked November 8, 2026. The current index snapshot is contextual only: its cohort and methodology differ from Market Tape’s approximate live Yahoo Finance SaaS basket, so it must not replace or backfill that live value. The 20x+ historical reference is stable; the semi-annual review confirms the comparison and source framing.',
  } satisfies Benchmark,

  // ─── Hyperscaler CapEx Trend ───────────────────────────────────────────────

  hyperscalerCapexTrend: {
    value: 'Expanding',
    source: 'Amazon Q3 2026 results; Microsoft FY2027 Q1 earnings; Alphabet Q3 2026 earnings; Meta Q3 2026 results; Oracle Q1 FY2027 results',
    sourceUrl: 'https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Third-Quarter-Results/',
    sourceLinks: [
      { label: 'Amazon — Q3 2026 results', url: 'https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Third-Quarter-Results/' },
      { label: 'Microsoft — FY2027 Q1 earnings', url: 'https://www.microsoft.com/en-us/investor/events/fy-2027/earnings-fy-2027-q1' },
      { label: 'Alphabet — Q3 2026 earnings call', url: 'https://abc.xyz/investor/events/event-details/2026/2026-Q3-Earnings-Call-2026-Ujou16CTw9/default.aspx' },
      { label: 'Meta — Q3 2026 results', url: 'https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Third-Quarter-2026-Results/default.aspx' },
      { label: 'AWS & NVIDIA — 2 million additional GPUs', url: 'https://nvidianews.nvidia.com/news/aws-and-nvidia-to-deliver-2-million-additional-gpus-and-next-generation-infrastructure-for-agentic-and-physical-ai' },
      { label: 'Oracle — Q1 FY2027 results', url: 'https://investor.oracle.com/investor-news/news-details/2026/Oracle-Announces-Q1-Results-Driven-by-Triple-Digit-Growth-in-Cloud-Infrastructure-Revenues/default.aspx' },
      { label: 'Google — Finland AI infrastructure', url: 'https://www.googlecloudpresscorner.com/2026-09-09-Google-Deepens-Commitment-to-Finland-with-Two-Year-EUR13-Billion-investment-in-AI-Infrastructure' },
    ],
    lastUpdated: '2026-11-08',
    nextReviewDue: '2027-02-06',
    reviewCadence: 'quarterly',
    notes: 'Latest 2026 guidance and disclosures support an Expanding classification. Amazon continues to expect approximately $220B of 2026 cash capital expenditures; AWS Q3 sales reached $46.0B (+39% YoY). Microsoft reported $45.2B of FY2027 Q1 capex, expects Q2 above $50B, and now expects approximately $170B for calendar 2026 because some third-party capacity deliveries shifted later. Alphabet reported $51.4B of Q3 capex, kept full-year guidance at $195–205B, and said third-party compute began coming online at the end of Q3 amid supply constraints. Meta expects $135–145B, narrowed on October 21 from $130–145B. Oracle Q1 FY2027 cloud infrastructure revenue was $7.4B (+121% YoY); RPO $664B, with more than $30B of new AI cloud bookings, 850 MW of added data-center capacity and over 300,000 GPUs delivered since Q4. Those Oracle aggregates are not individual customer compute contract values. Google Finland and the AWS/NVIDIA GPU plan remain capacity context, not signed customer-deal totals. Values: Expanding / Stable / Contracting.',
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
  baskets?: Record<string, { source: 'live' | 'fallback'; dataAsOf?: string }>
}): string {
  const b = BENCHMARKS
  const sourceNote = (basket: string) => liveMultiples.baskets?.[basket]?.source === 'live'
    ? liveMultiples.baskets[basket].dataAsOf
      ? `Yahoo Finance basket median, fetched ${liveMultiples.baskets[basket].dataAsOf}`
      : 'Yahoo Finance basket median, live'
    : `UNAVAILABLE; archived fallback dated 2026-04-24 is suppressed, do not quote a multiple`

  return `CLOUD INFRASTRUCTURE CONTEXT (source-attributed — use only what is listed here; do not extrapolate or cite additional statistics):
- Public Cloud NTM P/S (est.): ${liveMultiples.publicCloud} [source: ${sourceNote('publicCloud')}]
- SaaS Average NTM P/S (est.): ${liveMultiples.saas} (historical peak ${b.saas2021PeakMultiple.value} in 2021; do not infer present compression when current multiple is unavailable) [source: ${sourceNote('saas')}]
- AI Infrastructure NTM P/S (est.): ${liveMultiples.aiInfra} [source: ${sourceNote('aiInfra')}]
- Hyperscaler CapEx Trend: ${b.hyperscalerCapexTrend.value} [source: ${b.hyperscalerCapexTrend.source}]
- GPU Supply Status: ${b.gpuSupplyStatus.value} [source: ${b.gpuSupplyStatus.source}]
- Data Center Supply/Demand: ${b.dataCenterConstructionYoY.value}; capacity remains tight because vacancy held steady at 1.4% versus year-end 2025 and most construction is preleased [source: ${b.dataCenterConstructionYoY.source}, updated ${b.dataCenterConstructionYoY.lastUpdated}]
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
