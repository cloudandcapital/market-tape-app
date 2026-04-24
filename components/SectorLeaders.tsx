import type { Meta } from '@/lib/types'

export default function SectorLeaders({ meta }: { meta: Meta }) {
  const { sectors, countries } = meta.leaders

  const rsBar = (rs: number) => {
    const pct = Math.min(Math.abs(rs) * 40, 100)
    const isPos = rs >= 0
    return { pct, isPos }
  }

  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
        Leaders · RS1M vs SPY
      </h2>

      <p className="text-xs font-mono text-charcoal/40 mb-3">Sectors</p>
      <div className="space-y-4 mb-6">
        {sectors.map((s, i) => {
          const { pct, isPos } = rsBar(s.rs1m)
          return (
            <div key={s.ticker}>
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-charcoal/30">{i + 1}</span>
                  <span className="text-sm font-mono font-semibold text-charcoal">{s.ticker}</span>
                </div>
                <span className={`text-sm font-mono font-medium ${isPos ? 'text-sage' : 'text-loss'}`}>
                  {isPos ? '+' : ''}{s.rs1m.toFixed(2)}
                </span>
              </div>
              <div className="h-0.5 bg-charcoal/8 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isPos ? 'bg-sage' : 'bg-loss'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-charcoal/35 mt-0.5 truncate">{s.name}</p>
            </div>
          )
        })}
      </div>

      <hr className="border-charcoal/10 mb-5" />

      <p className="text-xs font-mono text-charcoal/40 mb-3">Countries / Global</p>
      <div className="space-y-3">
        {countries.map((c, i) => {
          const { pct, isPos } = rsBar(c.rs1m)
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
                <div
                  className={`h-full rounded-full ${isPos ? 'bg-sage' : 'bg-loss'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
