import { fetchMarketData, formatMarketSessionLabel, formatPublishedLabel } from '@/lib/data'
import { marketPriceDate, snapshotIsOld } from '@/lib/marketIntegrity'
import { buildContextData } from '@/lib/marketContext'
import CloudReview from '@/components/CloudReview'
import { checkServerStaleness } from '@/lib/industryBenchmarks'
import { fetchLiveMultiples } from '@/lib/liveMultiples'
import { getCachedIntelligentBrief } from '@/lib/intelligentBrief'
import MarketStatus, { MarketInternals } from '@/components/MarketStatus'
import { CountriesGlobal, Sectors } from '@/components/SectorLeaders'
import MomentumLeaderboard from '@/components/MomentumLeaderboard'
import MacroContext from '@/components/MacroContext'
import TechConcentration from '@/components/TechConcentration'
import { CloudValuations, FinOpsSignals, HyperscalerCapex, RiskAlerts } from '@/components/IntelligentSignals'
import { IntelligentProvider } from '@/components/IntelligentProvider'
import AIComputeCommitments from '@/components/AIComputeCommitments'

export const revalidate = 1800


export default async function Page() {
  // Runs server-side on every ISR revalidation cycle (every 30 min).
  // Logs to deployment output if any benchmark is >6 months past its review date.
  checkServerStaleness()

  const market = await fetchMarketData().catch(() => null)
  if (!market) return <div className="max-w-6xl mx-auto px-6 py-10 md:px-10"><h1 className="font-serif text-3xl mb-4">Market Tape</h1><section className="border border-charcoal/15 rounded-xl p-6 mb-10"><h2 className="font-serif text-xl mb-2">The market snapshot is unavailable</h2><p className="text-sm leading-relaxed mb-4">The price files may be updating or could not be verified. Refresh the page in a moment. I’ve kept the separately sourced infrastructure information below.</p><a href="/sources" className="underline">Methodology &amp; sources</a></section><HyperscalerCapex /><div className="mt-10"><AIComputeCommitments /></div></div>
  const { meta, snapshot } = market
  const multiples = await fetchLiveMultiples()
  const oldSnapshot = snapshotIsOld(snapshot.generated_at_utc)
  const trackedInstrumentCount = new Set(snapshot.groups.flatMap(group => group.rows.map(row => row.ticker))).size
  const contextData = buildContextData(meta, snapshot)
  const initialBrief = oldSnapshot ? null : await getCachedIntelligentBrief(contextData, multiples)
    .then(result => result.data)
    .catch(() => null)

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-6 md:px-10 md:py-8">

        {/* Page header — ABOVE the brief */}
        <header className="mb-5">
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <p className="text-[9px] font-mono tracking-[0.22em] uppercase text-charcoal/65 mb-0.5">Cloud &amp; Capital</p>
              <h1 className="font-serif italic font-normal tracking-tight"
                style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', color: '#191714', lineHeight: 1.1 }}>
                Market Tape
              </h1>
              <p className="font-mono text-[0.68rem] leading-relaxed text-charcoal/65 mt-2 max-w-xl">A clearer view of markets, cloud spending, and AI infrastructure.</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[0.68rem] font-mono uppercase tracking-[0.08em] text-charcoal/65">{formatMarketSessionLabel(marketPriceDate(snapshot))}</p>
              <p className="text-[0.65rem] font-mono text-charcoal/65 mt-1">{formatPublishedLabel(snapshot.generated_at_utc)}</p>
              <p className="text-[0.65rem] font-mono text-charcoal/65 mt-1">Tracked: {trackedInstrumentCount} unique · Universe screened: {meta.leaderboard.universe_count} · {meta.group_count} groups</p>
            </div>
          </div>
          <hr className="rule-major-bottom border-0 mt-4" />
        </header>

        <section className="mb-7 rounded-xl border border-charcoal/10 px-4 py-4 sm:px-5" aria-label="How to use Market Tape">
          <p className="text-sm leading-relaxed max-w-3xl">Start with market breadth, compare sector scores, then check the source behind anything relevant to your research or technology budget.</p>
          <p className="font-mono text-xs text-charcoal/65 leading-relaxed mt-2">Scheduled snapshots, not live quotes. Daily bars can change during the trading session. RS1M is a volatility-adjusted score, not a percentage return.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 font-mono text-xs text-sage-dark"><a href="#market-signals" className="underline underline-offset-4">Explore the numbers ↓</a><a href="https://cloudandcapital.com/insights/using-market-tape" className="underline underline-offset-4">Read the guide ↗</a><a href="/sources" className="underline underline-offset-4">Methodology &amp; sources ↗</a></div>
        </section>
        {oldSnapshot && <p role="status" className="mb-6 border-l-2 border-loss pl-4 text-sm leading-relaxed">This snapshot was published more than four days ago. Check the dates before using it. Lumen is paused until a newer snapshot is available; weekends and market holidays can explain some gaps.</p>}

        {/* IntelligentProvider renders Intelligence Brief first, then its children */}
        <IntelligentProvider key={JSON.stringify(contextData)} contextData={contextData} initialData={initialBrief} disabled={oldSnapshot}>

          <div className="space-y-10 md:space-y-12">
            {/* Band 2 */}
            <section id="market-signals" className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 scroll-mt-20" aria-label="Primary market signals">
              <MarketStatus meta={meta} />
              <div>
                <FinOpsSignals />
                <hr className="rule-subtle-bottom border-0 my-6" />
                <TechConcentration snapshot={snapshot} />
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
                <hr className="rule-subtle-bottom border-0 my-7" />
                <CloudValuations multiples={multiples} />
              </div>
            </section>

            {/* Band 7 */}
            <section aria-label="Hyperscaler capital expenditure">
              <HyperscalerCapex />
            </section>
          </div>

          {/* Full methodology-aware tracker follows the primary market dashboard. */}
          <div className="mt-10 px-4 sm:px-7 py-5" style={{ border: '1px solid rgba(0,0,0,0.08)', borderLeft: '3px solid rgba(0,0,0,0.12)', borderRadius: '2px', background: '#fefdfb' }}>
            <AIComputeCommitments />
          </div>

          <footer className="mt-12 pt-5 rule-major-top">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <p className="text-[0.6rem] font-mono text-charcoal/65">
                Data via yFinance · Pipeline checks scheduled every 30 min · Intelligence via Lumen ·{' '}
                <a href="/sources" className="hover:text-charcoal/65 transition-colors">Methodology &amp; Sources</a>
              </p>
              <p className="text-[0.6rem] font-mono text-charcoal/65">
                © 2026 Cloud &amp; Capital ·{' '}
                <a href="https://cloudandcapital.com" className="hover:text-charcoal/65 transition-colors">cloudandcapital.com</a>
              </p>
            </div>
            <p className="text-[0.68rem] font-mono text-charcoal/65 mt-2">
              For informational purposes only · Not investment, financial, or tax advice
            </p>
          </footer>

        </IntelligentProvider>

      </div>
    </div>
  )
}
