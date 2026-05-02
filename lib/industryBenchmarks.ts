// Single source of truth for all hardcoded industry benchmark values.
// Every number here is an external industry stat — not live market data.
// Run `npm run check-benchmarks` to see freshness status.
// Update this file quarterly (or sooner if a source publishes new data).
// See BENCHMARKS-MAINTENANCE.md for the full update protocol.

export interface Benchmark {
  value: string                                  // human-readable string used in UI + prompts
  numeric?: number | { min: number; max: number } // machine-readable form for comparisons
  source: string                                 // citation or "Industry consensus — needs verification"
  sourceUrl: string                              // direct link to report/post; empty if unverified
  lastUpdated: string                            // YYYY-MM-DD — date this entry was last confirmed
  nextReviewDue: string                          // YYYY-MM-DD — when to recheck the value
  reviewCadence: 'monthly' | 'quarterly' | 'semi-annual'
  notes: string                                  // what it measures, caveats, how to update it
}

export const BENCHMARKS = {

  // ─── GPU Supply Chain ──────────────────────────────────────────────────────

  gpuLeadTimesH100H200: {
    value: '12–16 weeks',
    numeric: { min: 12, max: 16 },
    source: 'Industry consensus — needs verification',
    sourceUrl: '',
    lastUpdated: '2026-04-24',
    nextReviewDue: '2026-05-08',
    reviewCadence: 'monthly',
    notes: 'Lead time for H100/H200-class GPU procurement from major resellers (CDW, Dell, SuperMicro). B200/GB200/GB300 are allocation-based with no standard lead time. Verify by calling a reseller or checking channel partner portal. Updates as supply tightens/loosens.',
  } satisfies Benchmark,

  // ─── Data Center Construction ──────────────────────────────────────────────

  dataCenterConstructionYoY: {
    value: '+22% YoY',
    numeric: 22,
    source: 'Industry consensus — needs verification',
    sourceUrl: '',
    lastUpdated: '2026-04-24',
    nextReviewDue: '2026-05-08',
    reviewCadence: 'quarterly',
    notes: 'YoY growth in data center construction starts/completions. Previously inconsistent across this codebase (+22% in launch post, +23% in HyperscalerCapEx component, +20–25% range in Lumen prompt). Reconciled to +22% YoY as the single canonical value. Primary sources: Dodge Data & Analytics, JLL, CBRE data center reports, or hyperscaler earnings CapEx commentary. Update each quarter after hyperscaler earnings.',
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
- GPU Lead Times (H100/H200 class): ${b.gpuLeadTimesH100H200.value}; B200/GB200 are allocation-based [source: ${b.gpuLeadTimesH100H200.source}]
- Data Center Construction: ${b.dataCenterConstructionYoY.value}, constrained by power availability [source: ${b.dataCenterConstructionYoY.source}, updated ${b.dataCenterConstructionYoY.lastUpdated}]`
}
