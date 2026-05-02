import { BENCHMARKS } from '@/lib/industryBenchmarks'
import { BASKETS } from '@/lib/liveMultiples'
import { aiComputeData } from '@/lib/aiCompute'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Sources — Market Tape | Cloud & Capital',
  description: 'Every data source behind Market Tape: live market data, AI compute commitments, and manually-maintained industry benchmarks.',
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[0.6rem] tracking-[0.22em] uppercase text-charcoal/40 mb-4 mt-10 first:mt-0">
      {children}
    </h2>
  )
}

function Divider() {
  return <hr className="border-charcoal/8 my-8" />
}

export default function SourcesPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-6 py-10 md:px-10 md:py-14">

        {/* Header */}
        <header className="mb-10">
          <p className="font-mono text-[0.55rem] tracking-[0.22em] uppercase text-charcoal/35 mb-1">Cloud &amp; Capital · Market Tape</p>
          <h1 className="font-serif font-medium" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: '#191714', lineHeight: 1.15 }}>
            Data Sources
          </h1>
          <p className="font-mono text-[0.72rem] text-charcoal/50 mt-2 leading-relaxed">
            Every number on Market Tape comes from one of three layers: live market data refreshed every 30 minutes,
            manually-maintained benchmarks updated on a scheduled cadence, or public announcements compiled by hand.
            This page documents all of them.
          </p>
        </header>

        {/* ── LIVE MARKET DATA ─────────────────────────────────────────── */}
        <SectionTitle>Live Market Data</SectionTitle>

        <p className="font-mono text-[0.7rem] text-charcoal/55 leading-relaxed mb-5">
          Prices, momentum scores, sector rotation, and macro indicators are fetched from{' '}
          <span className="text-charcoal/80">yFinance</span> via a data pipeline that runs every 30 minutes
          and publishes to{' '}
          <a
            href="https://github.com/cloudandcapital/market-tape"
            target="_blank" rel="noopener noreferrer"
            className="underline text-charcoal/60 hover:text-charcoal transition-colors"
          >
            github.com/cloudandcapital/market-tape
          </a>
          . The frontend revalidates against that source every 30 minutes.
        </p>

        <div className="space-y-4">

          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.1em] uppercase text-charcoal/35 mb-1.5">Macro &amp; Market Internals</p>
            <p className="font-mono text-[0.68rem] text-charcoal/60">
              SPY, ^VIX, TLT, HYG, GLD, USO, IWM, QQQ, DXY — prices, 1M relative strength, trend grades, breadth metrics
            </p>
          </div>

          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.1em] uppercase text-charcoal/35 mb-1.5">US Sector ETFs</p>
            <p className="font-mono text-[0.68rem] text-charcoal/60">
              XLK, XLF, XLV, XLE, XLI, XLY, XLP, XLU, XLB, XLRE, XLC — ranked by 1-month relative strength vs SPY
            </p>
          </div>

          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.1em] uppercase text-charcoal/35 mb-1.5">Valuation Multiples (live approximations)</p>
            <p className="font-mono text-[0.68rem] text-charcoal/60 mb-2">
              Approximate NTM P/S computed as: TTM P/S ÷ (1 + trailing revenue growth).
              Equal-weighted median across each basket. Labeled with ~ to communicate approximation.
              Sourced from Yahoo Finance with the same 30-minute cache as the rest of the pipeline.
            </p>
            <div className="space-y-2 pl-3" style={{ borderLeft: '2px solid rgba(0,0,0,0.08)' }}>
              {Object.entries(BASKETS).map(([key, basket]) => (
                <div key={key}>
                  <p className="font-mono text-[0.62rem] font-medium text-charcoal/70">{basket.label}</p>
                  <p className="font-mono text-[0.62rem] text-charcoal/45">
                    {basket.tickers.join(' · ')}
                  </p>
                  <p className="font-mono text-[0.58rem] text-charcoal/35 italic">{basket.note}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        <Divider />

        {/* ── AI COMPUTE COMMITMENTS ───────────────────────────────────── */}
        <SectionTitle>AI Compute Commitments</SectionTitle>

        <p className="font-mono text-[0.7rem] text-charcoal/55 leading-relaxed mb-5">
          The $750B+ commitment table is compiled manually from public announcements and press releases.
          Each row is sourced individually. The data is static until a new deal is announced —
          source code at{' '}
          <a
            href="https://github.com/cloudandcapital/market-tape-app/blob/main/lib/aiCompute.ts"
            target="_blank" rel="noopener noreferrer"
            className="underline text-charcoal/60 hover:text-charcoal transition-colors"
          >
            lib/aiCompute.ts
          </a>
          .
        </p>

        <div className="space-y-3">
          {aiComputeData.map((row, i) => (
            <div key={i} className="flex items-start justify-between gap-4 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="min-w-0">
                <p className="font-mono text-[0.68rem] font-medium text-charcoal/80">
                  {row.lab} — {row.provider}
                </p>
                <p className="font-mono text-[0.6rem] text-charcoal/45">
                  {row.amount} · {row.gw} · {row.term} · announced {row.announced}
                </p>
              </div>
              <a
                href={row.sourceUrl}
                target="_blank" rel="noopener noreferrer"
                className="font-mono text-[0.58rem] tracking-[0.1em] uppercase flex-shrink-0 mt-0.5 transition-colors text-charcoal/30 hover:text-charcoal/60"
              >
                source ↗
              </a>
            </div>
          ))}
        </div>

        <Divider />

        {/* ── INDUSTRY BENCHMARKS ──────────────────────────────────────── */}
        <SectionTitle>Industry Benchmarks</SectionTitle>

        <p className="font-mono text-[0.7rem] text-charcoal/55 leading-relaxed mb-5">
          Slow-moving external statistics maintained manually in{' '}
          <a
            href="https://github.com/cloudandcapital/market-tape-app/blob/main/lib/industryBenchmarks.ts"
            target="_blank" rel="noopener noreferrer"
            className="underline text-charcoal/60 hover:text-charcoal transition-colors"
          >
            lib/industryBenchmarks.ts
          </a>
          . Each entry has a review cadence. Run{' '}
          <code className="font-mono text-[0.65rem] bg-charcoal/6 px-1 py-0.5 rounded-sm">npm run check-benchmarks</code>
          {' '}to see current freshness status.
        </p>

        <div className="space-y-5">
          {Object.entries(BENCHMARKS).map(([key, bm]) => (
            <div key={key} className="py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="font-mono text-[0.62rem] tracking-[0.08em] text-charcoal/40">{key}</span>
                <span className="font-mono text-[0.72rem] font-medium text-charcoal/85">{bm.value}</span>
              </div>
              <div className="space-y-0.5">
                {bm.sourceUrl ? (
                  <a
                    href={bm.sourceUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="block font-mono text-[0.62rem] text-charcoal/50 hover:text-charcoal/75 underline transition-colors"
                  >
                    {bm.source}
                  </a>
                ) : (
                  <p className="font-mono text-[0.62rem] text-charcoal/50">{bm.source}</p>
                )}
                <p className="font-mono text-[0.58rem] text-charcoal/35">
                  Updated {formatDate(bm.lastUpdated)} · Next review {formatDate(bm.nextReviewDue)} · {bm.reviewCadence}
                </p>
                <p className="font-mono text-[0.6rem] text-charcoal/40 italic leading-relaxed">{bm.notes}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-14 pt-5 border-t border-charcoal/8">
          <p className="font-mono text-[0.58rem] text-charcoal/30">
            <a href="/" className="hover:text-charcoal/55 transition-colors">← Back to Market Tape</a>
            {' · '}
            <a
              href="https://github.com/cloudandcapital/market-tape-app"
              target="_blank" rel="noopener noreferrer"
              className="hover:text-charcoal/55 transition-colors"
            >
              View source on GitHub ↗
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
