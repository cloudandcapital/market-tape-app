import { fetchMeta, fetchSnapshot, formatTime } from '@/lib/data'
import MorningBrief from '@/components/MorningBrief'
import MarketStatus from '@/components/MarketStatus'
import SectorLeaders from '@/components/SectorLeaders'
import AIInfraCard from '@/components/AIInfraCard'
import MomentumLeaderboard from '@/components/MomentumLeaderboard'
import BriefStatsCard from '@/components/BriefStatsCard'

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

        {/* Signal + Brief: 2-col compact section */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[28%_1fr] mb-8 overflow-hidden"
          style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '2px' }}
        >
          {/* Left: Signal card */}
          <BriefStatsCard meta={meta} />

          {/* Right: Morning Brief */}
          <MorningBrief />
        </div>

        {/* Main data grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">

          <div className="md:col-span-1">
            <MarketStatus meta={meta} />
            <hr className="border-charcoal/10 my-6" />
            <SectorLeaders meta={meta} />
          </div>

          <div className="md:col-span-1">
            <AIInfraCard snapshot={snapshot} />
          </div>

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
            <a
              href="https://cloudandcapital.com"
              className="text-[9px] font-mono text-charcoal/35 hover:text-charcoal transition-colors"
            >
              cloudandcapital.com →
            </a>
          </div>
        </footer>

      </div>
    </div>
  )
}
