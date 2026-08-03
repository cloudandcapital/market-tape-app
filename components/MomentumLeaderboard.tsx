import Image from 'next/image'
import type { LeaderboardEntry, Meta } from '@/lib/types'
import { sparklineUrl, gradeColor } from '@/lib/data'

function MomentumList({ title, rows, tone }: { title: string; rows: LeaderboardEntry[]; tone: 'gain' | 'loss' }) {
  return (
    <section aria-labelledby={`momentum-${tone}`}>
      <h3 id={`momentum-${tone}`} className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-charcoal/55 mb-2">{title}</h3>
      <div className="divide-y divide-charcoal/8 border-y border-charcoal/8">
        {rows.map((row, i) => (
          <div key={row.ticker} className="grid grid-cols-[1rem_2.25rem_minmax(0,1fr)_auto] items-center gap-2 py-2 min-h-[3rem]">
            <span className="font-mono text-[0.62rem] text-charcoal/55 text-right">{i + 1}</span>
            <div className="w-9 h-5 opacity-80">
              <Image src={sparklineUrl(row.ticker)} alt={`${row.ticker} relative-strength sparkline`} width={36} height={20} className="w-full h-full object-contain" unoptimized />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-[0.78rem] font-semibold text-charcoal">{row.ticker}</span>
                <span className={`font-mono text-[0.6rem] ${gradeColor(row.trend_grade)}`}>{row.trend_grade}</span>
              </div>
              <p className="font-mono text-[0.64rem] text-charcoal/55 truncate">{row.short_name}</p>
            </div>
            <p className={`font-mono text-[0.7rem] font-medium whitespace-nowrap ${tone === 'gain' ? 'text-sage-dark' : 'text-loss'}`}>{row.rs1m > 0 ? '+' : ''}{row.rs1m.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function MomentumLeaderboard({ meta }: { meta: Meta }) {
  return (
    <section aria-labelledby="momentum-heading">
      <div className="mb-4">
        <h2 id="momentum-heading" className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/55">Momentum</h2>
        <p className="font-mono text-[0.62rem] text-charcoal/50 mt-1">Top and bottom 5 · {meta.leaderboard.universe_count} instruments</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
        <MomentumList title="Leaders" rows={meta.leaderboard.leaders.slice(0, 5)} tone="gain" />
        <MomentumList title="Laggards" rows={meta.leaderboard.laggards.slice(0, 5)} tone="loss" />
      </div>
    </section>
  )
}
