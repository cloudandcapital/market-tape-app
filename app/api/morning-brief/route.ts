import { NextResponse } from 'next/server'

// The current page uses /api/intelligent-brief. Keep the old URL from
// starting a separate, uncached provider request.
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint has been retired. Open Market Tape for the current brief.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}
