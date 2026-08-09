'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  aiComputeData,
  AI_COMPUTE_DATA_VERSION,
  AI_COMPUTE_LAST_UPDATED,
  getStatusSafeAiComputeFallback,
  type AiComputeRow,
} from '@/lib/aiCompute'

const CACHE_KEY = `ai-compute-brief-${AI_COMPUTE_DATA_VERSION}`
const CACHE_DURATION = 24 * 60 * 60 * 1000
const REQUEST_TIMEOUT_MS = 18_000
const FALLBACK = getStatusSafeAiComputeFallback()

function formatUpdatedDate(raw: string): string {
  return raw
}

function SourceLinks({ row, compact = false }: { row: AiComputeRow; compact?: boolean }) {
  return <>{row.sources.map((source, index) => <span key={source.url}>{index > 0 && ' · '}<a href={source.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[0.62rem] text-charcoal/55 hover:text-sage-dark transition-colors" aria-label={`${source.kind} source for ${row.buyer} ${row.provider}`}>{compact ? source.label : `${source.label} ↗`}</a></span>)}</>
}

function loadCachedAnalysis(): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_DURATION) return null
    return cached.analysis as string
  } catch { return null }
}

function saveCachedAnalysis(analysis: string) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ analysis, timestamp: Date.now() })) } catch {}
}

function StatusBadge({ status }: { status: AiComputeRow['status'] }) {
  return (
    <span className="inline-block rounded-full border border-charcoal/10 px-2 py-0.5 font-mono text-[0.52rem] tracking-[0.05em] text-charcoal/55 whitespace-nowrap">
      {status}
    </span>
  )
}

function DesktopTable({ rows }: { rows: AiComputeRow[] }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse">
        <thead><tr>
          {['Buyer', 'Compute Provider', 'Status', 'Disclosed value', 'Capacity', 'Term', 'Announced', 'Source'].map(h => (
            <th key={h} className="text-left font-mono text-[0.52rem] tracking-[0.16em] uppercase text-charcoal/55 pb-2.5 pr-3 font-normal">{h}</th>
          ))}
        </tr></thead>
        <tbody className="rows-subtle">
          {rows.map(row => (
            <tr key={`${row.buyer}-${row.provider}`}>
              <td className="font-mono text-[0.72rem] font-medium text-charcoal/80 py-2 pr-3 whitespace-nowrap">{row.buyer}</td>
              <td className="font-mono text-[0.68rem] text-charcoal/60 py-2 pr-3">{row.provider}</td>
              <td className="py-2 pr-3"><StatusBadge status={row.status} /></td>
              <td className="font-mono text-[0.68rem] font-medium py-2 pr-3" style={{ color: '#6B8E7F' }}>{row.amount}</td>
              <td className="font-mono text-[0.68rem] text-charcoal/60 py-2 pr-3 whitespace-nowrap">{row.capacity}</td>
              <td className="font-mono text-[0.68rem] text-charcoal/55 py-2 pr-3">{row.term}</td>
              <td className="font-mono text-[0.68rem] text-charcoal/55 py-2 pr-3 whitespace-nowrap">{row.announced}</td>
              <td className="py-2 whitespace-nowrap"><SourceLinks row={row} compact /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MobileCards({ rows }: { rows: AiComputeRow[] }) {
  return (
    <div className="md:hidden space-y-1 rows-subtle">
      {rows.map(row => (
        <article key={`${row.buyer}-${row.provider}`} className="py-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div><p className="font-mono text-[0.75rem] font-medium text-charcoal/80">{row.buyer}</p><p className="font-mono text-[0.65rem] text-charcoal/55 mt-0.5">{row.provider}</p></div>
            <StatusBadge status={row.status} />
          </div>
          <p className="font-mono text-[0.7rem] font-medium mb-1" style={{ color: '#6B8E7F' }}>{row.amount}</p>
          <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-[0.64rem] text-charcoal/55">
            <span>{row.capacity}</span><span>·</span><span>{row.term}</span><span>·</span><span>{row.announced}</span>
            <SourceLinks row={row} />
          </div>
        </article>
      ))}
    </div>
  )
}

export default function AIComputeCommitments() {
  const [analysis, setAnalysis] = useState<string | null>(FALLBACK)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const statusCounts = useMemo(() => aiComputeData.reduce<Record<string, number>>((counts, row) => {
    counts[row.status] = (counts[row.status] ?? 0) + 1
    return counts
  }, {}), [])

  const fetchAnalysis = useCallback(async (force = false) => {
    if (!force) {
      const cached = loadCachedAnalysis()
      if (cached) { setAnalysis(cached); setLoading(false); return }
    }
    setLoading(true)
    setError(false)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch('/api/ai-compute-brief', { signal: controller.signal })
      if (!response.ok) throw new Error('AI compute analysis request failed')
      const json = await response.json()
      const text = json.analysis as string | null
      setAnalysis(text || FALLBACK)
      if (text) saveCachedAnalysis(text)
    } catch {
      setError(true)
      setAnalysis(FALLBACK)
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const kickoff = window.setTimeout(() => void fetchAnalysis(), 0)
    return () => window.clearTimeout(kickoff)
  }, [fetchAnalysis])

  return (
    <section id="ai-compute-tracker">
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/50 mb-4">AI Compute Commitments</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <div><p className="font-serif text-2xl text-charcoal">{aiComputeData.length}</p><p className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-charcoal/55">tracked deals</p></div>
        {Object.entries(statusCounts).map(([status, count]) => <div key={status}><p className="font-serif text-2xl text-charcoal">{count}</p><p className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-charcoal/55">{status}</p></div>)}
      </div>
      <p className="font-mono text-[0.64rem] text-charcoal/60 mb-4">Last updated {formatUpdatedDate(AI_COMPUTE_LAST_UPDATED)} · Values and capacity identify their provenance; only comparable, company-disclosed signed compute/cloud values enter the dollar headline, and no GW total is calculated.</p>

      <div className="mb-5 min-h-8">
        {loading ? <div className="flex items-center gap-2" aria-label="Loading AI compute analysis">{[0, 1, 2].map(i => <span key={i} className="block w-1 h-1 rounded-full animate-pulse" style={{ background: '#6B8E7F', animationDelay: `${i * 0.2}s` }} />)}</div> :
          error ? <div className="flex flex-wrap items-center gap-3"><p className="font-serif italic text-[0.82rem] leading-relaxed" style={{ color: '#6B8E7F' }}>{analysis || FALLBACK}</p><button onClick={() => void fetchAnalysis(true)} className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-charcoal/45 hover:text-charcoal/70">Refresh analysis</button></div> :
          <p className="font-serif italic text-[0.82rem] leading-relaxed" style={{ color: '#6B8E7F' }}>{analysis || FALLBACK}</p>}
      </div>

      <details className="group rule-subtle-top pt-3">
        <summary className="cursor-pointer list-none font-mono text-[0.62rem] uppercase tracking-[0.12em] text-charcoal/55 hover:text-charcoal/80 mb-3">View full tracker <span aria-hidden="true" className="group-open:hidden">↓</span><span aria-hidden="true" className="hidden group-open:inline">↑</span></summary>
        <DesktopTable rows={aiComputeData} />
        <MobileCards rows={aiComputeData} />
      </details>
    </section>
  )
}
