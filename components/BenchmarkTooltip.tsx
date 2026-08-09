'use client'

interface Props {
  source: string
  sourceUrl?: string
  sourceLinks?: { label: string; url: string }[]
  lastUpdated: string
  isLive?: boolean
}

function formatDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return new Date(`${raw}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return raw
}

export default function BenchmarkTooltip({ source, sourceUrl, sourceLinks, lastUpdated, isLive }: Props) {
  const updatedLabel = isLive ? lastUpdated : `Updated ${formatDate(lastUpdated)}`
  return (
    <details className="relative inline-flex align-middle group">
      <summary className="list-none cursor-pointer rounded-sm inline-flex min-h-6 min-w-6 items-center justify-center font-mono text-[0.62rem] text-charcoal/45 hover:text-charcoal/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-sage" aria-label="Open source information">ⓘ</summary>
      <span className="fixed inset-x-4 bottom-4 z-50 block w-auto max-w-none rounded-sm bg-charcoal px-3 py-2 text-left shadow-md sm:absolute sm:inset-x-auto sm:bottom-full sm:right-0 sm:mb-2 sm:w-64 sm:max-w-[80vw]">
        <span className={`block font-mono text-[0.64rem] mb-1 ${isLive ? 'text-sage' : 'text-white/70'}`}>{isLive ? `Live · ${updatedLabel}` : updatedLabel}</span>
        {sourceLinks ? sourceLinks.map(item => <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" className="block font-mono text-[0.68rem] leading-relaxed text-white/85 underline underline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">{item.label}</a>) : sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block font-mono text-[0.68rem] leading-relaxed text-white/85 underline underline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">{source}</a> : <span className="block font-mono text-[0.68rem] leading-relaxed text-white/85">{source}</span>}
      </span>
    </details>
  )
}
