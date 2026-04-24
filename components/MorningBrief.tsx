'use client'

import { useEffect, useState } from 'react'

function stripHeading(text: string): string {
  return text.replace(/^#{1,6}\s+[^\n]*\n\n?/, '').trim()
}

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold" style={{ color: 'rgba(244,239,230,0.95)' }}>{part}</strong> : part
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

  return (
    <div className="px-8 py-7" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="pl-5" style={{ borderLeft: '2px solid #6B8E7F' }}>

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="block w-1.5 h-1.5 rounded-full bg-sage animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="font-mono text-[0.78rem]" style={{ color: 'rgba(244,239,230,0.35)' }}>
              Analyzing market conditions…
            </p>
          </div>
        )}

        {error && !loading && (
          <p className="font-mono text-[0.78rem]" style={{ color: 'rgba(244,239,230,0.35)' }}>
            Brief unavailable — market data may still be loading.
          </p>
        )}

        {brief && !loading && (
          <div className="space-y-[1.1rem]">
            {brief.split('\n\n').filter(Boolean).map((para, i) => (
              <p
                key={i}
                className="leading-[1.8]"
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: i === 0 ? '1.06rem' : '0.93rem',
                  color: i === 0 ? 'rgba(244,239,230,0.93)' : 'rgba(244,239,230,0.58)',
                  fontWeight: 400,
                }}
              >
                {parseInline(para)}
              </p>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
