import { fetchMeta, fetchSnapshot, formatMarketSessionLabel, getRow, getSectorRows } from '@/lib/data'
import { checkServerStaleness } from '@/lib/industryBenchmarks'
import { fetchLiveMultiples } from '@/lib/liveMultiples'
import { getCachedIntelligentBrief } from '@/app/api/intelligent-brief/route'
import MarketStatus, { MarketInternals } from '@/components/MarketStatus'
import { CountriesGlobal, Sectors } from '@/components/SectorLeaders'
import MomentumLeaderboard from '@/components/MomentumLeaderboard'
import MacroContext from '@/components/MacroContext'
import TechConcentration from '@/components/TechConcentration'
import { CloudValuations, CommitmentWindows, FinOpsSignals, HyperscalerCapex, RiskAlerts } from '@/components/IntelligentSignals'
import { IntelligentProvider } from '@/components/IntelligentProvider'
import AIComputeCommitments from '@/components/AIComputeCommitments'
import type { MarketContextData } from '@/lib/intelligentTypes'
import type { Meta, Snapshot } from '@/lib/types'

export const revalidate = 1800

function buildContextData(meta: Meta, snapshot: Snapshot): MarketContextData {
  const r = (t: string) => getRow(snapshot, t)
  const sectors = getSectorRows(snapshot)

  const vix = r('^VIX'), spy = r('SPY'), tlt = r('TLT'), hyg = r('HYG')
  const dxy = r('DXY'), gld = r('GLD'), uso = r('USO'), iwm = r('IWM'), qqq = r('QQQ')

  return {
    marketData: {
      vix: vix?.last ?? 20,   vixD1: vix?.d1_pct ?? 0,
      spy: spy?.last ?? 0,    spyD1: spy?.d1_pct ?? 0,
      guidance: meta.status.exposure.guidance,
      exposureLevel: meta.status.exposure.level,
      trends: { long: meta.status.trend.long_term, intermediate: meta.status.trend.intermediate_term, short: meta.status.trend.short_term },
      breadth: { above20d: meta.status.breadth.above_20d_pct, above50d: meta.status.breadth.above_50d_pct, label: meta.status.breadth.breadth_label },
      momentum: { score: meta.status.momentum_env.score, label: meta.status.momentum_env.label },
      risk: meta.status.risk,
    },
    sectorData: sectors.map(s => ({ ticker: s.ticker, name: s.short_name, rs1m: s.rs1m })),
    macroData: {
      tlt: tlt ? { rs1m: tlt.rs1m, grade: tlt.trend_grade, d1: tlt.d1_pct } : null,
      hyg: hyg ? { rs1m: hyg.rs1m, grade: hyg.trend_grade } : null,
      dxy: dxy ? { rs1m: dxy.rs1m, last: dxy.last } : null,
      gld: gld ? { last: gld.last, d1: gld.d1_pct, rs1m: gld.rs1m } : null,
      uso: uso ? { last: uso.last, d1: uso.d1_pct } : null,
      iwm: iwm ? { rs1m: iwm.rs1m, last: iwm.last } : null,
      qqq: qqq ? { rs1m: qqq.rs1m, last: qqq.last, d1: qqq.d1_pct } : null,
    },
    leaderboard: {
      leaders: meta.leaderboard.leaders.slice(0, 10).map(l => ({ ticker: l.ticker, rs1m: l.rs1m, grade: l.trend_grade, intra_pct: l.intra_pct })),
      laggards: meta.leaderboard.laggards.slice(0, 5).map(l => ({ ticker: l.ticker, rs1m: l.rs1m, grade: l.trend_grade })),
    },
  }
}

export default async function Page() {
  // Runs server-side on every ISR revalidation cycle (every 30 min).
  // Logs to deployment output if any benchmark is >6 months past its review date.
  checkServerStaleness()

  const [meta, snapshot, multiples] = await Promise.all([fetchMeta(), fetchSnapshot(), fetchLiveMultiples()])
  const contextData = buildContextData(meta, snapshot)
  const initialBrief = await getCachedIntelligentBrief(contextData, multiples)
    .then(result => result.data)
    .catch(() => null)

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-6 md:px-10 md:py-8">

        {/* Page header — ABOVE the brief */}
        <header className="mb-5">
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <p className="text-[9px] font-mono tracking-[0.22em] uppercase text-charcoal/50 mb-0.5">Cloud &amp; Capital</p>
              <h1 className="font-serif italic font-normal tracking-tight"
                style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', color: '#191714', lineHeight: 1.1 }}>
                Market Tape
              </h1>
              <p className="font-mono text-[0.68rem] leading-relaxed text-charcoal/50 mt-2 max-w-xl">Market, cloud, and AI infrastructure signals for technology finance decisions.</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[0.62rem] font-mono uppercase tracking-[0.08em] text-charcoal/55">{formatMarketSessionLabel(meta.generated_at_utc)}</p>
              <p className="text-[0.58rem] font-mono text-charcoal/50 mt-1">Tracked: {meta.instrument_count} · Universe screened: {meta.leaderboard.universe_count} · {meta.group_count} groups</p>
            </div>
          </div>
          <hr className="rule-major-bottom border-0 mt-4" />
        </header>

        {/* IntelligentProvider renders Intelligence Brief first, then its children */}
        <IntelligentProvider contextData={contextData} initialData={initialBrief}>

          <div className="space-y-10 md:space-y-12">
            {/* Band 2 */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12" aria-label="Primary market signals">
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
            <section aria-label="Commitment windows">
              <CommitmentWindows />
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
                <CloudValuations />
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
              <p className="text-[0.6rem] font-mono text-charcoal/55">
                Data via yFinance · Refreshes every 30 min · Intelligence via Lumen ·{' '}
                <a href="/sources" className="hover:text-charcoal/60 transition-colors">Methodology &amp; Sources</a>
              </p>
              <p className="text-[0.6rem] font-mono text-charcoal/50">
                © 2026 Cloud &amp; Capital ·{' '}
                <a href="https://cloudandcapital.com" className="hover:text-charcoal/60 transition-colors">cloudandcapital.com</a>
              </p>
            </div>
            <p className="text-[0.58rem] font-mono text-charcoal/50 mt-2">
              For informational purposes only · Not investment, financial, or tax advice
            </p>
          </footer>

        </IntelligentProvider>

      </div>
    </div>
  )
}
