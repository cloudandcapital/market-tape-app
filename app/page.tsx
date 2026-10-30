import { fetchMarketData, formatMarketSessionLabel, formatPublishedLabel } from '@/lib/data'
import { marketPriceDate, snapshotIsOld } from '@/lib/marketIntegrity'
import { buildContextData } from '@/lib/marketContext'
import CloudReview from '@/components/CloudReview'
import AllInstruments from '@/components/AllInstruments'
import { checkServerStaleness } from '@/lib/industryBenchmarks'
import { fetchLiveMultiples } from '@/lib/liveMultiples'
import MarketStatus, { MarketInternals } from '@/components/MarketStatus'
import { CountriesGlobal, Sectors } from '@/components/SectorLeaders'
import MomentumLeaderboard from '@/components/MomentumLeaderboard'
import MacroContext from '@/components/MacroContext'
import MarketOverview from '@/components/MarketOverview'
import { CostConnections } from '@/components/TechnologyCostContext'
import { CloudValuations, FinOpsSignals, HyperscalerCapex, RiskAlerts } from '@/components/IntelligentSignals'
import { IntelligentProvider } from '@/components/IntelligentProvider'
import AIComputeCommitments from '@/components/AIComputeCommitments'
import Image from 'next/image'

export const revalidate = 1800


export default async function Page() {
  // Runs server-side on every ISR revalidation cycle (every 30 min).
  // Logs to deployment output if any benchmark is >6 months past its review date.
  checkServerStaleness()

  const market = await fetchMarketData().catch(() => null)
  if (!market) return <div id="tape-main" role="main" className="max-w-6xl mx-auto px-6 py-10 md:px-10"><h1 className="font-serif text-3xl mb-4">Market Tape</h1><section className="border border-charcoal/15 rounded-xl p-6 mb-10"><h2 className="font-serif text-xl mb-2">The market snapshot is unavailable</h2><p className="text-sm leading-relaxed mb-4">The price files may be updating or could not be verified. Refresh the page in a moment. I’ve kept the separately sourced infrastructure information below.</p><a href="/sources" className="underline">Methodology &amp; sources</a></section><HyperscalerCapex /><div className="mt-10"><AIComputeCommitments /></div></div>
  const { meta, snapshot } = market
  const multiples = await fetchLiveMultiples()
  const oldSnapshot = snapshotIsOld(snapshot.generated_at_utc)
  const trackedInstrumentCount = new Set(snapshot.groups.flatMap(group => group.rows.map(row => row.ticker))).size
  const contextData = buildContextData(meta, snapshot)

  return (
    <main id="tape-main" className="min-h-screen bg-cream">
      <div className="tape-shell">

        {/* Page header — ABOVE the brief */}
        <header className="tape-hero">
          <div className="tape-hero-copy">
            <h1>Markets, technology &amp; costs</h1>
            <p>What the market is doing, where technology fits, and what to check in your cost planning.</p>
            <div className="tape-hero-actions">
              <a href="#cost-connections" className="tape-text-link">How the numbers connect <Image src="/icons/arrow-right.svg" width={18} height={18} alt="" /></a>
              <a href="https://cloudandcapital.com/insights/using-market-tape" className="tape-text-link">Read the guide <Image src="/icons/arrow-up-right.svg" width={16} height={16} alt="" /></a>
              <a href="/sources" className="tape-text-link">Sources</a>
            </div>
          </div>
          <div className="tape-hero-art" aria-hidden="true">
            <Image src="/images/market-tape-bars-v2.png" width={1536} height={1024} alt="" priority sizes="(max-width: 767px) 1px, (max-width: 916px) 220px, (max-width: 1333px) 24vw, 320px" />
          </div>
        </header>

        <div className="tape-snapshot-context" aria-label="Snapshot dates">
          <p>{formatMarketSessionLabel(marketPriceDate(snapshot))}</p>
          <p>{formatPublishedLabel(snapshot.generated_at_utc)}</p>
          <p className="tape-snapshot-kind">Scheduled snapshots, not live quotes.</p>
        </div>
        {oldSnapshot && <p role="status" className="mb-6 border-l-2 border-loss pl-4 text-sm leading-relaxed">This snapshot was published more than four days ago. Check the dates before using it. Lumen is paused until a newer snapshot is available; weekends and market holidays can explain some gaps.</p>}

        <MarketOverview snapshot={snapshot} />
        <p className="tape-universe-note">Tracked: {trackedInstrumentCount} unique · Universe screened: {meta.leaderboard.universe_count} · {meta.group_count} groups. The equity ETF sample is not all US stocks or a target allocation. Daily bars can change during the trading session. RS1M is a volatility-adjusted score, not a percentage return.</p>

        <CostConnections />

        {/* IntelligentProvider renders Intelligence Brief first, then its children */}
        <IntelligentProvider key={JSON.stringify(contextData)} contextData={contextData} disabled={oldSnapshot}>

          <div className="tape-research space-y-10 md:space-y-12">
            {/* Band 2 */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12" aria-label="Market conditions and technology cost context">
              <MarketStatus snapshot={snapshot} detailsOnly />
              <div>
                <FinOpsSignals />
              </div>
            </section>

            {/* Band 3 */}
            <section aria-label="Risk and opportunity">
              <RiskAlerts />
            </section>

            {/* Band 4 */}
            <section aria-label="Cloud commitment questions">
              <CloudReview />
            </section>

            {/* Band 5 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10" aria-label="Market internals and momentum">
              <div>
                <MarketInternals snapshot={snapshot} />
                <hr className="rule-subtle-bottom border-0 my-6" />
                <MacroContext snapshot={snapshot} />
              </div>
              <div className="md:col-span-2">
                <MomentumLeaderboard meta={meta} />
              </div>
            </section>

            {/* Band 6 */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12" aria-label="Sector and cloud benchmarks">
              <Sectors snapshot={snapshot} />
              <div>
                <CountriesGlobal meta={meta} />
                <CloudValuations multiples={multiples} />
              </div>
            </section>

            <AllInstruments snapshot={snapshot} />

            {/* Band 7 */}
            <section aria-label="Hyperscaler capital expenditure">
              <HyperscalerCapex />
            </section>
          </div>

          {/* Full methodology-aware tracker follows the primary market dashboard. */}
          <div className="tape-compute-surface mt-10">
            <AIComputeCommitments />
          </div>

          <footer className="mt-12 pt-5 rule-major-top">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <p className="text-[0.72rem] font-mono text-charcoal/65">
                Data via yFinance · Pipeline checks scheduled every 30 min · Intelligence via Lumen ·{' '}
                <a href="/sources" className="hover:text-charcoal/65 transition-colors">Methodology &amp; Sources</a>
              </p>
              <p className="text-[0.72rem] font-mono text-charcoal/65">
                © 2026 Cloud &amp; Capital ·{' '}
                <a href="https://cloudandcapital.com" className="hover:text-charcoal/65 transition-colors">cloudandcapital.com</a>
              </p>
            </div>
            <p className="text-[0.72rem] font-mono text-charcoal/65 mt-2">
              For informational purposes only · Not investment, financial, or tax advice
            </p>
          </footer>

        </IntelligentProvider>

      </div>
    </main>
  )
}
