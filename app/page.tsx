import { fetchMeta, fetchSnapshot, formatTime } from '@/lib/data'
import MorningBrief from '@/components/MorningBrief'
import MarketStatus from '@/components/MarketStatus'
import SectorLeaders from '@/components/SectorLeaders'
import AIInfraCard from '@/components/AIInfraCard'
import MomentumLeaderboard from '@/components/MomentumLeaderboard'
import FinOpsSignals from '@/components/FinOpsSignals'
import CommitmentWindow from '@/components/CommitmentWindow'
import MacroContext from '@/components/MacroContext'
import TechConcentration from '@/components/TechConcentration'
import CloudValuations from '@/components/CloudValuations'
import HyperscalerCapEx from '@/components/HyperscalerCapEx'

export const revalidate = 1800

export default async function Page() {
  const [meta, snapshot] = await Promise.all([fetchMeta(), fetchSnapshot()])

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-6 md:px-10 md:py-8">

        {/* Page header */}
        <header className="mb-5">
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <p className="text-[9px] font-mono tracking-[0.22em] uppercase text-charcoal/35 mb-0.5">
                Cloud &amp; Capital
              </p>
              <h1
                className="font-serif italic font-normal tracking-tight"
                style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', color: '#191714', lineHeight: 1.1 }}
              >
                Market Tape
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono text-charcoal/40">
                {formatTime(meta.generated_at_utc)}
              </p>
              <p className="text-[9px] font-mono text-charcoal/25 mt-0.5">
                {meta.instrument_count} instruments · {meta.group_count} groups
              </p>
            </div>
          </div>
          <hr className="border-charcoal/10 mt-4" />
        </header>

        {/* Morning Brief — full width */}
        <div className="mb-8 overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '2px' }}>
          <MorningBrief />
        </div>

        {/* Main data grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">

          {/* Left: Market Status + Internals + Sectors */}
          <div className="md:col-span-1">
            <MarketStatus meta={meta} snapshot={snapshot} />
            <hr className="border-charcoal/10 my-6" />
            <SectorLeaders meta={meta} snapshot={snapshot} />
          </div>

          {/* Middle: AI, FinOps, Commitment, Macro, Tech, Valuations, CapEx */}
          <div className="md:col-span-1 space-y-0">
            <AIInfraCard snapshot={snapshot} />

            <hr className="border-charcoal/10 my-6" />
            <FinOpsSignals meta={meta} />

            <hr className="border-charcoal/10 my-6" />
            <CommitmentWindow meta={meta} snapshot={snapshot} />

            <hr className="border-charcoal/10 my-6" />
            <MacroContext snapshot={snapshot} />

            <hr className="border-charcoal/10 my-6" />
            <TechConcentration snapshot={snapshot} />

            <hr className="border-charcoal/10 my-6" />
            <CloudValuations />

            <hr className="border-charcoal/10 my-6" />
            <HyperscalerCapEx />
          </div>

          {/* Right: Momentum Leaderboard */}
          <div className="md:col-span-1">
            <MomentumLeaderboard meta={meta} />
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-12 pt-5 border-t border-charcoal/10">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <p className="text-[9px] font-mono text-charcoal/30">
              Data via yfinance · Refreshes every 30 min during market hours
            </p>
            <a href="https://cloudandcapital.com" className="text-[9px] font-mono text-charcoal/35 hover:text-charcoal transition-colors">
              cloudandcapital.com →
            </a>
          </div>
        </footer>

      </div>
    </div>
  )
}
