'use client'

import { useEffect, useState } from 'react'

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
    <section className="bg-ink rounded-none px-8 py-8 mb-10">
      <div className="flex items-center gap-3 mb-5">
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
          Brief unavailable — check your ANTHROPIC_API_KEY.
        </p>
      )}

      {brief && !loading && (
        <div className="space-y-4">
          {brief.split('\n\n').filter(Boolean).map((para, i) => (
            <p
              key={i}
              className={`leading-relaxed ${
                i === 0
                  ? 'text-white font-serif text-lg'
                  : 'text-white/70 text-sm font-sans'
              }`}
            >
              {para}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}
