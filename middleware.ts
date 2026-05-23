import { NextRequest, NextResponse } from 'next/server'

const RATE_LIMIT = 10
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

const requests = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMITED_ROUTES = [
  '/api/intelligent-brief',
  '/api/morning-brief',
  '/api/ai-compute-brief',
]

const RATE_LIMIT_MESSAGE =
  "Market Tape is free and always will be — but to keep it that way, there's a limit of 10 requests per hour. Come back soon."

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!RATE_LIMITED_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const now = Date.now()
  const record = requests.get(ip)

  if (!record || now > record.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }

  if (record.count >= RATE_LIMIT) {
    return new NextResponse(JSON.stringify({ error: RATE_LIMIT_MESSAGE }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  record.count++
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
