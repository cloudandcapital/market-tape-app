import { NextResponse } from 'next/server'
import type { MarketContextData } from '@/lib/intelligentTypes'
import { getCachedIntelligentBrief } from '@/lib/intelligentBrief'
import { fetchLiveMultiples } from '@/lib/liveMultiples'
import { summarizeProviderError } from '@/lib/providerError'
import { fetchMarketData } from '@/lib/data'
import { buildContextData } from '@/lib/marketContext'
import { snapshotIsOld } from '@/lib/marketIntegrity'

export async function POST(req: Request) {
  const requestStartedAt = performance.now()
  let marketDataCompletedAt = requestStartedAt
  let claudeStartedAt = requestStartedAt
  try {
    const { context: requestedContext }: { context: MarketContextData } = await req.json()

    // Fetch live multiples in parallel with no extra latency — Next.js cache
    // serves subsequent calls within the 30-min window from memory.
    const [market, multiples] = await Promise.all([fetchMarketData(), fetchLiveMultiples()])
    const context = buildContextData(market.meta, market.snapshot)
    if (snapshotIsOld(market.snapshot.generated_at_utc)) {
      return NextResponse.json({ success: false, error: 'The market snapshot is too old for new analysis.' }, { status: 409 })
    }
    if (JSON.stringify(requestedContext) !== JSON.stringify(context)) {
      return NextResponse.json({ success: false, error: 'The market snapshot changed. Reload the page before refreshing analysis.' }, { status: 409 })
    }
    marketDataCompletedAt = performance.now()
    claudeStartedAt = marketDataCompletedAt

    const cachedResult = await getCachedIntelligentBrief(context, multiples)
    const data = cachedResult.data
    const completedAt = performance.now()
    const cacheAgeMs = Math.max(0, Date.now() - cachedResult.cachedAt)
    console.info(
      `[intelligent-brief:timing] marketDataMs=${Math.round(marketDataCompletedAt - requestStartedAt)} ` +
      `claudeMs=${Math.round(completedAt - claudeStartedAt)} totalMs=${Math.round(completedAt - requestStartedAt)} ` +
      `cacheAgeMs=${cacheAgeMs}`,
    )

    return NextResponse.json({ success: true, data }, {
      headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=86400' },
    })
  } catch (err) {
    const failedAt = performance.now()
    const marketDataFailed = claudeStartedAt === requestStartedAt
    console.info(
      `[intelligent-brief:timing] marketDataMs=${Math.round((marketDataFailed ? failedAt : marketDataCompletedAt) - requestStartedAt)} ` +
      `claudeMs=${marketDataFailed ? 0 : Math.round(failedAt - claudeStartedAt)} totalMs=${Math.round(failedAt - requestStartedAt)} failed=true`,
    )
    console.error(`[intelligent-brief:error] ${JSON.stringify(summarizeProviderError(err))}`)
    return NextResponse.json({ success: false, error: 'Analysis is temporarily unavailable.' }, { status: 500 })
  }
}
