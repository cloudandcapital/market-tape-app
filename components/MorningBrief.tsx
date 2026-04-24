'use client'

import { useEffect, useState } from 'react'

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
        if (data.brief) setBrief(data.brief)
        else setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-ink px-8 py-9 mb-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-sage">
          Claude&apos;s Morning Brief
        </span>
        <span className="text-[10px] font-mono text-white/20">·</span>
        <span className="text-[10px] font-mono tracking-[0.12em] uppercase text-white/30">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

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
          <p className="text-white/40 text-sm font-mono">Analyzing market conditions…</p>
        </div>
      )}

      {error && !loading && (
        <p className="text-white/40 text-sm font-mono">
          Brief unavailable — market data may still be loading.
        </p>
      )}

      {brief && !loading && (
        <div className="space-y-5 max-w-2xl">
          {brief.split('\n\n').filter(Boolean).map((para, i) => (
            <p
              key={i}
              className={`leading-[1.75] ${
                i === 0
                  ? 'font-serif text-[1.15rem] text-white/95'
                  : 'font-serif text-[1rem] text-white/70'
              }`}
            >
              {parseInline(para)}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}
