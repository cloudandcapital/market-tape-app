import type { LeaderboardEntry, Meta } from '@/lib/types'
import { gradeColor } from '@/lib/data'

function MomentumList({ title, rows, tone }: { title: string; rows: LeaderboardEntry[]; tone: 'gain' | 'loss' }) {
  return (
    <section aria-labelledby={`momentum-${tone}`}>
      <h3 id={`momentum-${tone}`} className="font-mono text-sm tracking-[0.18em] uppercase text-charcoal/65 mb-2">{title}</h3>
      <div className="rows-subtle">
        {rows.map((row, i) => (
          <div key={row.ticker} className="grid grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-3 py-2 min-h-[3rem]">
            <span className="font-mono text-sm text-charcoal/65 text-right">{i + 1}</span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <a className="inline-flex min-h-8 items-center font-mono text-sm font-semibold text-charcoal underline decoration-charcoal/20 underline-offset-4 hover:decoration-charcoal" href={`https://finance.yahoo.com/quote/${encodeURIComponent(row.ticker)}/`} target="_blank" rel="noopener noreferrer" aria-label={`Research ${row.ticker} on Yahoo Finance`}>{row.ticker}</a>
                <span className={`font-mono text-sm ${gradeColor(row.trend_grade)}`}>{row.trend_grade}</span>
              </div>
              <p className="font-mono text-sm text-charcoal/65 truncate">{row.short_name}</p>
            </div>
            <p className={`font-mono text-sm font-medium whitespace-nowrap ${tone === 'gain' ? 'text-sage-dark' : 'text-loss'}`}>{row.rs1m > 0 ? '+' : ''}{row.rs1m.toFixed(2)}</p>
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
        <h2 id="momentum-heading" className="text-sm font-mono tracking-[0.2em] uppercase text-charcoal/65">Momentum</h2>
        <p className="font-mono text-sm text-charcoal/65 mt-1">Top and bottom 5 · {meta.leaderboard.universe_count} instruments</p>
        <p className="font-mono text-sm text-charcoal/65 mt-2 leading-relaxed">Ranked by RS1M score, not today’s return. A higher score means stronger volatility-adjusted performance versus SPY over 20 sessions.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
        <MomentumList title="Leaders" rows={meta.leaderboard.leaders.slice(0, 5)} tone="gain" />
        <MomentumList title="Laggards" rows={meta.leaderboard.laggards.slice(0, 5)} tone="loss" />
      </div>
    </section>
  )
}
