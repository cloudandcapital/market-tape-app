import { NextResponse } from 'next/server'
import { getStatusSafeAiComputeFallback } from '@/lib/aiCompute'

// A deal tracker cannot establish the visitor's budget impact or a planning horizon.
// Keep this legacy endpoint deterministic, matching the tracker at every width.
export async function GET() {
  return NextResponse.json({ analysis: getStatusSafeAiComputeFallback(), fallback: true }, {
    headers: { 'Cache-Control': 's-maxage=1800' },
  })
}
