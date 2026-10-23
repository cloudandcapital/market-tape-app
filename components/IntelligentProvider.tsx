'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { MarketContextData, BriefResponse, CachedBrief } from '@/lib/intelligentTypes'

const CACHE_KEY = 'intelligent-brief-v20'
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours
const REQUEST_TIMEOUT_MS = 75_000

interface IntelligentState {
  data: BriefResponse | null
  loading: boolean
  error: boolean
  cachedAt: string | null
  contextData: MarketContextData | null
  refresh: () => void
  paused?: boolean
  snapshotChanged?: boolean
  refreshMessage?: string
}

export const IntelligentCtx = createContext<IntelligentState>({
  data: null, loading: true, error: false, cachedAt: null, contextData: null, refresh: () => {},
})

export function useIntelligent() { return useContext(IntelligentCtx) }

function hashContext(ctx: MarketContextData): string {
  return JSON.stringify(ctx)
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
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    }).formatToParts(new Date(data.generatedAt))
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? ''
    return `Generated ${value('month')} ${value('day')} · ${value('hour')}:${value('minute')} ${value('dayPeriod')} ET`
  } catch { return '' }
}

interface Props {
  contextData: MarketContextData
  initialData?: BriefResponse | null
  children: ReactNode
  disabled?: boolean
}

export function IntelligentProvider({ contextData, initialData = null, children, disabled = false }: Props) {
  const [data, setData] = useState<BriefResponse | null>(initialData)
  const [loading, setLoading] = useState(!initialData && !disabled)
  const [error, setError] = useState(false)
  const [snapshotChanged, setSnapshotChanged] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState('')
  const previousGeneration = useRef(initialData?.generatedAt)

  const hash = hashContext(contextData)

  const fetchBrief = useCallback(async (force = false) => {
    if (disabled) return
    if (!force) {
      const cached = loadCache(hash)
      if (cached) {
        setData(cached)
        previousGeneration.current = cached.generatedAt
        setLoading(false)
        return
      }
    }
    setLoading(true)
    setError(false)
    if (force) setRefreshMessage('Checking analysis for this snapshot…')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch('/api/intelligent-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: contextData }),
        signal: controller.signal,
      })
      if (res.status === 409) {
        setRefreshMessage('A newer snapshot is available. Reload the page.')
        setSnapshotChanged(true)
        setData(null)
        setError(true)
        return
      }
      if (!res.ok) throw new Error('Analysis request failed')
      const json = await res.json()
      if (json.success && json.data) {
        if (force) setRefreshMessage(json.data.generatedAt === previousGeneration.current ? 'Checked. This is still the cached analysis for this snapshot; refreshing does not fetch live prices.' : 'Analysis updated for the displayed snapshot.')
        previousGeneration.current = json.data.generatedAt
        setData(json.data)
        saveCache(json.data, hash)
      } else {
        if (force) setRefreshMessage('Could not refresh analysis. Any earlier analysis below keeps its original date.')
        setError(true)
        const cached = loadCache(hash)
        if (cached) setData(cached)
      }
    } catch {
      if (force) setRefreshMessage('Could not refresh analysis. Any earlier analysis below keeps its original date.')
      setError(true)
      const cached = loadCache(hash)
      if (cached) setData(cached)
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }, [contextData, hash, disabled])

  useEffect(() => {
    if (initialData) {
      saveCache(initialData, hash)
      return
    }
    const kickoff = window.setTimeout(() => void fetchBrief(), 0)
    return () => window.clearTimeout(kickoff)
  }, [fetchBrief, hash, initialData])

  const cachedAt = data ? formatCachedAt(data) : null

  return (
    <IntelligentCtx.Provider value={{ data, loading, error, cachedAt, contextData, paused: disabled, snapshotChanged, refreshMessage, refresh: () => fetchBrief(true) }}>
      {/* Morning Brief — full-width top section */}
      <div className="mb-8 overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', borderLeft: '3px solid #6B8E7F', borderRadius: '2px' }}>
        <BriefSection />
      </div>

      {children}
    </IntelligentCtx.Provider>
  )
}

