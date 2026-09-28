import type { BriefResponse } from '@/lib/intelligentTypes'

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

export function enforceInterpretationGuardrails(brief: BriefResponse): BriefResponse {
  return {
    ...brief,
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
