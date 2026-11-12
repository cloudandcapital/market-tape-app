import type { BriefResponse, MarketContextData } from './intelligentTypes'

// The price date identifies the snapshot's session, not a confirmed final close.
// Apply this on display so existing browser/server caches do not need regeneration.
const FINAL_CLOSE = /\b(?:closed(?:\s+the\s+session)?\s+(?:at|up|down|higher|lower|flat|mixed|today|yesterday|on)|closing\s+(?:price|prices|level|levels)|at\s+the\s+close|end[- ]of[- ]day)\b/i

function snapshotSentences(text: string): string {
  return text.split(/(?<=[.!?])\s+/).filter(sentence => !FINAL_CLOSE.test(sentence)).join(' ').trim()
}

function signedPercent(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function enforceSnapshotLanguage(brief: BriefResponse, context: MarketContextData): BriefResponse {
  const marketRead = snapshotSentences(brief.morningBrief.marketRead)
  const { spy, spyD1, vix, vixD1 } = context.marketData
  const fallback = [spy, spyD1, vix, vixD1].every(Number.isFinite)
    ? `${context.marketSessionLabel}. In that snapshot, SPY was $${spy.toFixed(2)} (${signedPercent(spyD1)} over one session) and VIX was ${vix.toFixed(2)} (${signedPercent(vixD1)} over one session).`
    : `${context.marketSessionLabel}. Review the dated prices and one-day changes shown on this page.`
  return {
    ...brief,
    morningBrief: {
      ...brief.morningBrief,
      headline: snapshotSentences(brief.morningBrief.headline) || 'The dated market snapshot',
      marketRead: marketRead || fallback,
      whatChanged: brief.morningBrief.whatChanged.map(snapshotSentences).filter(Boolean),
    },
    sectorInsights: snapshotSentences(brief.sectorInsights) || 'Compare the dated 20-session sector scores shown below.',
  }
}
