import type { MarketContextData } from './intelligentTypes'
import type { LiveMultiples } from './liveMultiples'
import { BENCHMARKS } from './industryBenchmarks'

export const MORNING_BRIEF_DECISION_CONTEXT =
  'Any organization-specific decision still depends on workload demand, utilization, contract terms, budget, and business priorities.'

export function buildSourceMorningBrief(context: MarketContextData, multiples: LiveMultiples): string {
  const market = context.marketData
  const equity = market.equityBasket
  if (!equity) throw new Error('Equity ETF breadth is unavailable')

  const currentValuations = Object.values(multiples.baskets ?? {}).filter(basket => basket.source === 'live').length
  const valuationStatus = currentValuations === 0
    ? 'Current valuation baskets are unavailable, so archived values remain suppressed.'
    : `${currentValuations} of 3 current valuation baskets are available.`

  return [
    `${market.guidance}: ${equity.positiveCount} of ${equity.count} tracked equity ETFs have positive 20-session RS1M scores, ${market.breadth.above20d}% are above their 20-day averages, and ${market.breadth.above50d}% are above their 50-day averages. The classified trend horizons are ${market.trends.short_term.toLowerCase()} short term, ${market.trends.intermediate_term.toLowerCase()} intermediate term, and ${market.trends.long_term.toLowerCase()} long term.`,
    `Market conditions are context, not instructions to change technology commitments. The source-dated hyperscaler CapEx benchmark remains ${BENCHMARKS.hyperscalerCapexTrend.value.toLowerCase()}. ${valuationStatus} ${MORNING_BRIEF_DECISION_CONTEXT}`,
    'Watch the next dated snapshot for changes in tracked equity ETF breadth and sector score gaps. Compare any change with actual workload and contract evidence before drawing technology-finance conclusions.',
  ].join('\n\n')
}
