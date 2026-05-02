'use client'

import { useState } from 'react'

interface Props {
  source: string
  sourceUrl?: string
  lastUpdated: string   // YYYY-MM-DD or free-form (e.g. "updates every 30 min")
  isLive?: boolean      // true = live data badge instead of static date
}

function formatDate(raw: string): string {
  // If it looks like a date, format as "MMM YYYY"
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(raw).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return raw
}

export default function BenchmarkTooltip({ source, sourceUrl, lastUpdated, isLive }: Props) {
  const [visible, setVisible] = useState(false)

  const updatedLabel = isLive ? lastUpdated : `Updated ${formatDate(lastUpdated)}`

  return (
    <span
      className="relative inline-block align-middle ml-1"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {/* Info icon */}
      <span
        className="font-mono text-[0.52rem] select-none cursor-default"
        style={{ color: 'rgba(0,0,0,0.22)', lineHeight: 1 }}
        role="img"
        aria-label="source information"
        tabIndex={0}
      >
        ⓘ
      </span>

      {/* Tooltip */}
      {visible && (
        <span
          className="absolute z-50 bottom-full left-1/2 mb-1.5 pointer-events-none"
          style={{ transform: 'translateX(-50%)' }}
        >
          <span
            className="block whitespace-nowrap font-mono text-[0.58rem] leading-relaxed px-2.5 py-1.5 rounded-sm shadow-sm"
            style={{
              background: '#191714',
              color: 'rgba(255,255,255,0.75)',
              minWidth: '160px',
              maxWidth: '260px',
              whiteSpace: 'normal',
            }}
          >
            {isLive ? (
              <span style={{ color: '#6B8E7F' }}>Live · {updatedLabel}</span>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>{updatedLabel}</span>
            )}
            <br />
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto"
                style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'underline' }}
              >
                {source}
              </a>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{source}</span>
            )}
          </span>
          {/* Arrow */}
          <span
            className="block mx-auto"
            style={{
              width: 0, height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid #191714',
            }}
          />
        </span>
      )}
    </span>
  )
}
