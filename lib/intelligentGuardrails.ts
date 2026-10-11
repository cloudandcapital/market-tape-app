import type { Benchmark } from '@/lib/industryBenchmarks'
import type { MarketContextData, BriefResponse } from '@/lib/intelligentTypes'

// Exact title mapping is shared by validation and tooltips; unknown titles have no source.
export function riskAlertSource(title: string) {
  switch (title) {
    case 'Rates Rising': return 'TLT'
    case 'Dollar Weakening': return 'DXY'
    case 'GPU Capacity Tightening': return 'gpuSupplyStatus'
    case 'SaaS Discount Window': return 'saas'
    case 'Data Center Capacity Tightness': return 'dataCenterConstructionYoY'
    default: return null
  }
}

export interface RiskAlertInputs {
  market: Pick<MarketContextData, 'macroData'>
  multiples: { saas: string }
  benchmarks: {
    gpuSupplyStatus: Benchmark
    dataCenterConstructionYoY: Benchmark
    saas2021PeakMultiple: Benchmark
  }
}

export function validateRiskAlerts(alerts: BriefResponse['riskAlerts'], inputs: RiskAlertInputs): BriefResponse['riskAlerts'] {
  const { market, multiples, benchmarks } = inputs
  const saasMatch = /^~?(\d+(?:\.\d+)?)\s*[×x](?:\s|$)/i.exec(multiples.saas)
  const saas = saasMatch ? Number(saasMatch[1]) : NaN
  const peak = benchmarks.saas2021PeakMultiple.numeric
  const dc = benchmarks.dataCenterConstructionYoY.numeric
  // Conservative operational definitions: more than 50% below the historical
  // SaaS peak; <=2% vacancy with >=80% construction preleased for capacity tightness.
  // GPU availability variation or historical commentary alone is insufficient.
  const gpu = benchmarks.gpuSupplyStatus.value
  const gpuSupported = /\b(?:H100|H200|B200|Blackwell|Hopper)\b[^.;]*\b(?:supply-constrained|supply constrained)\b/i.test(gpu)
    && !/\b(?:not|no|neither|isn't|aren't)\b/i.test(gpu)
  return (Array.isArray(alerts) ? alerts : []).filter(alert => {
    if (!alert || typeof alert.message !== 'string' || !['warning', 'opportunity'].includes(alert.type)) return false
    switch (riskAlertSource(alert.title)) {
      case 'TLT': return Number.isFinite(market.macroData.tlt?.rs1m) && market.macroData.tlt!.rs1m < -2
      case 'DXY': return Number.isFinite(market.macroData.dxy?.rs1m) && market.macroData.dxy!.rs1m < -5
      case 'gpuSupplyStatus': return gpuSupported
      case 'saas': return Number.isFinite(saas) && saas > 0 && typeof peak === 'number' && saas < peak * 0.5
      case 'dataCenterConstructionYoY': return typeof dc === 'object' && dc !== null && 'vacancy_pct' in dc && 'construction_preleased_pct' in dc
        && Number.isFinite(dc.vacancy_pct) && dc.vacancy_pct >= 0 && dc.vacancy_pct <= 2
        && Number.isFinite(dc.construction_preleased_pct) && dc.construction_preleased_pct >= 80 && dc.construction_preleased_pct <= 100
      default: return false
    }
  }).map(alert => ({ ...alert, message: enforceDecisionGuardrail(alert.message) }))
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
  if (!DECISION_LANGUAGE.test(text) || !CLOUD_SCOPE.test(text) || hasFullDecisionContext(text)) {
    return text
  }

  return `${text.trim()} ${ORGANIZATION_DECISION_CONTEXT}`
}

export function enforceInterpretationGuardrails(brief: BriefResponse, inputs: RiskAlertInputs): BriefResponse {
  return {
    ...brief,
    riskAlerts: validateRiskAlerts(brief.riskAlerts, inputs),
    morningBrief: {
      ...brief.morningBrief,
      cloudFinanceImplications: brief.morningBrief.cloudFinanceImplications.map(enforceDecisionGuardrail),
      action: enforceDecisionGuardrail(brief.morningBrief.action),
    },
    finopsSignals: {
      cloudSpend: enforceDecisionGuardrail(brief.finopsSignals.cloudSpend),
      saasRenewals: enforceDecisionGuardrail(brief.finopsSignals.saasRenewals),
      infrastructure: enforceDecisionGuardrail(brief.finopsSignals.infrastructure),
    },
    commitmentWindows: {
      oneYear: {
        ...brief.commitmentWindows.oneYear,
        reason: enforceDecisionGuardrail(brief.commitmentWindows.oneYear.reason),
      },
      threeYear: {
        ...brief.commitmentWindows.threeYear,
        reason: enforceDecisionGuardrail(brief.commitmentWindows.threeYear.reason),
      },
      spot: {
        ...brief.commitmentWindows.spot,
        reason: enforceDecisionGuardrail(brief.commitmentWindows.spot.reason),
      },
    },
    sectorInsights: enforceDecisionGuardrail(brief.sectorInsights),
  }
}
