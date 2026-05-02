// Single source of truth for all hardcoded industry benchmark values.
// Every number here is an external industry stat — not live market data.
// Run `npm run check-benchmarks` to see freshness status.
// Update this file quarterly (or sooner if a source publishes new data).
// See BENCHMARKS-MAINTENANCE.md for the full update protocol.

export interface Benchmark {
  value: string                                  // human-readable string used in UI + prompts
  numeric?: number | { min: number; max: number } | Record<string, number> // machine-readable form for comparisons
  source: string                                 // citation or "Industry consensus — needs verification"
  sourceUrl: string                              // direct link to report/post; empty if unverified
  lastUpdated: string                            // YYYY-MM-DD — date this entry was last confirmed
  nextReviewDue: string                          // YYYY-MM-DD — when to recheck the value
  reviewCadence: 'monthly' | 'quarterly' | 'semi-annual'
  notes: string                                  // what it measures, caveats, how to update it
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

  // ─── Cloud Valuation Multiples (display — used in CloudValuations component) ─

  publicCloudNTMMultiple: {
    value: '8.2×',
    numeric: 8.2,
    source: 'Industry consensus — needs verification',
    sourceUrl: '',
    lastUpdated: '2026-04-24',
    nextReviewDue: '2026-05-08',
    reviewCadence: 'quarterly',
    notes: 'NTM revenue multiple for public cloud infrastructure (AWS, Azure, GCP hyperscaler cohort). Verify from quarterly earnings comps, Bessemer Cloud Index (cloudindex.bvp.com), or Bloomberg comp tables. Update after each earnings season.',
  } satisfies Benchmark,

  saasNTMMultiple: {
    value: '6.5×',
    numeric: 6.5,
    source: 'Industry consensus — needs verification',
    sourceUrl: '',
    lastUpdated: '2026-04-24',
    nextReviewDue: '2026-05-08',
    reviewCadence: 'quarterly',
    notes: 'Median NTM revenue multiple for enterprise SaaS cohort. Compressed from 2021 peaks. Verify from Bessemer Cloud Index or public SaaS comp tables. This is the median across the cohort — individual names vary widely.',
  } satisfies Benchmark,

  aiInfraNTMMultiple: {
    value: '12.3×',
    numeric: 12.3,
    source: 'Industry consensus — needs verification',
    sourceUrl: '',
    lastUpdated: '2026-04-24',
    nextReviewDue: '2026-05-08',
    reviewCadence: 'quarterly',
    notes: 'NTM revenue multiple for AI infrastructure and hyperscaler cohort. Elevated relative to SaaS on AI CapEx thesis. Verify from Bloomberg, FactSet, or public comp tables for NVDA/AMD/SMCI/DELL AI infrastructure basket.',
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
// Including source citations so Lumen knows what it can and cannot attribute.

export function buildInfraContextBlock(): string {
  const b = BENCHMARKS
  return `CLOUD INFRASTRUCTURE CONTEXT (source-attributed benchmarks — use only what is listed here; do not extrapolate or cite additional statistics):
- Public Cloud NTM Revenue Multiple: ${b.publicCloudNTMMultiple.value} [source: ${b.publicCloudNTMMultiple.source}, updated ${b.publicCloudNTMMultiple.lastUpdated}]
- SaaS Average NTM Revenue Multiple: ${b.saasNTMMultiple.value} (compressed from ${b.saas2021PeakMultiple.value} in 2021) [source: ${b.saasNTMMultiple.source}]
- AI Infrastructure NTM Revenue Multiple: ${b.aiInfraNTMMultiple.value} [source: ${b.aiInfraNTMMultiple.source}]
- Hyperscaler CapEx Trend: ${b.hyperscalerCapexTrend.value} [source: ${b.hyperscalerCapexTrend.source}]
- GPU Supply Status: ${b.gpuSupplyStatus.value} [source: ${b.gpuSupplyStatus.source}]
- Data Center Supply/Demand: ${b.dataCenterConstructionYoY.value}; demand is outpacing supply (first time since 2020) [source: ${b.dataCenterConstructionYoY.source}, updated ${b.dataCenterConstructionYoY.lastUpdated}]`
}