function BriefSection() {
  const { data, loading, cachedAt, refresh, paused, snapshotChanged, refreshMessage } = useIntelligent()

  return (
    <div style={{ background: '#fefdfb' }}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 px-4 sm:px-7 py-[0.7rem] rule-subtle-bottom">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <span className="font-mono text-[0.72rem] tracking-[0.22em] uppercase flex-shrink-0" style={{ color: '#4A6B5F' }}>Lumen&apos;s Analysis</span>
          {cachedAt && !loading && (
            <>
              <span className="font-mono text-[0.72rem] flex-shrink-0" style={{ color: 'rgba(0,0,0,0.2)' }}>·</span>
              <span className="font-mono text-[0.72rem] tracking-[0.06em] uppercase text-charcoal/65">
                {cachedAt}
              </span>
            </>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={loading || paused || snapshotChanged}
          className="font-mono text-[0.72rem] tracking-[0.14em] uppercase transition-colors disabled:opacity-40 bg-transparent border-none cursor-pointer px-2 py-2 min-h-8 flex-shrink-0 ml-auto sm:ml-3"
          style={{ color: '#655e58' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.55)')}
        >
          {paused ? 'analysis paused' : snapshotChanged ? 'reload needed' : loading ? 'generating…' : '↺ refresh analysis'}
        </button>
      </div>

      {refreshMessage && <p role="status" aria-live="polite" className="px-7 pt-2 font-mono text-xs text-charcoal/65">{refreshMessage}</p>}
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
            <p className="font-mono text-[0.73rem]" style={{ color: '#655e58' }}>
              Lumen is analyzing market conditions…
            </p>
          </div>
        )}

        {!loading && !data && (
          <div className="flex flex-wrap items-center gap-3 py-3">
            <p className="font-mono text-[0.73rem]" style={{ color: '#655e58' }}>
              {paused ? 'Analysis is paused for this older snapshot. Check the dates on the data below.' : snapshotChanged ? 'A different market snapshot is available. Reload the page to keep the numbers and analysis together.' : 'Analysis is temporarily unavailable. You can still explore the dated market data below.'}
            </p>
            {snapshotChanged ? <a href="/" className="font-mono text-xs underline">Reload Market Tape</a> : !paused && <button onClick={refresh} className="font-mono text-xs underline text-charcoal/65 hover:text-charcoal">Try again</button>}
          </div>
        )}

        {!loading && data && (
          <div>
            {data.morningBrief.headline && (
              <p className="font-mono text-[0.72rem] tracking-[0.18em] uppercase mb-3 text-sage-dark">
                {data.morningBrief.headline}
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-[1.25fr_1fr]">
              <div>
                <p className="font-serif text-[0.95rem] leading-relaxed text-charcoal mb-4">{data.morningBrief.marketRead}</p>
                <p className="font-mono text-[0.72rem] tracking-[0.16em] uppercase text-charcoal/65 mb-2">Session moves</p>
                <ul className="space-y-1.5">
                  {data.morningBrief.whatChanged.slice(0, 3).map((item, i) => <li key={i} className="font-mono text-[0.72rem] leading-relaxed text-charcoal/65 flex gap-2"><span className="text-sage-dark">•</span><span>{item}</span></li>)}
                </ul>
              </div>
              <div className="md:border-l md:pl-5" style={{ borderColor: 'var(--rule-subtle)' }}>
                <p className="font-mono text-[0.72rem] tracking-[0.16em] uppercase text-charcoal/65 mb-2">Separate questions for your cost review</p>
                <ul className="space-y-1.5 mb-4">
                  {data.morningBrief.cloudFinanceImplications.slice(0, 2).map((item, i) => <li key={i} className="font-mono text-[0.72rem] leading-relaxed text-charcoal/65 flex gap-2"><span className="text-sage-dark">•</span><span>{item}</span></li>)}
                </ul>
                <div className="rule-subtle-top pt-3">
                  <p className="font-mono text-[0.72rem] tracking-[0.16em] uppercase text-sage-dark mb-1.5">A market question to follow</p>
                  <p className="font-serif italic text-[0.84rem] leading-relaxed text-charcoal/80">{data.morningBrief.action}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
