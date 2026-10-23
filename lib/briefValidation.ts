import type { BriefResponse } from './intelligentTypes'

/** Shape and unit checks; not a claim that all generated prose is verified. */
export function assertBriefResponse(value: unknown): asserts value is BriefResponse {
  if (!value || typeof value !== 'object') throw new Error('Invalid analysis response')
  const brief = value as BriefResponse
  const text = (v: unknown) => typeof v === 'string' && v.length > 0 && v.length <= 2500
  const texts = (v: unknown, max: number) => Array.isArray(v) && v.length <= max && v.every(text)
  if (!brief.morningBrief || !text(brief.morningBrief.headline) || !text(brief.morningBrief.marketRead)
    || !text(brief.morningBrief.action) || !texts(brief.morningBrief.whatChanged, 3)
    || !texts(brief.morningBrief.cloudFinanceImplications, 2)
    || !brief.finopsSignals || !['cloudSpend', 'saasRenewals', 'infrastructure'].every(key => text(brief.finopsSignals[key as keyof BriefResponse['finopsSignals']]))
    || !Array.isArray(brief.riskAlerts) || brief.riskAlerts.length > 4
    || brief.riskAlerts.some(alert => !alert || !text(alert.title) || !text(alert.message) || !['warning', 'opportunity'].includes(alert.type))
    || !text(brief.sectorInsights)) {
    throw new Error('Incomplete analysis response')
  }
  // Only prose that can actually reach the UI needs a unit check. Source-controlled
  // valuation values and fixed review questions overwrite the corresponding fields.
  const visible = [brief.morningBrief.headline, brief.morningBrief.marketRead, brief.morningBrief.action,
    ...brief.morningBrief.whatChanged, ...brief.morningBrief.cloudFinanceImplications,
    ...Object.values(brief.finopsSignals), brief.sectorInsights, ...brief.riskAlerts.map(alert => alert.message)]
  const scoreAsPercent = /(?:[+-]?\d+(?:\.\d+)?\s*%\s*(?:1M\s*)?(?:RS(?:1M)?\b|relative[- ]strength\b|score\b)|\b(?:RS1M|RS|relative[- ]strength(?:\s+score)?|score)\s*(?:(?:of|at|is)\s+|:\s*)?[+-]?\d+(?:\.\d+)?\s*%)/i
  if (visible.some(prose => scoreAsPercent.test(prose))) throw new Error('Analysis confused score and percentage units')
}
