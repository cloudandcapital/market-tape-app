import type { Snapshot } from '@/lib/types'
import { getRow } from '@/lib/data'

function MacroRow({
  label, value, sub, color,
}: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="flex items-baseline justify-between py-[0.35rem] rule-subtle-bottom">
      <span className="text-[0.72rem] font-mono text-charcoal/65">{label}</span>
      <div className="text-right">
        <span className="text-xs font-mono font-medium" style={{ color: color ?? '#191714' }}>{value}</span>
        {sub && <span className="text-[0.72rem] font-mono text-charcoal/65 ml-1">{sub}</span>}
      </div>
    </div>
  )
}

export default function MacroContext({ snapshot }: { snapshot: Snapshot }) {
  const tlt = getRow(snapshot, 'TLT')
  const hyg = getRow(snapshot, 'HYG')
  const dxy = getRow(snapshot, 'DXY')
  const iwm = getRow(snapshot, 'IWM')
  const spy = getRow(snapshot, 'SPY')

  const smallVsLarge = iwm && spy ? iwm.rs1m - spy.rs1m : null

  function trendColor(rs1m: number) {
    if (rs1m > 0.5) return '#4A6B5F'
    if (rs1m < -0.5) return '#C0443A'
    return '#6D6964'
  }

  return (
    <div>
      <h2 className="text-[0.72rem] font-mono tracking-[0.2em] uppercase text-charcoal/65 mb-4">
        Macro Context
      </h2>

      {tlt && (
        <MacroRow
          label="Bonds (TLT)"
          value={`${tlt.d20_pct > 0 ? '+' : ''}${tlt.d20_pct.toFixed(2)}% · 20D`}
          sub={`${tlt.rs1m > 0 ? '+' : ''}${tlt.rs1m.toFixed(2)} score`}
          color={trendColor(tlt.d20_pct)}
        />
      )}
      {hyg && (
        <MacroRow
          label="High-yield ETF (HYG)"
          value={`${hyg.d20_pct > 0 ? '+' : ''}${hyg.d20_pct.toFixed(2)}% · 20D`}
          sub={`${hyg.rs1m > 0 ? '+' : ''}${hyg.rs1m.toFixed(2)} score`}
          color={trendColor(hyg.d20_pct)}
        />
      )}
      {dxy && (
        <MacroRow
          label="Dollar (DXY)"
          value={`${dxy.d20_pct > 0 ? '+' : ''}${dxy.d20_pct.toFixed(2)}% · 20D`}
          sub={`${dxy.rs1m > 0 ? '+' : ''}${dxy.rs1m.toFixed(2)} score`}
          color={trendColor(dxy.d20_pct)}
        />
      )}
      {smallVsLarge !== null && iwm && spy && (
        <MacroRow
          label="Small caps vs S&P 500"
          value={`IWM ${smallVsLarge > 0 ? 'ahead' : smallVsLarge < 0 ? 'behind' : 'level'}`}
          sub={`${smallVsLarge > 0 ? '+' : ''}${smallVsLarge.toFixed(2)} score gap`}
          color={smallVsLarge > 0.5 ? '#4A6B5F' : smallVsLarge < -0.5 ? '#C0443A' : '#6D6964'}
        />
      )}
      <p className="font-mono text-[0.72rem] text-charcoal/65 leading-relaxed mt-3">20D = price change over 20 trading sessions. Scores compare volatility-adjusted performance with SPY. HYG price changes do not measure credit spreads.</p>
    </div>
  )
}
