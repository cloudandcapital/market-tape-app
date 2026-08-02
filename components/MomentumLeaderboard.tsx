import Image from 'next/image'
import type { LeaderboardEntry, Meta } from '@/lib/types'
import { sparklineUrl, gradeColor } from '@/lib/data'

function MomentumList({ title, rows, tone }: { title: string; rows: LeaderboardEntry[]; tone: 'gain' | 'loss' }) {
  return (
    <section aria-labelledby={`momentum-${tone}`}>
      <h3 id={`momentum-${tone}`} className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-charcoal/45 mb-3">{title}</h3>
      <div className="divide-y divide-charcoal/8 border-y border-charcoal/8">
        {rows.map((row, i) => (
          <div key={row.ticker} className="grid grid-cols-[1.25rem_3rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5 min-h-[3.4rem]">
            <span className="font-mono text-[0.62rem] text-charcoal/35 text-right">{i + 1}</span>
            <div className="w-12 h-6 opacity-75">
              <Image src={sparklineUrl(row.ticker)} alt={`${row.ticker} relative-strength sparkline`} width={48} height={24} className="w-full h-full object-contain" unoptimized />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-[0.82rem] font-semibold text-charcoal">{row.ticker}</span>
                <span className={`font-mono text-[0.6rem] ${gradeColor(row.trend_grade)}`}>Grade {row.trend_grade}</span>
              </div>
              <p className="font-mono text-[0.67rem] text-charcoal/50 truncate">{row.short_name}</p>
            </div>
            <p className={`font-mono text-[0.75rem] font-medium ${tone === 'gain' ? 'text-sage' : 'text-loss'}`}>{row.rs1m > 0 ? '+' : ''}{row.rs1m.toFixed(2)} RS</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function MomentumLeaderboard({ meta }: { meta: Meta }) {
  return (
    <section aria-labelledby="momentum-heading" className="mt-10">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2 id="momentum-heading" className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/45">Momentum</h2>
        <p className="font-mono text-[0.62rem] text-charcoal/40">Top and bottom 5 · {meta.leaderboard.universe_count} instruments</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <MomentumList title="Leaders" rows={meta.leaderboard.leaders.slice(0, 5)} tone="gain" />
        <MomentumList title="Laggards" rows={meta.leaderboard.laggards.slice(0, 5)} tone="loss" />
      </div>
    </section>
  )
}
