import type { Meta, Snapshot } from './types'

const BASE = 'https://raw.githubusercontent.com/cloudandcapital/market-tape/main/data'

export async function fetchMeta(): Promise<Meta> {
  const res = await fetch(`${BASE}/meta.json`, { next: { revalidate: 1800 } })
  if (!res.ok) throw new Error('Failed to fetch meta.json')
  return res.json()
}

export async function fetchSnapshot(): Promise<Snapshot> {
  const res = await fetch(`${BASE}/snapshot.json`, { next: { revalidate: 1800 } })
  if (!res.ok) throw new Error('Failed to fetch snapshot.json')
  return res.json()
}

export function sparklineUrl(ticker: string): string {
  const filename = ticker.replace('^', 'INDEX_').replace(/[^A-Za-z0-9._-]/g, '_')
  return `${BASE}/mini_rs/${filename}.png`
}

export function pctColor(pct: number): string {
  if (pct > 0) return 'text-sage'
  if (pct < 0) return 'text-loss'
  return 'text-charcoal/50'
}

export function pctLabel(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

export function gradeColor(grade: string): string {
  if (grade === 'A') return 'text-sage font-semibold'
  if (grade === 'C') return 'text-loss'
  return 'text-charcoal/50'
}

export function guidanceColor(g: string): string {
  if (g === 'Risk-On') return 'text-sage'
  if (g === 'Defensive') return 'text-loss'
  return 'text-charcoal'
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
}
