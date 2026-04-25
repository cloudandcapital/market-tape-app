'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { MarketContextData, BriefResponse, CachedBrief } from '@/lib/intelligentTypes'

const CACHE_KEY = 'intelligent-brief-v2'
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
    return new Date(data.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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
      <div className="mb-8 overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '2px' }}>
        <BriefSection />
      </div>

      {children}
    </IntelligentCtx.Provider>
  )
}

function BriefSection() {
  const { data, loading, error, cachedAt, refresh } = useIntelligent()

  return (
    <div className="bg-[#191714]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-7 py-[0.8rem]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.52rem] tracking-[0.22em] uppercase text-[#6B8E7F]">Intelligence Brief</span>
          {cachedAt && !loading && (
            <>
              <span className="font-mono text-[0.48rem] text-white/20">·</span>
              <span className="font-mono text-[0.48rem] tracking-[0.1em] text-white/25">
                {error ? 'cached' : 'generated'} {cachedAt}
              </span>
            </>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="font-mono text-[0.48rem] tracking-[0.14em] uppercase text-white/25 hover:text-white/60 transition-colors disabled:opacity-30 bg-transparent border-none cursor-pointer p-0"
        >
          {loading ? 'generating…' : '↺ refresh'}
        </button>
      </div>

      {/* Content */}
      <div className="px-7 py-6">
        {loading && (
          <div className="flex items-center gap-3 py-4">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="block w-1.5 h-1.5 rounded-full bg-[#6B8E7F] animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="font-mono text-[0.75rem] text-white/30">Analyzing market conditions with Claude…</p>
          </div>
        )}

        {!loading && !data && (
          <p className="font-mono text-[0.75rem] text-white/30 py-4">
            Brief unavailable. Check ANTHROPIC_API_KEY environment variable.
          </p>
        )}

        {!loading && data && (
          <div className="pl-4" style={{ borderLeft: '2px solid #6B8E7F' }}>
            {data.morningBrief.headline && (
              <p className="font-mono text-[0.52rem] tracking-[0.18em] uppercase text-[#6B8E7F] mb-3">
                {data.morningBrief.headline}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {data.morningBrief.paragraphs.map((para, i) => (
                <p key={i} style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: i === 0 ? '1.0rem' : '0.9rem',
                  lineHeight: 1.7,
                  color: i === 0 ? 'rgba(244,239,230,0.92)' : 'rgba(244,239,230,0.62)',
                  fontWeight: 400,
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
