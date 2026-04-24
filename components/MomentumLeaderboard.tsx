import Image from 'next/image'
import type { Meta } from '@/lib/types'
import { sparklineUrl, pctColor, pctLabel, gradeColor } from '@/lib/data'

export default function MomentumLeaderboard({ meta }: { meta: Meta }) {
  const leaders = meta.leaderboard.leaders.slice(0, 10)
  const laggards = meta.leaderboard.laggards.slice(0, 5)

  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
        Momentum · Universe Leaders
      </h2>

      <div className="space-y-0 divide-y divide-charcoal/8 mb-6">
        {leaders.map((row, i) => (
          <div key={row.ticker} className="flex items-center gap-3 py-2.5">
            <span className="text-[10px] font-mono text-charcoal/25 w-4 text-right flex-shrink-0">
              {i + 1}
            </span>

            <div className="w-12 h-6 flex-shrink-0 opacity-75">
              <Image
                src={sparklineUrl(row.ticker)}
                alt={`${row.ticker} RS chart`}
                width={48}
                height={24}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-mono font-semibold text-charcoal">{row.ticker}</span>
                <span className={`text-[9px] font-mono ${gradeColor(row.trend_grade)}`}>
                  {row.trend_grade}
                </span>
              </div>
              <p className="text-[10px] font-mono text-charcoal/40 truncate">{row.short_name}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-xs font-mono font-medium text-sage">
                {row.rs1m > 0 ? '+' : ''}{row.rs1m.toFixed(2)}
              </p>
              <p className={`text-[10px] font-mono ${pctColor(row.intra_pct)}`}>
                {pctLabel(row.intra_pct)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-charcoal/10 mb-4" />

      <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-charcoal/40 mb-3">
        Laggards
      </p>
      <div className="space-y-0 divide-y divide-charcoal/8">
        {laggards.map((row, i) => (
          <div key={row.ticker} className="flex items-center gap-3 py-2">
            <span className="text-[10px] font-mono text-charcoal/25 w-4 text-right flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-mono font-medium text-charcoal">{row.ticker}</span>
                <span className={`text-[9px] font-mono ${gradeColor(row.trend_grade)}`}>
                  {row.trend_grade}
                </span>
              </div>
              <p className="text-[10px] font-mono text-charcoal/40 truncate">{row.short_name}</p>
            </div>
            <p className="text-xs font-mono font-medium text-loss">
              {row.rs1m.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-mono text-charcoal/25 mt-4">
        Universe: {meta.leaderboard.universe_count} instruments
      </p>
    </div>
  )
}
