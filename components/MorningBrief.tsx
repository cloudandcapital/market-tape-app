'use client'

import { useEffect, useState } from 'react'

function stripHeading(text: string): string {
  return text.replace(/^#{1,6}\s+[^\n]*\n\n?/, '').trim()
}

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ fontWeight: 600, color: '#191714' }}>{part}</strong>
      : part
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
    <div className="px-5 py-4" style={{ background: '#fff' }}>

      {/* Label */}
      <p className="font-mono text-[0.46rem] tracking-[0.22em] uppercase mb-3" style={{ color: '#6B8E7F' }}>
        Morning Brief
      </p>

      {/* Accent + content */}
      <div className="pl-3.5" style={{ borderLeft: '2px solid #6B8E7F' }}>

        {loading && (
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="block w-1 h-1 rounded-full animate-pulse"
                  style={{ background: '#6B8E7F', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="font-mono text-[0.7rem]" style={{ color: '#aaa' }}>
              Analyzing market conditions…
            </p>
          </div>
        )}

        {error && !loading && (
          <p className="font-mono text-[0.7rem]" style={{ color: '#bbb' }}>
            Brief unavailable — market data may still be loading.
          </p>
        )}

        {brief && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {brief.split('\n\n').filter(Boolean).map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: i === 0 ? '0.93rem' : '0.87rem',
                  lineHeight: 1.6,
                  color: i === 0 ? '#191714' : '#3a3a3a',
                  fontWeight: i === 0 ? 400 : 300,
                  margin: 0,
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
