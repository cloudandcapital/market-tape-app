import { fetchMeta, fetchSnapshot, formatTime, getRow, getSectorRows } from '@/lib/data'
import MarketStatus from '@/components/MarketStatus'
import SectorLeaders from '@/components/SectorLeaders'
import AIInfraCard from '@/components/AIInfraCard'
import MomentumLeaderboard, { MomentumLaggards } from '@/components/MomentumLeaderboard'
import MacroContext from '@/components/MacroContext'
import TechConcentration from '@/components/TechConcentration'
import { IntelligentMiddle, IntelligentRight } from '@/components/IntelligentSignals'
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
  const [meta, snapshot] = await Promise.all([fetchMeta(), fetchSnapshot()])
  const contextData = buildContextData(meta, snapshot)

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-6 md:px-10 md:py-8">

        {/* Page header — ABOVE the brief */}
        <header className="mb-5">
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <p className="text-[9px] font-mono tracking-[0.22em] uppercase text-charcoal/35 mb-0.5">Cloud &amp; Capital</p>
              <h1 className="font-serif italic font-normal tracking-tight"
                style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', color: '#191714', lineHeight: 1.1 }}>
                Market Tape
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono text-charcoal/40">{formatTime(meta.generated_at_utc)}</p>
              <p className="text-[9px] font-mono text-charcoal/25 mt-0.5">Tracked: {meta.instrument_count} · Universe screened: {meta.leaderboard.universe_count} · {meta.group_count} groups</p>
            </div>
          </div>
          <hr className="border-charcoal/10 mt-4" />
        </header>

        {/* IntelligentProvider renders Intelligence Brief first, then its children */}
        <IntelligentProvider contextData={contextData}>

          {/* AI Compute Commitments — high visibility, just below Lumen's main Read */}
          <div className="mb-8 px-7 py-5 overflow-x-auto" style={{ border: '1px solid rgba(0,0,0,0.08)', borderLeft: '3px solid rgba(0,0,0,0.12)', borderRadius: '2px', background: '#fefdfb' }}>
            <AIComputeCommitments />
          </div>

          {/* 3-column data grid — rendered after the brief */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">

            {/* Left: Status · Internals · Macro · Sectors */}
            <div className="md:col-span-1">
              <MarketStatus meta={meta} snapshot={snapshot} />
              <hr className="border-charcoal/10 my-6" />
              <MacroContext snapshot={snapshot} />
              <hr className="border-charcoal/10 my-6" />
              <SectorLeaders meta={meta} snapshot={snapshot} />
            </div>

            {/* Middle: FinOps · Commitment · Cloud Val · CapEx · Laggards */}
            <div className="md:col-span-1">
              <IntelligentMiddle />
              <hr className="border-charcoal/10 my-6" />
              <MomentumLaggards meta={meta} />
            </div>

            {/* Right: Tech Concentration · Risk Alerts · Sector Insights · Momentum Leaders */}
            <div className="md:col-span-1">
              <TechConcentration snapshot={snapshot} />
              <hr className="border-charcoal/10 my-6" />
              <IntelligentRight />
              <hr className="border-charcoal/10 my-6" />
              <MomentumLeaderboard meta={meta} />
            </div>

          </div>

          <footer className="mt-12 pt-5 border-t border-charcoal/10">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <p className="text-[9px] font-mono text-charcoal/30">
                Data via yFinance · Refreshes every 30 min · Intelligence via Lumen
              </p>
              <p className="text-[9px] font-mono text-charcoal/25">
                © 2026 Cloud &amp; Capital ·{' '}
                <a href="https://cloudandcapital.com" className="hover:text-charcoal/60 transition-colors">cloudandcapital.com</a>
              </p>
            </div>
          </footer>

        </IntelligentProvider>

      </div>
    </div>
  )
}
