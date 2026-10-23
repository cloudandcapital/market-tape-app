import type { Snapshot } from '@/lib/types'
import { getRow } from '@/lib/data'

export default function TechConcentration({ snapshot }: { snapshot: Snapshot }) {
  const xlk = getRow(snapshot, 'XLK')
  const qqq = getRow(snapshot, 'QQQ')
  const spy = getRow(snapshot, 'SPY')

  // RS1M is a volatility-adjusted score; this is not a price ratio.
  const growthSpread = qqq && spy ? qqq.rs1m - spy.rs1m : null
  const growthLeading = qqq && spy ? qqq.rs1m > spy.rs1m : null

  function gradeColor(g: string) {
    if (g === 'A') return '#6B8E7F'
    if (g === 'C') return '#C0443A'
    return '#C9A961'
  }

  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/65 mb-4">
        Tech snapshot
      </h2>

      <div className="rows-subtle">
        {xlk && (
          <div className="flex items-baseline justify-between py-[0.35rem]">
            <span className="text-[10px] font-mono text-charcoal/65">XLK vs SPY</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-mono font-medium" style={{ color: gradeColor(xlk.trend_grade) }}>
                Grade {xlk.trend_grade}
              </span>
              <span className="text-[10px] font-mono" style={{ color: xlk.rs1m > 0 ? '#6B8E7F' : '#C0443A' }}>
                {xlk.rs1m > 0 ? '+' : ''}{xlk.rs1m.toFixed(2)} score
              </span>
            </div>
          </div>
        )}
        {growthSpread !== null && (
          <div className="flex items-baseline justify-between py-[0.35rem]">
            <span className="text-[10px] font-mono text-charcoal/65">QQQ · RS1M score</span>
            <span className="text-xs font-mono font-medium" style={{ color: growthLeading ? '#6B8E7F' : '#C0443A' }}>
              {growthLeading ? 'Ahead' : 'Behind'} {growthSpread > 0 ? '+' : ''}{growthSpread.toFixed(2)}
            </span>
          </div>
        )}
        {qqq && (
          <div className="flex items-baseline justify-between py-[0.35rem]">
            <span className="text-[10px] font-mono text-charcoal/65">Nasdaq-100 ETF (QQQ)</span>
            <span className="text-xs font-mono font-medium text-charcoal">
              ${qqq.last.toFixed(0)} &nbsp;
              <span style={{ color: qqq.d1_pct > 0 ? '#6B8E7F' : '#C0443A' }}>
                {qqq.d1_pct > 0 ? '+' : ''}{qqq.d1_pct.toFixed(1)}%
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
