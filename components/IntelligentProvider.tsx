'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { MarketContextData, BriefResponse, CachedBrief } from '@/lib/intelligentTypes'

const CACHE_KEY = 'intelligent-brief-v11'
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours

interface IntelligentState {
  data: BriefResponse | null
  loading: boolean
  error: boolean
  cachedAt: string | null
  refresh: () => void
}

export const IntelligentCtx = createContext<IntelligentState>({
  data: null, loading: true, error: false, cachedAt: null, refresh: () => {},
})

export function useIntelligent() { return useContext(IntelligentCtx) }

function hashContext(ctx: MarketContextData): string {
  return `${ctx.marketData.guidance}-${ctx.marketData.exposureLevel}-${ctx.marketData.vix.toFixed(0)}-${ctx.marketData.trends.long}-${ctx.marketData.trends.short}`
}

function loadCache(hash: string): BriefResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached: CachedBrief = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_DURATION) return null
    if (cached.contextHash !== hash) return null
    return cached.data
  } catch { return null }
}

function saveCache(data: BriefResponse, hash: string) {
  try {
    const cached: CachedBrief = { data, timestamp: Date.now(), contextHash: hash }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch {}
}

function formatCachedAt(data: BriefResponse): string {
  try {
    // 24-hour format: "07:04" — no AM/PM suffix, fits narrow viewports, matches terminal aesthetic
    return new Date(data.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch { return '' }
}

interface Props {
  contextData: MarketContextData
  children: ReactNode
}

export function IntelligentProvider({ contextData, children }: Props) {
  const [data, setData] = useState<BriefResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const hash = hashContext(contextData)

  const fetchBrief = useCallback(async (force = false) => {
    if (!force) {
      const cached = loadCache(hash)
      if (cached) {
        setData(cached)
        setLoading(false)
        return
      }
    }
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/intelligent-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: contextData }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
        saveCache(json.data, hash)
      } else {
        setError(true)
        // Try loading stale cache as fallback
        try {
          const raw = localStorage.getItem(CACHE_KEY)
          if (raw) { const c: CachedBrief = JSON.parse(raw); setData(c.data) }
        } catch {}
      }
    } catch {
      setError(true)
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (raw) { const c: CachedBrief = JSON.parse(raw); setData(c.data) }
      } catch {}
    } finally {
      setLoading(false)
    }
  }, [contextData, hash])

  useEffect(() => { fetchBrief() }, [fetchBrief])

  const cachedAt = data ? formatCachedAt(data) : null

  return (
    <IntelligentCtx.Provider value={{ data, loading, error, cachedAt, refresh: () => fetchBrief(true) }}>
      {/* Morning Brief — full-width top section */}
      <div className="mb-8 overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', borderLeft: '3px solid #6B8E7F', borderRadius: '2px' }}>
        <BriefSection />
      </div>

      {children}
    </IntelligentCtx.Provider>
  )
}

function BriefSection() {
  const { data, loading, error, cachedAt, refresh } = useIntelligent()

  return (
    <div style={{ background: '#fefdfb' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-7 py-[0.7rem]" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="font-mono text-[0.52rem] tracking-[0.22em] uppercase flex-shrink-0" style={{ color: '#6B8E7F' }}>Lumen&apos;s Analysis</span>
          {cachedAt && !loading && (
            <>
              <span className="font-mono text-[0.48rem] flex-shrink-0" style={{ color: 'rgba(0,0,0,0.2)' }}>·</span>
              <span className="font-mono text-[0.48rem] tracking-[0.1em] whitespace-nowrap flex-shrink-0" style={{ color: 'rgba(0,0,0,0.25)' }}>
                {cachedAt}
              </span>
            </>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="font-mono text-[0.48rem] tracking-[0.14em] uppercase transition-colors disabled:opacity-30 bg-transparent border-none cursor-pointer p-0 flex-shrink-0 ml-3"
          style={{ color: 'rgba(0,0,0,0.3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.3)')}
        >
          {loading ? 'generating…' : '↺ refresh'}
        </button>
      </div>

      {/* Content */}
      <div className="px-7 py-5">
        {loading && (
          <div className="flex items-center gap-3 py-3">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="block w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#6B8E7F', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="font-mono text-[0.73rem]" style={{ color: 'rgba(0,0,0,0.35)' }}>
              Lumen is analyzing market conditions…
            </p>
          </div>
        )}

        {!loading && !data && (
          <p className="font-mono text-[0.73rem] py-3" style={{ color: 'rgba(0,0,0,0.35)' }}>
            Analysis unavailable. Check ANTHROPIC_API_KEY environment variable.
          </p>
        )}

        {!loading && data && (
          <div>
            {data.morningBrief.headline && (
              <p className="font-mono text-[0.5rem] tracking-[0.18em] uppercase mb-3" style={{ color: '#6B8E7F' }}>
                {data.morningBrief.headline}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {data.morningBrief.paragraphs.map((para, i) => (
                <p key={i} style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: i === 0 ? '0.95rem' : '0.85rem',
                  lineHeight: i === 0 ? 1.6 : 1.5,
                  color: i === 0 ? '#191714' : '#444',
                  fontWeight: i === 0 ? 500 : 400,
                  margin: 0,
                }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
