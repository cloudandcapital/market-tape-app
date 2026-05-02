import type { Snapshot } from '@/lib/types'
import { getRow } from '@/lib/data'

function MacroRow({
  label, value, sub, color,
}: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="flex items-baseline justify-between py-[0.35rem]" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <span className="text-[10px] font-mono text-charcoal/40">{label}</span>
      <div className="text-right">
        <span className="text-xs font-mono font-medium" style={{ color: color ?? '#191714' }}>{value}</span>
        {sub && <span className="text-[9px] font-mono text-charcoal/30 ml-1">{sub}</span>}
      </div>
    </div>
  )
}

export default function MacroContext({ snapshot }: { snapshot: Snapshot }) {
  const tlt = getRow(snapshot, 'TLT')
  const hyg = getRow(snapshot, 'HYG')
  const dxy = getRow(snapshot, 'DXY')
  const iwm = getRow(snapshot, 'IWM')
  const qqq = getRow(snapshot, 'QQQ')

  const smallVsLarge = iwm && qqq ? iwm.rs1m - qqq.rs1m : null

  function bondLabel(rs1m: number) {
    if (rs1m > 1) return 'Rising'
    if (rs1m < -1) return 'Falling'
    return 'Flat'
  }

  function trendColor(rs1m: number) {
    if (rs1m > 0.5) return '#6B8E7F'
    if (rs1m < -0.5) return '#C0443A'
    return '#888'
  }

  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
        Macro Context
      </h2>

      {tlt && (
        <MacroRow
          label="Bonds (TLT)"
          value={bondLabel(tlt.rs1m)}
          sub={`${tlt.rs1m > 0 ? '+' : ''}${tlt.rs1m.toFixed(2)} RS1M`}
          color={trendColor(tlt.rs1m)}
        />
      )}
      {hyg && (
        <MacroRow
          label="Credit (HYG)"
          value={hyg.trend_grade === 'A' ? 'Tight' : hyg.trend_grade === 'C' ? 'Widening' : 'Neutral'}
          sub={`${hyg.rs1m > 0 ? '+' : ''}${hyg.rs1m.toFixed(2)} RS1M`}
          color={hyg.trend_grade === 'A' ? '#6B8E7F' : hyg.trend_grade === 'C' ? '#C0443A' : '#888'}
        />
      )}
      {dxy && (
        <MacroRow
          label="Dollar (DXY)"
          value={bondLabel(dxy.rs1m)}
          sub={`${dxy.rs1m > 0 ? '+' : ''}${dxy.rs1m.toFixed(2)} RS1M`}
          color={trendColor(dxy.rs1m)}
        />
      )}
      {smallVsLarge !== null && iwm && qqq && (
        <MacroRow
          label="Small vs Large"
          value={`IWM ${smallVsLarge > 0 ? 'leading' : 'lagging'}`}
          sub={`${smallVsLarge > 0 ? '+' : ''}${smallVsLarge.toFixed(2)} spread`}
          color={smallVsLarge > 0.5 ? '#6B8E7F' : smallVsLarge < -0.5 ? '#C0443A' : '#888'}
        />
      )}
    </div>
  )
}
