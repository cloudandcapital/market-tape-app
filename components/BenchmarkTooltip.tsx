'use client'

interface Props {
  source: string
  sourceUrl?: string
  lastUpdated: string
  isLive?: boolean
}

function formatDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return new Date(`${raw}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return raw
}

export default function BenchmarkTooltip({ source, sourceUrl, lastUpdated, isLive }: Props) {
  const updatedLabel = isLive ? lastUpdated : `Updated ${formatDate(lastUpdated)}`
  return (
    <details className="relative inline-block align-middle ml-1 group">
      <summary className="list-none cursor-pointer rounded-sm font-mono text-[0.62rem] text-charcoal/35 hover:text-charcoal/65 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-sage" aria-label="Open source information">ⓘ</summary>
      <span className="absolute z-50 bottom-full right-0 mb-2 block w-64 max-w-[80vw] rounded-sm bg-charcoal px-3 py-2 text-left shadow-md">
        <span className={`block font-mono text-[0.62rem] mb-1 ${isLive ? 'text-sage' : 'text-white/55'}`}>{isLive ? `Live · ${updatedLabel}` : updatedLabel}</span>
        {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block font-mono text-[0.65rem] leading-relaxed text-white/75 underline underline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">{source}</a> : <span className="block font-mono text-[0.65rem] leading-relaxed text-white/75">{source}</span>}
      </span>
    </details>
  )
}
