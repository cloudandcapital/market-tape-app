import type { Snapshot } from '@/lib/types'
import { getRow } from '@/lib/data'
import { numberTone, signedNumber } from '@/lib/numberFormat'

export default function TechConcentration({ snapshot }: { snapshot: Snapshot }) {
  const xlk = getRow(snapshot, 'XLK')
  const qqq = getRow(snapshot, 'QQQ')
  const spy = getRow(snapshot, 'SPY')
  const skyy = getRow(snapshot, 'SKYY')

  // RS1M is a volatility-adjusted score; this is not a price ratio.
  const growthSpread = qqq && spy ? qqq.rs1m - spy.rs1m : null
  const growthLeading = qqq && spy ? qqq.rs1m > spy.rs1m : null

  function gradeColor(g: string) {
    if (g === 'A') return 'var(--theme-green, #4A6B5F)'
    if (g === 'C') return 'var(--theme-rose, #C0443A)'
    return 'var(--theme-sand, #84672C)'
  }

  return (
    <div className="tape-tech">
      <h2 className="tape-eyebrow">Technology snapshot</h2>
      <p className="tape-score-label">RS1M score</p>
      {xlk && <div className="tape-tech-row">
        <div><h3>Technology ETF <span>· XLK</span></h3><p>XLK trend: <span style={{ color: gradeColor(xlk.trend_grade) }}>Grade {xlk.trend_grade}</span></p></div>
        <p className={`tape-tech-score ${numberTone(xlk.rs1m)}`} aria-label={`XLK · RS1M vs SPY: ${signedNumber(xlk.rs1m)} score`}>{signedNumber(xlk.rs1m)}</p>
      </div>}
      {qqq && <div className="tape-tech-row">
        <div><h3>Nasdaq-100 ETF <span>· QQQ</span></h3><p>${qqq.last.toFixed(0)} <span className={numberTone(qqq.d1_pct, 1)}>{signedNumber(qqq.d1_pct, 1)}% · 1D</span></p>
        </div>
        <p className={`tape-tech-score ${numberTone(qqq.rs1m)}`} aria-label={`QQQ · RS1M score: ${signedNumber(qqq.rs1m)}${growthSpread === null ? '' : `. ${growthLeading ? 'Ahead of' : 'Behind'} SPY by ${Math.abs(growthSpread).toFixed(2)} score`}`}>{signedNumber(qqq.rs1m)}</p>
      </div>}
      {skyy && <div className="tape-tech-row">
        <div><h3>Cloud computing ETF <span>· SKYY</span></h3><p>Cloud infrastructure and related companies.</p></div>
        <p className={`tape-tech-score ${numberTone(skyy.rs1m)}`} aria-label={`SKYY · RS1M score: ${signedNumber(skyy.rs1m)}`}>{signedNumber(skyy.rs1m)}</p>
      </div>}
    </div>
  )
}
