import { NextResponse } from 'next/server'
import { fetchMarketData } from '@/lib/data'
import { fetchLiveMultiples } from '@/lib/liveMultiples'
import { buildContextData } from '@/lib/marketContext'
import { buildSourceMorningBrief } from '@/lib/morningBriefGuardrails'

export async function GET() {
  try {
    const [{ meta, snapshot }, multiples] = await Promise.all([
      fetchMarketData(),
      fetchLiveMultiples(),
    ])
    const brief = buildSourceMorningBrief(buildContextData(meta, snapshot), multiples)

    return NextResponse.json(
      { brief, generated_at: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=14400, stale-while-revalidate=86400' } },
    )
  } catch (err) {
    console.error('Morning brief error:', err)
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 })
  }
}
