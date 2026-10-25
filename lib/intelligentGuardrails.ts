import { BENCHMARKS } from './industryBenchmarks'
import { CLOUD_REVIEW } from './cloudReview'
import type { Benchmark } from '@/lib/industryBenchmarks'
import type { MarketContextData, BriefResponse } from '@/lib/intelligentTypes'

// Exact title mapping is shared by validation and tooltips; unknown titles have no source.
export function riskAlertSource(title: string) {
  switch (title) {
    case 'Bond ETF Weakness': return 'TLT'
    case 'Dollar Weakening': return 'DXY'
    case 'GPU Capacity Tightening': return 'gpuSupplyStatus'
    case 'Data Center Capacity Tightness': return 'dataCenterConstructionYoY'
    default: return null
  }
}

export interface RiskAlertInputs {
  market: Pick<MarketContextData, 'macroData'> & Partial<Pick<MarketContextData, 'sectorData'>>
  multiples: { saas: string }
  benchmarks: {
    gpuSupplyStatus: Benchmark
    dataCenterConstructionYoY: Benchmark
    saas2021PeakMultiple: Benchmark
  }
}

export function validateRiskAlerts(alerts: BriefResponse['riskAlerts'], inputs: RiskAlertInputs): BriefResponse['riskAlerts'] {
  const { market, benchmarks } = inputs
  const dc = benchmarks.dataCenterConstructionYoY.numeric
  // Review thresholds use actual price returns, never RS1M score units.
  // <=2% vacancy with >=80% construction preleased describes capacity tightness.
  // GPU availability variation or historical commentary alone is insufficient.
  const gpu = benchmarks.gpuSupplyStatus.value
  const gpuSupported = /\b(?:H100|H200|B200|Blackwell|Hopper)\b[^.;]*\b(?:supply-constrained|supply constrained)\b/i.test(gpu)
    && !/\b(?:not|no|neither|isn't|aren't)\b/i.test(gpu)
  return (Array.isArray(alerts) ? alerts : []).filter(alert => {
    if (!alert || typeof alert.message !== 'string' || !['warning', 'opportunity'].includes(alert.type)) return false
    switch (riskAlertSource(alert.title)) {
      case 'TLT': return Number.isFinite(market.macroData.tlt?.d20) && market.macroData.tlt!.d20! < -2
      case 'DXY': return Number.isFinite(market.macroData.dxy?.d20) && market.macroData.dxy!.d20! < -5
      case 'gpuSupplyStatus': return gpuSupported
      case 'dataCenterConstructionYoY': return typeof dc === 'object' && dc !== null && 'vacancy_pct' in dc && 'construction_preleased_pct' in dc
        && Number.isFinite(dc.vacancy_pct) && dc.vacancy_pct >= 0 && dc.vacancy_pct <= 2
        && Number.isFinite(dc.construction_preleased_pct) && dc.construction_preleased_pct >= 80 && dc.construction_preleased_pct <= 100
      default: return false
    }
  }).map(alert => {
    // The trigger is internal; visible messages describe the measured observation.
    const source = riskAlertSource(alert.title)
    if (source === 'dataCenterConstructionYoY' && typeof dc === 'object' && dc && 'vacancy_pct' in dc) {
      return { ...alert, message: `CBRE’s H1 2026 primary-market vacancy was ${dc.vacancy_pct}%, unchanged from year-end 2025; ${dc.construction_preleased_pct}% of construction was preleased.` }
    }
    if (source === 'TLT') return { ...alert, message: `TLT’s price fell ${Math.abs(market.macroData.tlt!.d20!).toFixed(2)}% over 20 trading sessions. This ETF move does not measure a Treasury yield or a credit spread.` }
    if (source === 'DXY') return { ...alert, message: `DXY fell ${Math.abs(market.macroData.dxy!.d20!).toFixed(2)}% over 20 trading sessions. Check actual currency exposures before drawing a business conclusion.` }
    return { ...alert, message: benchmarks.gpuSupplyStatus.value }
  })
}

export const ORGANIZATION_DECISION_CONTEXT =
  'For any organization, that decision remains conditional on workload demand, utilization, contract terms, budget, and business priorities.'

const DECISION_LANGUAGE = /\b(review|pause|defer|delay|extend|shorten|expand|expansions?|commit(?:ment)?s?|renewals?|favor|avoid|protect|procure|purchase|approval|lock(?:ing)? in|warrant)\b/i
const CLOUD_SCOPE = /\b(cloud|compute|gpu|capacity|infrastructure|workload|reservations?|contracts?|commitments?|renewals?|expansions?|spend|budget)\b/i

const REQUIRED_CONTEXT = [
  /\bworkload demand\b/i,
  /\butilization\b/i,
  /\bcontract(?:ual| terms?)?\b/i,
  /\bbudget\b/i,
  /\bbusiness[- ]priorit(?:y|ies)\b/i,
]

function hasFullDecisionContext(text: string): boolean {
  return REQUIRED_CONTEXT.every(pattern => pattern.test(text))
}

export function enforceDecisionGuardrail(text: string): string {
  if (text.trim().endsWith('?')) return text
  if (!DECISION_LANGUAGE.test(text) || !CLOUD_SCOPE.test(text) || hasFullDecisionContext(text)) {
    return text
  }

  return `${text.trim()} ${ORGANIZATION_DECISION_CONTEXT}`
}

const VIX_REFERENCE = /\bVIX\b/i
const POINT_CHANGE = /\b(?:up|down|rose|fell|gained|lost|jumped|moved)\b.*\bpoints?\b/i

export function removeUnsupportedVixPointClaims(text: string): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter(sentence => !(VIX_REFERENCE.test(sentence) && POINT_CHANGE.test(sentence)))
    .join(' ')
    .trim()
}

export function enforceInterpretationGuardrails(brief: BriefResponse, inputs: RiskAlertInputs): BriefResponse {
  const sectors = inputs.market.sectorData ? [...inputs.market.sectorData].sort((a, b) => b.rs1m - a.rs1m) : []
  return {
    ...brief,
    riskAlerts: validateRiskAlerts(brief.riskAlerts, inputs),
    morningBrief: {
      ...brief.morningBrief,
      headline: removeUnsupportedVixPointClaims(brief.morningBrief.headline) || 'Dated market snapshot',
      marketRead: removeUnsupportedVixPointClaims(brief.morningBrief.marketRead) || 'See the VIX one-day percentage change in Market Internals.',
      whatChanged: brief.morningBrief.whatChanged.map(removeUnsupportedVixPointClaims).filter(Boolean),
      cloudFinanceImplications: ['Which costs are tied to steady usage, and which can change?', 'What do the actual quote, notice deadline, and contract terms say?'],
      action: sectors.length > 1 ? `What explains the score difference between ${sectors[0].ticker} and ${sectors[sectors.length - 1].ticker}? Check their holdings and recent news.` : enforceDecisionGuardrail(brief.morningBrief.action),
    },
    finopsSignals: {
      cloudSpend: 'What are you using, what are you paying, and where do the two differ?',
      saasRenewals: 'When is the notice deadline, which seats are used, and what alternatives have you priced?',
      infrastructure: `Selected GPU rental list rates from Thunder Compute’s October 16 comparison: ${BENCHMARKS.gpuSupplyStatus.value}. This vendor comparison includes reservation-only rates, not a market-wide price floor or a capacity quote.`,
    },
    commitmentWindows: CLOUD_REVIEW,
    sectorInsights: enforceDecisionGuardrail(brief.sectorInsights),
  }
}
