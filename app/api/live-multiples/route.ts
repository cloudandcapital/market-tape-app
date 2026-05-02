import { NextResponse } from 'next/server'
import { fetchLiveMultiples } from '@/lib/liveMultiples'

export const revalidate = 1800

export async function GET() {
  try {
    const multiples = await fetchLiveMultiples()
    return NextResponse.json(multiples)
  } catch (err) {
    console.error('Live multiples error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
