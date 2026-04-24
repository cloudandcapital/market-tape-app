'use client'

import { useEffect, useState } from 'react'

function stripHeading(text: string): string {
  return text.replace(/^#{1,6}\s+[^\n]*\n\n?/, '').trim()
}

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-white">{part}</strong> : part
  )
}

export default function MorningBrief() {
  const [brief, setBrief] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/morning-brief')
      .then(r => r.json())
      .then(data => {
        if (data.brief) setBrief(stripHeading(data.brief))
        else setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <section className="bg-ink mb-10">

      {/* Metadata bar */}
      <div className="flex items-center justify-between px-8 py-[0.85rem]"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.57rem] tracking-[0.22em] uppercase text-sage">
            Market Snapshot
          </span>
          <span className="font-mono text-[0.57rem] text-white/20">·</span>
          <span className="font-mono text-[0.57rem] tracking-[0.1em] text-white/30">
            {dateLabel}
          </span>
        </div>
        <span className="font-mono text-[0.52rem] tracking-[0.1em] uppercase text-white/20">
          Claude&apos;s Brief
        </span>
      </div>

      {/* Brief content with left accent */}
      <div className="px-8 py-7">
        <div className="pl-5" style={{ borderLeft: '2px solid #6B8E7F' }}>

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="block w-1.5 h-1.5 rounded-full bg-sage animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <p className="font-mono text-[0.78rem] text-white/35">Analyzing market conditions…</p>
            </div>
          )}

          {error && !loading && (
            <p className="font-mono text-[0.78rem] text-white/35">
              Brief unavailable — market data may still be loading.
            </p>
          )}

          {brief && !loading && (
            <div className="space-y-[1.1rem] max-w-2xl">
              {brief.split('\n\n').filter(Boolean).map((para, i) => (
                <p
                  key={i}
                  className="leading-[1.8]"
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: i === 0 ? '1.08rem' : '0.95rem',
                    color: i === 0 ? 'rgba(244,239,230,0.95)' : 'rgba(244,239,230,0.62)',
                    fontWeight: i === 0 ? 400 : 300,
                  }}
                >
                  {parseInline(para)}
                </p>
              ))}
            </div>
          )}

        </div>
      </div>

    </section>
  )
}
