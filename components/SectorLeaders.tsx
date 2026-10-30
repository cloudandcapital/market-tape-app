import type { Meta, Snapshot } from '@/lib/types'
import { getSectorRows } from '@/lib/data'
import { numberTone, roundedValue, signedNumber } from '@/lib/numberFormat'

export function Sectors({ snapshot }: { snapshot: Snapshot }) {
  const sectors = getSectorRows(snapshot)
  const maxAbs = Math.max(...sectors.map(s => Math.abs(s.rs1m)), 1)

  return (
    <div>
      <h2 className="text-sm font-mono tracking-[0.2em] uppercase text-charcoal/65 mb-4">
        Sectors · RS1M score vs SPY
      </h2>

      <div className="space-y-[0.55rem]">
        {sectors.map((s, i) => {
          const isPos = roundedValue(s.rs1m) > 0
          const barPct = Math.min((Math.abs(s.rs1m) / maxAbs) * 100, 100)
          return (
            <div key={s.ticker}>
              <div className="flex justify-between items-baseline mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-mono text-charcoal/65 w-3">{i + 1}</span>
                  <span className="text-sm font-mono font-semibold text-charcoal">{s.ticker}</span>
                </div>
                <span className={`text-sm font-mono font-medium ${numberTone(s.rs1m)}`}>
                  {signedNumber(s.rs1m)}
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

    </div>
  )
}

export function CountriesGlobal({ meta }: { meta: Meta }) {
  const { countries } = meta.leaders

  return (
    <div>
      <h2 className="text-sm font-mono tracking-[0.2em] uppercase text-charcoal/65 mb-4">Global ETF leaders · RS1M score</h2>
      <div className="space-y-3">
        {countries.map((c, i) => {
          const isPos = roundedValue(c.rs1m) > 0
          const pct = Math.min(Math.abs(c.rs1m) * 40, 100)
          return (
            <div key={c.ticker}>
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-charcoal/65">{i + 1}</span>
                  <span className="text-sm font-mono font-medium text-charcoal">{c.ticker}</span>
                </div>
                <span className={`text-sm font-mono ${numberTone(c.rs1m)}`}>
                  {signedNumber(c.rs1m)}
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

export default function SectorLeaders({ meta, snapshot }: { meta: Meta; snapshot: Snapshot }) {
  return <><Sectors snapshot={snapshot} /><hr className="rule-subtle-bottom border-0 my-6" /><CountriesGlobal meta={meta} /></>
}
