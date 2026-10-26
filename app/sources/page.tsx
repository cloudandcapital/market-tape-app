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
    <h2 className="font-mono text-[0.72rem] tracking-[0.22em] uppercase text-charcoal/65 mb-4 mt-10 first:mt-0">
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
          <p className="font-mono text-[0.72rem] tracking-[0.22em] uppercase text-charcoal/65 mb-1">Cloud &amp; Capital · Market Tape</p>
          <h1 className="font-serif font-medium" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: 'var(--theme-ink, #191714)', lineHeight: 1.15 }}>
            Methodology &amp; Sources
          </h1>
          <p className="font-mono text-[0.72rem] text-charcoal/65 mt-2 leading-relaxed">
            Market Tape is strategic decision support for technology-finance review. It connects public-market conditions,
            cloud benchmarks, and major AI infrastructure announcements without turning them into individualized investment
            advice or workload-level operating mandates.
          </p>
        </header>

        <SectionTitle>Methodology at a Glance</SectionTitle>

        <div className="space-y-4 font-mono text-[0.72rem] text-charcoal/65 leading-relaxed">
          <p>
            The <span className="text-charcoal/80">tracked universe</span>{' '}contains 48 unique instruments in seven source groups (52 source rows because four tickers repeat). The dashboard highlights selected instruments; expand “All 48 tracked instruments” to see each ticker once with 1-, 5-, and 20-session price changes. Repeated tickers count once. The broader <span className="text-charcoal/80">screened
            universe</span> supplies the momentum leaderboard; only its five leaders and five laggards are displayed.
          </p>
          <p>
            The upstream pipeline is scheduled to check for new data every 30 minutes during its weekday window, though GitHub Actions may delay or skip scheduled runs. On weekends and market holidays, the timestamp identifies the price date recorded on the underlying daily bars. The page shows that date separately from the pipeline publication time. Daily bars can still change during a trading session; a scheduled run is not a live quote feed.
          </p>
          <p>
            Equity ETF breadth is the rounded percentage of the 34 classified equity ETFs with a positive RS1M score. SPY is excluded because it is the benchmark and has a zero score by definition. Bonds, volatility indices, yields, currencies, and commodity funds stay outside this calculation. The count appears beside the score. Below 40 is the Lower band, 40–69 the Middle band, and 70 or above the Upper band. These are descriptive ranges, not portfolio or purchasing instructions. The legacy mixed-basket status fields in the raw pipeline metadata are validated for source integrity but do not supply the displayed equity summaries.
          </p>
        </div>

        <SectionTitle>Signal Definitions</SectionTitle>

        <dl className="space-y-4 font-mono text-[0.72rem] leading-relaxed">
          <div>
            <dt className="tracking-[0.08em] uppercase text-charcoal/65">Trends</dt>
            <dd className="text-charcoal/65">The median 20-, 5-, and 1-session price return across those same 34 equity ETFs. Up requires a return above 2%, 1%, and 0.5%, respectively; Down requires a return below −1%, −0.5%, and −0.5%. Values on or between those boundaries are Sideways. These are dashboard rules, not calibrated forecasts.</dd>
          </div>
          <div>
            <dt className="tracking-[0.08em] uppercase text-charcoal/65">Breadth</dt>
            <dd className="text-charcoal/65">The share of those 34 equity ETFs above their 20- and 50-session simple moving averages, not the share of all US stocks. The basket includes US sector, style, size, infrastructure, real-estate, and global equity funds. A 50-session share of at least 60% is Strong, 40%–59.99% is Mixed, and below 40% is Weak.</dd>
          </div>
          <div>
            <dt className="tracking-[0.08em] uppercase text-charcoal/65">Relative strength</dt>
            <dd className="text-charcoal/65">RS1M is a dimensionless, volatility-adjusted score: (the instrument’s 20-session price return minus SPY’s 20-session price return) divided by the instrument’s standard deviation of daily returns over those sessions, multiplied by the square root of 20. The division is by that entire volatility term. Positive scores mean outperformance versus SPY; negative scores mean underperformance. A score of +1.2 does not mean +1.2%. Rankings compare scores, not raw percentage returns. Prices use unadjusted Close, so these are price-return measures, not dividend-reinvested total returns.</dd>
          </div>
          <div>
            <dt className="tracking-[0.08em] uppercase text-charcoal/65">Grades</dt>
            <dd className="text-charcoal/65">A: the 10-session exponential moving average is above the 20-session exponential average, both are above the 50-session simple average, and price is above the 50-session average. C: the 10-session exponential average is below the 20-session exponential average and price is below the 50-session average. Otherwise B. These summarize price trends, not business quality or a buy/sell rating.</dd>
          </div>
        </dl>

        <p className="font-mono text-xs text-charcoal/65 mt-4 leading-relaxed">Risk Environment also uses this equity basket: sentiment is Bullish when more than 60% have a positive open-to-latest move, Bearish below 40%, and Neutral otherwise. Momentum compares the counts of A and C trend grades. VIX at or below 15 is Low, above 22 is High, and otherwise Neutral. Momentum Env combines 50 times the 50-session participation fraction, 25 times the positive daily-move fraction, and a VIX contribution of 25, 10, or 0 for Low, Neutral, or High. The rounded score is Momentum-Friendly at 70+, Selective at 45–69, and Choppy below 45. These are descriptive dashboard rules, not tested trading forecasts.</p>

        {/* ── LIVE MARKET DATA ─────────────────────────────────────────── */}
        <SectionTitle>Scheduled market snapshots</SectionTitle>

        <p className="font-mono text-[0.72rem] text-charcoal/65 leading-relaxed mb-5">
          Prices, momentum scores, sector rotation, and macro indicators are fetched from{' '}
          <span className="text-charcoal/80">yFinance</span> via a data pipeline scheduled to check every 30 minutes during weekday market hours
          and publishes to{' '}
          <a
            href="https://github.com/cloudandcapital/market-tape"
            target="_blank" rel="noopener noreferrer"
            className="underline text-charcoal/65 hover:text-charcoal transition-colors"
          >
            github.com/cloudandcapital/market-tape
          </a>
          . Pipeline runs may publish a timestamp-only snapshot commit even when market values are unchanged. The frontend revalidates against the latest published snapshot every 30 minutes.
        </p>

        <div className="space-y-4">

          <div>
            <p className="font-mono text-[0.72rem] tracking-[0.1em] uppercase text-charcoal/65 mb-1.5">Macro &amp; Market Internals</p>
            <p className="font-mono text-[0.72rem] text-charcoal/65">
              SPY, ^VIX, ^VIX9D, ^TNX, TLT, HYG, GLD, USO, IWM, QQQ, DXY — prices, 1M relative strength, trend grades, breadth metrics
            </p>
          </div>

          <div>
            <p className="font-mono text-[0.72rem] tracking-[0.1em] uppercase text-charcoal/65 mb-1.5">US Sector ETFs</p>
            <p className="font-mono text-[0.72rem] text-charcoal/65">
              XLK, XLF, XLV, XLE, XLI, XLY, XLP, XLU, XLB, XLRE, XLC — ranked by 1-month relative strength vs SPY
            </p>
          </div>

          <div>
            <p className="font-mono text-[0.72rem] tracking-[0.1em] uppercase text-charcoal/65 mb-1.5">Valuation Multiples (availability varies)</p>
            <p className="font-mono text-[0.72rem] text-charcoal/65 mb-2">
              Approximate NTM P/S computed as: TTM P/S ÷ (1 + trailing revenue growth).
              Equal-weighted median across each basket. Labeled with ~ to communicate approximation.
              Yahoo Finance basket requests are cached for 30 minutes. If a basket cannot be fetched, its current multiple is shown as Unavailable; the archived April 24, 2026 quarterly fallback is not presented as current market data. The valuation API reports source and data date separately for each basket. The dashboard hides this section when all three current baskets are unavailable; it does not substitute archived numbers.
            </p>
            <div className="space-y-2 pl-3" style={{ borderLeft: '2px solid rgba(0,0,0,0.08)' }}>
              {Object.entries(BASKETS).map(([key, basket]) => (
                <div key={key}>
                  <p className="font-mono text-[0.72rem] font-medium text-charcoal/70">{basket.label}</p>
                  <p className="font-mono text-[0.72rem] text-charcoal/65">
                    {basket.tickers.join(' · ')}
                  </p>
                  <p className="font-mono text-[0.72rem] text-charcoal/65 italic">{basket.note}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        <Divider />

        {/* ── AI COMPUTE COMMITMENTS ───────────────────────────────────── */}
        <SectionTitle>AI Compute Commitments</SectionTitle>

        <p className="font-mono text-[0.72rem] text-charcoal/65 leading-relaxed mb-5">
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
            className="underline text-charcoal/65 hover:text-charcoal transition-colors"
          >
            lib/aiCompute.ts
          </a>
          .
        </p>

        <div className="space-y-3">
          {aiComputeData.map((row, i) => (
            <div key={i} className="flex flex-col items-start gap-2 py-2 sm:flex-row sm:justify-between sm:gap-4" style={{ borderBottom: '1px solid var(--theme-line, rgba(0,0,0,0.06))' }}>
              <div className="min-w-0 max-w-full">
                <p className="font-mono text-[0.72rem] font-medium text-charcoal/80">
                  {row.buyer} — {row.provider}
                </p>
                <p className="font-mono text-[0.72rem] text-charcoal/65">
                  {row.status} · {row.agreementType} · value: {row.amount} ({row.amountBasis}) · capacity: {row.capacity} ({row.capacityBasis}) · {row.term} · announced {row.announced}
                </p>
                {row.notes && (
                  <p className="font-mono text-[0.72rem] text-charcoal/65 italic mt-0.5 leading-relaxed">
                    {row.notes}
                  </p>
                )}
              </div>
              <div className="flex min-w-0 max-w-full flex-col items-start mt-0.5 sm:flex-shrink-0 sm:items-end">
                {row.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="max-w-full break-words font-mono text-[0.72rem] tracking-[0.08em] uppercase transition-colors text-charcoal/65 hover:text-charcoal/65 sm:text-right [overflow-wrap:anywhere]">{source.label} · {source.kind} ↗</a>)}
              </div>
            </div>
          ))}
        </div>

        <Divider />

        <p className="font-mono text-xs text-charcoal/65 leading-relaxed mt-5">GPU ranges below are selected published rental list rates from Thunder Compute’s comparison, a single GPU vendor’s compilation. Some endpoints require reservations or are on-demand-equivalent. They are not a market-wide floor, live availability, or a quote. For a separate daily benchmark with a different methodology, see <a href="https://www.silicondata.com/products/silicon-index?gpu=h100" target="_blank" rel="noopener noreferrer" className="underline">Silicon Data’s GPU rental indices</a>; those index values are not ingested here.</p>

        {/* ── INDUSTRY BENCHMARKS ──────────────────────────────────────── */}
        <SectionTitle>Industry Benchmarks</SectionTitle>

        <p className="font-mono text-[0.72rem] text-charcoal/65 leading-relaxed mb-5">
          Slow-moving external statistics maintained manually in{' '}
          <a
            href="https://github.com/cloudandcapital/market-tape-app/blob/main/lib/industryBenchmarks.ts"
            target="_blank" rel="noopener noreferrer"
            className="underline text-charcoal/65 hover:text-charcoal transition-colors"
          >
            lib/industryBenchmarks.ts
          </a>
          . Each entry records its last update, next review date, and review cadence. The automated freshness check warns
          within 14 days of a due date and fails once a benchmark is overdue. Run{' '}
          <code className="font-mono text-[0.72rem] bg-charcoal/6 px-1 py-0.5 rounded-sm">npm run check-benchmarks</code>
          {' '}to see current freshness status.
        </p>

        <div className="space-y-5">
          {Object.entries(BENCHMARKS).map(([key, bm]) => (
            <div key={key} className="py-3" style={{ borderBottom: '1px solid var(--theme-line, rgba(0,0,0,0.06))' }}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="font-mono text-[0.72rem] tracking-[0.08em] text-charcoal/65">{key}</span>
                <span className="font-mono text-[0.72rem] font-medium text-charcoal/85">{bm.value}</span>
              </div>
              <div className="space-y-0.5">
                {'sourceLinks' in bm && bm.sourceLinks ? (
                  <div>{bm.sourceLinks.map((source: { label: string; url: string }) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="block font-mono text-[0.72rem] text-charcoal/65 hover:text-charcoal/75 underline transition-colors">{source.label}</a>)}</div>
                ) : bm.sourceUrl ? (
                  <a
                    href={bm.sourceUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="block font-mono text-[0.72rem] text-charcoal/65 hover:text-charcoal/75 underline transition-colors"
                  >
                    {bm.source}
                  </a>
                ) : (
                  <p className="font-mono text-[0.72rem] text-charcoal/65">{bm.source}</p>
                )}
                <p className="font-mono text-[0.72rem] text-charcoal/65">
                  Updated {formatDate(bm.lastUpdated)} · Next review {formatDate(bm.nextReviewDue)} · {bm.reviewCadence}
                </p>
                <p className="font-mono text-[0.72rem] text-charcoal/65 italic leading-relaxed">{bm.notes}</p>
              </div>
            </div>
          ))}
        </div>

        <SectionTitle>Lumen Synthesis &amp; Limitations</SectionTitle>

        <div className="space-y-4 font-mono text-[0.72rem] text-charcoal/65 leading-relaxed">
          <p>
            Lumen is an AI-generated synthesis of the market data and sourced benchmarks displayed on Market Tape. Its role is
            to surface relationships and review priorities, not to create new facts. Completed analysis is shared within the
            market-data refresh window so visitors see a consistent reading of the same snapshot. Analysis refreshes use verified server data and refuse a different snapshot from the one displayed. An unavailable or inconsistent feed gets an explicit message; prices and scores are not filled with invented defaults. Lumen pauses when a snapshot is more than four days old. That age rule is a conservative backstop, not an exchange-calendar freshness check.
          </p>
          <p>
            Market Tape provides strategic context, not individualized investment, financial, tax, procurement, or workload
            advice. Organization-specific decisions still require workload demand, utilization, contract terms, budget, risk
            tolerance, and business priorities. VIX is expected equity-market volatility, not a cloud-interruption forecast. TLT is a bond ETF, not a direct yield series. HYG price trends do not measure credit spreads, and a SaaS equity multiple does not establish a vendor discount. The cloud commitment questions are fixed review prompts, not AI purchasing recommendations. Data may be delayed, revised, approximate, or temporarily unavailable; follow the linked
            primary sources before acting on a benchmark or announcement.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-14 pt-5 border-t border-charcoal/8">
          <p className="font-mono text-[0.72rem] text-charcoal/65">
            <Link href="/" className="hover:text-charcoal/65 transition-colors">← Back to Market Tape</Link>
            {' · '}
            <a
              href="https://github.com/cloudandcapital/market-tape-app"
              target="_blank" rel="noopener noreferrer"
              className="hover:text-charcoal/65 transition-colors"
            >
              View source on GitHub ↗
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
