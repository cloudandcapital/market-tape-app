import type { Snapshot } from '@/lib/types'
import { getRow } from '@/lib/data'
import { numberTone, signedNumber } from '@/lib/numberFormat'

export default function TechConcentration({ snapshot }: { snapshot: Snapshot }) {
  const xlk = getRow(snapshot, 'XLK')
  const qqq = getRow(snapshot, 'QQQ')
  const spy = getRow(snapshot, 'SPY')

  // RS1M is a volatility-adjusted score; this is not a price ratio.
  const growthSpread = qqq && spy ? qqq.rs1m - spy.rs1m : null
  const growthLeading = qqq && spy ? qqq.rs1m > spy.rs1m : null

  function gradeColor(g: string) {
    if (g === 'A') return '#4A6B5F'
    if (g === 'C') return '#C0443A'
    return '#84672C'
  }

  return (
    <div>
      <h2 className="text-[0.72rem] font-mono tracking-[0.2em] uppercase text-charcoal/65 mb-4">
        Tech snapshot
      </h2>

      <div className="rows-subtle">
        {xlk && (
          <div className="flex items-baseline justify-between py-[0.35rem]">
            <span className="text-[0.72rem] font-mono text-charcoal/65">XLK trend</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-mono font-medium" style={{ color: gradeColor(xlk.trend_grade) }}>
                Grade {xlk.trend_grade}
              </span>

            </div>
          </div>
        )}
        {xlk && <div className="flex items-baseline justify-between py-[0.35rem]">
          <span className="text-[0.72rem] font-mono text-charcoal/65">XLK · RS1M vs SPY</span>
          <span className={`text-xs font-mono ${numberTone(xlk.rs1m)}`}>{signedNumber(xlk.rs1m)} score</span>
        </div>}
        {growthSpread !== null && (
          <div className="flex items-baseline justify-between py-[0.35rem]">
            <span className="text-[0.72rem] font-mono text-charcoal/65">QQQ · RS1M score</span>
            <span className="text-xs font-mono font-medium" style={{ color: growthLeading ? '#4A6B5F' : '#C0443A' }}>
              {growthLeading ? 'Ahead' : 'Behind'} {growthSpread > 0 ? '+' : ''}{growthSpread.toFixed(2)}
            </span>
          </div>
        )}
        {qqq && (
          <div className="flex items-baseline justify-between py-[0.35rem]">
            <span className="text-[0.72rem] font-mono text-charcoal/65">Nasdaq-100 ETF (QQQ)</span>
            <span className="text-xs font-mono font-medium text-charcoal">
              ${qqq.last.toFixed(0)} &nbsp;
              <span style={{ color: qqq.d1_pct > 0 ? '#4A6B5F' : '#C0443A' }}>
                {qqq.d1_pct > 0 ? '+' : ''}{qqq.d1_pct.toFixed(1)}%
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
