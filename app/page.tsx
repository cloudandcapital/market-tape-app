import { fetchMeta, fetchSnapshot, formatTime } from '@/lib/data'
import MorningBrief from '@/components/MorningBrief'
import MarketStatus from '@/components/MarketStatus'
import SectorLeaders from '@/components/SectorLeaders'
import AIInfraCard from '@/components/AIInfraCard'
import MomentumLeaderboard from '@/components/MomentumLeaderboard'

export const revalidate = 1800

export default async function Page() {
  const [meta, snapshot] = await Promise.all([fetchMeta(), fetchSnapshot()])

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-10 md:px-10 md:py-12">

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-mono tracking-[0.22em] uppercase text-charcoal/40 mb-1">
                Cloud &amp; Capital
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-normal text-charcoal tracking-tight">
                Market Tape
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-charcoal/40">
                Updated {formatTime(meta.generated_at_utc)}
              </p>
              <p className="text-[10px] font-mono text-charcoal/30 mt-0.5">
                {meta.instrument_count} instruments · {meta.group_count} groups
              </p>
            </div>
          </div>
          <hr className="border-charcoal/12 mt-6" />
        </header>

        {/* Claude Morning Brief */}
        <MorningBrief />

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">

          {/* Left column: Market Status */}
          <div className="md:col-span-1">
            <MarketStatus meta={meta} />

            <hr className="border-charcoal/10 my-8" />

            <SectorLeaders meta={meta} />
          </div>

          {/* Middle column: AI & Infra */}
          <div className="md:col-span-1">
            <AIInfraCard snapshot={snapshot} />
          </div>

          {/* Right column: Momentum Leaderboard */}
          <div className="md:col-span-1">
            <MomentumLeaderboard meta={meta} />
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-charcoal/10">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <p className="text-[10px] font-mono text-charcoal/30">
              Data via yfinance · Refreshes every 30 min during market hours
            </p>
            <a
              href="https://cloudandcapital.com"
              className="text-[10px] font-mono text-charcoal/40 hover:text-charcoal transition-colors"
            >
              cloudandcapital.com →
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
