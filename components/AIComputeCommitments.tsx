'use client'

import { useState, useEffect } from 'react'
import { aiComputeData, AI_COMPUTE_DATA_VERSION, type AiComputeRow } from '@/lib/aiCompute'

const CACHE_KEY = `ai-compute-brief-${AI_COMPUTE_DATA_VERSION}`
const CACHE_DURATION = 24 * 60 * 60 * 1000
const FALLBACK = "AI labs have moved from optionality to commitment. Spot pricing is tightening, reservation discount windows are narrowing. For finance teams, 'wait for cheaper' is no longer a defensible posture."

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
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ analysis, timestamp: Date.now() }))
  } catch {}
}

function DesktopTable({ rows }: { rows: AiComputeRow[] }) {
  return (
    <table className="w-full border-collapse hidden md:table">
      <thead>
        <tr>
          {['AI Lab', 'Compute Provider', '$ Committed', 'GW Locked', 'Term', 'Announced', 'Source'].map(h => (
            <th key={h} className="text-left font-mono text-[0.48rem] tracking-[0.16em] uppercase text-charcoal/35 pb-2.5 pr-3 font-normal">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-charcoal/8">
        {rows.map((row, i) => (
          <tr key={i}>
            <td className="font-mono text-[0.72rem] font-medium text-charcoal/80 py-[0.38rem] pr-3 whitespace-nowrap">{row.lab}</td>
            <td className="font-mono text-[0.68rem] text-charcoal/60 py-[0.38rem] pr-3">{row.provider}</td>
            <td className="font-mono text-[0.72rem] font-medium py-[0.38rem] pr-3 whitespace-nowrap" style={{ color: '#6B8E7F' }}>{row.amount}</td>
            <td className="font-mono text-[0.68rem] text-charcoal/60 py-[0.38rem] pr-3 whitespace-nowrap">{row.gw}</td>
            <td className="font-mono text-[0.68rem] text-charcoal/55 py-[0.38rem] pr-3">{row.term}</td>
            <td className="font-mono text-[0.68rem] text-charcoal/55 py-[0.38rem] pr-3 whitespace-nowrap">{row.announced}</td>
            <td className="py-[0.38rem]">
              <a
                href={row.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.6rem] tracking-[0.1em] uppercase transition-colors"
                style={{ color: 'rgba(0,0,0,0.25)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6B8E7F')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.25)')}
                aria-label={`Source for ${row.lab} ${row.provider} deal`}
              >
                ↗
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MobileCards({ rows }: { rows: AiComputeRow[] }) {
  return (
    <div className="md:hidden space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-mono text-[0.75rem] font-medium text-charcoal/80">{row.lab}</span>
            <span className="font-mono text-[0.72rem] font-medium" style={{ color: '#6B8E7F' }}>{row.amount}</span>
          </div>
          <p className="font-mono text-[0.65rem] text-charcoal/55 mb-1">{row.provider}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="font-mono text-[0.62rem] text-charcoal/45">{row.gw}</span>
            <span className="font-mono text-[0.62rem] text-charcoal/35">·</span>
            <span className="font-mono text-[0.62rem] text-charcoal/45">{row.term}</span>
            <span className="font-mono text-[0.62rem] text-charcoal/35">·</span>
            <span className="font-mono text-[0.62rem] text-charcoal/45">{row.announced}</span>
            <a
              href={row.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[0.62rem] transition-colors"
              style={{ color: 'rgba(0,0,0,0.25)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6B8E7F')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.25)')}
              aria-label="Source"
            >
              ↗ source
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AIComputeCommitments() {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cached = loadCachedAnalysis()
    if (cached) {
      setAnalysis(cached)
      setLoading(false)
      return
    }

    fetch('/api/ai-compute-brief')
      .then(r => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json()
      })
      .then(json => {
        const text = json.analysis as string | null
        setAnalysis(text || FALLBACK)
        if (text) saveCachedAnalysis(text)
      })
      .catch(() => {
        setError(true)
        setAnalysis(FALLBACK)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      {/* Section label — matches existing pattern exactly */}
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
        AI Compute Commitments
      </h2>

      {/* Headline number */}
      <div className="mb-3">
        <p
          className="font-serif font-medium leading-tight"
          style={{ fontSize: 'clamp(1.35rem, 3vw, 1.85rem)', color: '#191714' }}
        >
          $700B+
        </p>
        <p className="font-mono text-[0.65rem] tracking-[0.06em] text-charcoal/50 mt-0.5">
          committed across major AI compute deals in the past 18 months · ~25 GW locked capacity
        </p>
      </div>

      {/* Lumen analysis line */}
      <div className="mb-5">
        {loading ? (
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="block w-1 h-1 rounded-full animate-pulse"
                style={{ background: '#6B8E7F', animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        ) : (
          <p
            className="font-serif italic text-[0.82rem] leading-relaxed"
            style={{ color: error ? '#6B8E7F' : '#6B8E7F' }}
          >
            {analysis}
          </p>
        )}
      </div>

      {/* Table — desktop */}
      <DesktopTable rows={aiComputeData} />

      {/* Cards — mobile */}
      <MobileCards rows={aiComputeData} />
    </section>
  )
}
