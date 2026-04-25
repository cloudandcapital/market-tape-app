import type { Meta } from '@/lib/types'

interface Props { meta: Meta }

export default function SectorRotation({ meta }: Props) {
  const sectors = meta.leaders.sectors
  if (!sectors || sectors.length < 2) return null

  const count = Math.min(3, Math.floor(sectors.length / 2))
  const strong = sectors.slice(0, count)
  const weak = sectors.slice(-count)

  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
        Sector Rotation
      </h2>

      {/* Strength */}
      <p className="text-[9px] font-mono tracking-[0.14em] uppercase text-sage mb-1">
        ↗ Strength
      </p>
      <div className="space-y-0 divide-y divide-charcoal/8 mb-4">
        {strong.map(s => (
          <div key={s.ticker} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-mono font-semibold text-charcoal flex-shrink-0">{s.ticker}</span>
              <span className="text-[10px] font-mono text-charcoal/35 truncate">{s.name}</span>
            </div>
            <span className="text-xs font-mono text-sage font-medium flex-shrink-0 ml-2">
              +{s.rs1m.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Weakness */}
      <p className="text-[9px] font-mono tracking-[0.14em] uppercase text-loss mb-1">
        ↘ Weakness
      </p>
      <div className="space-y-0 divide-y divide-charcoal/8">
        {weak.map(s => (
          <div key={s.ticker} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-mono font-medium text-charcoal flex-shrink-0">{s.ticker}</span>
              <span className="text-[10px] font-mono text-charcoal/35 truncate">{s.name}</span>
            </div>
            <span className="text-xs font-mono text-loss flex-shrink-0 ml-2">
              {s.rs1m > 0 ? '+' : ''}{s.rs1m.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
