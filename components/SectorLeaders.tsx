import type { Meta, Snapshot } from '@/lib/types'
import { getSectorRows } from '@/lib/data'

export default function SectorLeaders({ meta, snapshot }: { meta: Meta; snapshot: Snapshot }) {
  const sectors = getSectorRows(snapshot)
  const { countries } = meta.leaders

  const maxAbs = Math.max(...sectors.map(s => Math.abs(s.rs1m)), 1)

  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
        Sectors · RS1M vs SPY
      </h2>

      <div className="space-y-[0.55rem] mb-6">
        {sectors.map((s, i) => {
          const isPos = s.rs1m >= 0
          const barPct = Math.min((Math.abs(s.rs1m) / maxAbs) * 100, 100)
          return (
            <div key={s.ticker}>
              <div className="flex justify-between items-baseline mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-charcoal/25 w-3">{i + 1}</span>
                  <span className="text-[11px] font-mono font-semibold text-charcoal">{s.ticker}</span>
                </div>
                <span className={`text-[11px] font-mono font-medium ${isPos ? 'text-sage' : 'text-loss'}`}>
                  {isPos ? '+' : ''}{s.rs1m.toFixed(2)}
                </span>
              </div>
              <div className="h-[3px] bg-charcoal/8 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isPos ? 'bg-sage' : 'bg-loss'}`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <hr className="border-charcoal/10 mb-4" />

      <p className="text-xs font-mono text-charcoal/40 mb-3">Countries / Global</p>
      <div className="space-y-3">
        {countries.map((c, i) => {
          const isPos = c.rs1m >= 0
          const pct = Math.min(Math.abs(c.rs1m) * 40, 100)
          return (
            <div key={c.ticker}>
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-charcoal/30">{i + 1}</span>
                  <span className="text-sm font-mono font-medium text-charcoal">{c.ticker}</span>
                </div>
                <span className={`text-sm font-mono ${isPos ? 'text-sage' : 'text-loss'}`}>
                  {isPos ? '+' : ''}{c.rs1m.toFixed(2)}
                </span>
              </div>
              <div className="h-0.5 bg-charcoal/8 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isPos ? 'bg-sage' : 'bg-loss'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
