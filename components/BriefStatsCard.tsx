import type { Meta } from '@/lib/types'

interface Props { meta: Meta }

const SAGE   = '#6B8E7F'
const GOLD   = '#C9A961'
const RED    = '#C0443A'

function signalColor(g: string) {
  if (g === 'Risk-On')  return SAGE
  if (g === 'Hold')     return GOLD
  return RED
}

function trendArrow(v: string) {
  if (v === 'Up')   return '↑'
  if (v === 'Down') return '↓'
  return '↔'
}

function trendColor(v: string) {
  if (v === 'Up')   return SAGE
  if (v === 'Down') return RED
  return GOLD
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-baseline justify-between py-[0.32rem]" style={{ borderBottom: '1px solid rgba(0,0,0,0.055)' }}>
      <span className="font-mono text-[0.48rem] tracking-[0.16em] uppercase" style={{ color: '#888' }}>
        {label}
      </span>
      <span className="font-mono text-[0.75rem] font-medium" style={{ color: color ?? '#191714' }}>
        {value}
      </span>
    </div>
  )
}

export default function BriefStatsCard({ meta }: Props) {
  const { exposure, breadth, momentum_env, risk, trend } = meta.status
  const sigColor = signalColor(exposure.guidance)

  return (
    <div
      className="p-4 flex flex-col gap-3"
      style={{
        background: '#f5eee9',
        borderRight: '1px solid rgba(0,0,0,0.09)',
      }}
    >
      {/* Signal header */}
      <div>
        <p className="font-mono text-[0.46rem] tracking-[0.22em] uppercase mb-1.5" style={{ color: '#888' }}>
          Signal
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: sigColor }}
          />
          <span className="font-serif italic text-[1.05rem] font-normal leading-none" style={{ color: sigColor }}>
            {exposure.guidance}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col">
        <Row
          label="Exposure"
          value={`${exposure.level}/100`}
          color={exposure.level >= 60 ? SAGE : exposure.level >= 35 ? GOLD : RED}
        />
        <Row
          label="Risk"
          value={risk.volatility}
          color={risk.volatility === 'Normal' ? SAGE : risk.volatility === 'Elevated' ? GOLD : RED}
        />
        <Row
          label="Momentum"
          value={momentum_env.label}
        />
        <Row
          label={`Breadth ${breadth.above_50d_pct.toFixed(0)}%`}
          value={breadth.breadth_label}
          color={breadth.above_50d_pct >= 55 ? SAGE : breadth.above_50d_pct >= 40 ? GOLD : RED}
        />
        <Row
          label="Volatility"
          value={risk.volatility}
          color={risk.volatility === 'Normal' ? SAGE : risk.volatility === 'Elevated' ? GOLD : RED}
        />
      </div>

      {/* Trend row */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.055)', paddingTop: '0.45rem' }}>
        <p className="font-mono text-[0.46rem] tracking-[0.16em] uppercase mb-1" style={{ color: '#888' }}>
          Trend
        </p>
        <div className="flex items-center gap-3">
          {[
            { t: 'LT', v: trend.long_term },
            { t: 'IT', v: trend.intermediate_term },
            { t: 'ST', v: trend.short_term },
          ].map(({ t, v }) => (
            <div key={t} className="flex items-baseline gap-0.5">
              <span className="font-mono text-[0.46rem] tracking-[0.1em] uppercase" style={{ color: '#aaa' }}>{t}</span>
              <span className="font-mono text-[0.78rem] font-medium" style={{ color: trendColor(v) }}>
                {trendArrow(v)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamp */}
      <p className="font-mono text-[0.44rem] tracking-[0.08em] mt-auto" style={{ color: 'rgba(0,0,0,0.2)' }}>
        {new Date(meta.generated_at_utc).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
          timeZone: 'America/New_York', timeZoneName: 'short',
        })}
      </p>
    </div>
  )
}
