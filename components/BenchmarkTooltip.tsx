'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

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
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const contentRef = useRef<HTMLSpanElement>(null)

  function positionPopover() {
    const details = detailsRef.current
    const content = contentRef.current
    if (!details?.open || !content) return
    if (window.innerWidth < 640) {
      Object.assign(content.style, { left: '16px', right: '16px', top: 'auto', bottom: '16px' })
      return
    }
    const anchor = details.querySelector('summary')!.getBoundingClientRect()
    const { width, height } = content.getBoundingClientRect()
    const left = Math.max(16, Math.min(anchor.right - width, window.innerWidth - width - 16))
    const above = anchor.top - height - 8
    const top = above >= 16 ? above : Math.max(16, Math.min(anchor.bottom + 8, window.innerHeight - height - 16))
    Object.assign(content.style, { left: `${left}px`, right: 'auto', top: `${top}px`, bottom: 'auto' })
  }

  useEffect(() => {
    window.addEventListener('resize', positionPopover)
    window.addEventListener('scroll', positionPopover, { passive: true, capture: true })
    return () => {
      window.removeEventListener('resize', positionPopover)
      window.removeEventListener('scroll', positionPopover, true)
    }
  }, [])

  return (
    <details ref={detailsRef} onToggle={positionPopover} className="relative inline-flex align-middle group">
      <summary className="tape-source-toggle list-none cursor-pointer rounded-sm inline-flex min-h-6 min-w-6 items-center justify-center font-mono text-sm text-charcoal/65 hover:text-charcoal/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-sage" aria-label="Open source information"><Image src="/icons/info.svg" width={18} height={18} alt="" /></summary>
      <span ref={contentRef} className="tape-source-popover fixed inset-x-4 bottom-4 z-50 block w-auto max-w-none overflow-y-auto rounded-sm px-3 py-2 text-left shadow-md sm:inset-x-auto sm:bottom-auto sm:w-64 sm:max-w-[80vw]" style={{ background: 'var(--theme-deep, #24211e)', maxHeight: 'calc(100dvh - 32px)' }}>
        <span className={`block font-mono text-sm mb-1 ${isLive ? 'text-sage-light' : 'text-white/70'}`}>{isLive ? `Live · ${updatedLabel}` : updatedLabel}</span>
        {sourceLinks ? sourceLinks.map(item => <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" className="block min-h-8 py-1 font-mono text-sm leading-relaxed text-white/85 underline underline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">{item.label}</a>) : sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block min-h-8 py-1 font-mono text-sm leading-relaxed text-white/85 underline underline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">{source}</a> : <span className="block font-mono text-sm leading-relaxed text-white/85">{source}</span>}
      </span>
    </details>
  )
}
