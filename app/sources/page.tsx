import { BENCHMARKS } from '@/lib/industryBenchmarks'
import { BASKETS } from '@/lib/liveMultiples'
import { aiComputeData } from '@/lib/aiCompute'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Methodology & Sources — Market Tape | Cloud & Capital',
  description: 'How Market Tape calculates and presents market signals, plus the primary sources behind its benchmarks and AI compute tracker.',
}

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
            Methodology &amp; Sources
          </h1>
          <p className="font-mono text-[0.72rem] text-charcoal/50 mt-2 leading-relaxed">
            Market Tape is strategic decision support for technology-finance review. It connects public-market conditions,
            cloud benchmarks, and major AI infrastructure announcements without turning them into individualized investment
            advice or workload-level operating mandates.
          </p>
        </header>

        <SectionTitle>Methodology at a Glance</SectionTitle>

        <div className="space-y-4 font-mono text-[0.7rem] text-charcoal/60 leading-relaxed">
          <p>
            The <span className="text-charcoal/80">tracked universe</span>{' '}is the set of instruments published across the
            dashboard&apos;s market, macro, sector, and global views. The broader <span className="text-charcoal/80">screened
            universe</span> supplies the momentum leaderboard; only its five leaders and five laggards are displayed.
          </p>
          <p>
            The upstream pipeline is scheduled to check for new data every 30 minutes during its weekday window, though GitHub Actions may delay or skip scheduled runs. On weekends and market holidays, the timestamp identifies the latest
            completed US trading session—not the page view, build, or deployment time.
          </p>
          <p>
            The 0–100 exposure score combines trend, breadth, momentum, volatility, and risk inputs from the upstream pipeline.
            Lower readings are Defensive, 40–60 is Hold/Neutral, and higher readings are Risk-On. These bands frame review
            priorities; they do not prescribe a portfolio allocation or cloud purchase.
          </p>
        </div>

        <SectionTitle>Signal Definitions</SectionTitle>

        <dl className="space-y-4 font-mono text-[0.68rem] leading-relaxed">
          <div>
            <dt className="tracking-[0.08em] uppercase text-charcoal/45">Trends</dt>
            <dd className="text-charcoal/60">Long-, intermediate-, and short-term directional regimes calculated by the upstream market pipeline; they describe observed price direction, not forecasts.</dd>
          </div>
          <div>
            <dt className="tracking-[0.08em] uppercase text-charcoal/45">Breadth</dt>
            <dd className="text-charcoal/60">The share of tracked instruments trading above their 20-day and 50-day moving averages.</dd>
          </div>
          <div>
            <dt className="tracking-[0.08em] uppercase text-charcoal/45">Relative strength</dt>
            <dd className="text-charcoal/60">One-month performance relative to SPY. Positive values indicate outperformance; negative values indicate underperformance.</dd>
          </div>
          <div>
            <dt className="tracking-[0.08em] uppercase text-charcoal/45">Grades</dt>
            <dd className="text-charcoal/60">A, B, and C summarize relative trend strength in the source pipeline: A is strongest, B is intermediate, and C is weakest.</dd>
          </div>
        </dl>

        {/* ── LIVE MARKET DATA ─────────────────────────────────────────── */}
        <SectionTitle>Live Market Data</SectionTitle>

        <p className="font-mono text-[0.7rem] text-charcoal/55 leading-relaxed mb-5">
          Prices, momentum scores, sector rotation, and macro indicators are fetched from{' '}
          <span className="text-charcoal/80">yFinance</span> via a data pipeline scheduled to check every 30 minutes during weekday market hours
          and publishes to{' '}
          <a
            href="https://github.com/cloudandcapital/market-tape"
            target="_blank" rel="noopener noreferrer"
            className="underline text-charcoal/60 hover:text-charcoal transition-colors"
          >
            github.com/cloudandcapital/market-tape
          </a>
          . Pipeline runs may publish a timestamp-only snapshot commit even when market values are unchanged. The frontend revalidates against the latest published snapshot every 30 minutes.
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
          This major-deal tracker is compiled manually from public announcements and press releases.
          Each row is sourced and classified individually: <span className="text-charcoal/75">Signed</span> means an
          executed agreement is confirmed; <span className="text-charcoal/75">Announced</span> means the parties publicly
          described a deal or partnership without equivalent confirmation of execution; <span className="text-charcoal/75">Target</span>{' '}
          means a planned capacity or investment goal; and <span className="text-charcoal/75">Reported / in talks</span> means
          a negotiation or third-party report that is not a completed commitment. Dollar values and capacity are not aggregated
          across unlike statuses or agreement types. The signed-dollar headline includes only structured, company-disclosed,
          comparable signed compute/cloud-service values; equity and reported or estimated figures are excluded. The data is static until a material update —
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
            <div key={i} className="flex flex-col items-start gap-2 py-2 sm:flex-row sm:justify-between sm:gap-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="min-w-0 max-w-full">
                <p className="font-mono text-[0.68rem] font-medium text-charcoal/80">
                  {row.buyer} — {row.provider}
                </p>
                <p className="font-mono text-[0.6rem] text-charcoal/45">
                  {row.status} · {row.agreementType} · value: {row.amount} ({row.amountBasis}) · capacity: {row.capacity} ({row.capacityBasis}) · {row.term} · announced {row.announced}
                </p>
                {row.notes && (
                  <p className="font-mono text-[0.58rem] text-charcoal/35 italic mt-0.5 leading-relaxed">
                    {row.notes}
                  </p>
                )}
              </div>
              <div className="flex min-w-0 max-w-full flex-col items-start mt-0.5 sm:flex-shrink-0 sm:items-end">
                {row.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="max-w-full break-words font-mono text-[0.58rem] tracking-[0.08em] uppercase transition-colors text-charcoal/30 hover:text-charcoal/60 sm:text-right [overflow-wrap:anywhere]">{source.label} · {source.kind} ↗</a>)}
              </div>
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
          . Each entry records its last update, next review date, and review cadence. The automated freshness check warns
          within 14 days of a due date and fails once a benchmark is overdue. Run{' '}
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
                {'sourceLinks' in bm && bm.sourceLinks ? (
                  <div>{bm.sourceLinks.map((source: { label: string; url: string }) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="block font-mono text-[0.62rem] text-charcoal/50 hover:text-charcoal/75 underline transition-colors">{source.label}</a>)}</div>
                ) : bm.sourceUrl ? (
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

        <SectionTitle>Lumen Synthesis &amp; Limitations</SectionTitle>

        <div className="space-y-4 font-mono text-[0.7rem] text-charcoal/60 leading-relaxed">
          <p>
            Lumen is an AI-generated synthesis of the market data and sourced benchmarks displayed on Market Tape. Its role is
            to surface relationships and review priorities, not to create new facts. Completed analysis is shared within the
            market-data refresh window so visitors see a consistent reading of the same snapshot.
          </p>
          <p>
            Market Tape provides strategic context, not individualized investment, financial, tax, procurement, or workload
            advice. Organization-specific decisions still require workload demand, utilization, contract terms, risk tolerance,
            and business priorities. Data may be delayed, revised, approximate, or temporarily unavailable; follow the linked
            primary sources before acting on a benchmark or announcement.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-14 pt-5 border-t border-charcoal/8">
          <p className="font-mono text-[0.58rem] text-charcoal/30">
            <Link href="/" className="hover:text-charcoal/55 transition-colors">← Back to Market Tape</Link>
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
