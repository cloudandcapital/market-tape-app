import type { Meta } from '@/lib/types'

interface Props { meta: Meta }

function signalColor(guidance: string): string {
  if (guidance === 'Risk-On') return '#6B8E7F'
  if (guidance === 'Hold')    return '#C9A961'
  return '#C0443A'
}

function Row({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="py-[0.7rem]" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      <p className="font-mono text-[0.5rem] tracking-[0.18em] uppercase mb-[0.3rem]" style={{ color: '#4A4A4A' }}>
        {label}
      </p>
      <p className="font-mono text-[0.82rem] font-medium leading-none" style={{ color: color ?? '#000' }}>
        {value}
      </p>
      {sub && (
        <p className="font-mono text-[0.52rem] tracking-[0.08em] mt-[0.25rem]" style={{ color: '#8B8B8B' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export default function BriefStatsCard({ meta }: Props) {
  const { exposure, breadth, momentum_env, risk, trend } = meta.status

  return (
    <div
      className="p-6 flex flex-col justify-between"
      style={{ background: 'rgba(245,238,233,0.96)', minHeight: '100%' }}
    >
      <div>
        <p className="font-mono text-[0.5rem] tracking-[0.22em] uppercase mb-4" style={{ color: '#6B8E7F' }}>
          Quick Signal
        </p>

        <Row
          label="Signal"
          value={exposure.guidance}
          color={signalColor(exposure.guidance)}
        />
        <Row
          label="Exposure"
          value={`${exposure.level} / 100`}
          color={exposure.level >= 60 ? '#6B8E7F' : exposure.level >= 35 ? '#C9A961' : '#C0443A'}
        />
        <Row
          label="Momentum"
          value={momentum_env.label}
          sub={`Score: ${momentum_env.score}/100`}
        />
        <Row
          label="Breadth"
          value={breadth.breadth_label}
          sub={`${breadth.above_50d_pct.toFixed(0)}% above 50d MA`}
          color={breadth.above_50d_pct >= 55 ? '#6B8E7F' : breadth.above_50d_pct >= 40 ? '#C9A961' : '#C0443A'}
        />
        <Row
          label="Volatility"
          value={risk.volatility}
          color={risk.volatility === 'Normal' ? '#6B8E7F' : risk.volatility === 'Elevated' ? '#C9A961' : '#C0443A'}
        />
        <div className="pt-[0.7rem]">
          <p className="font-mono text-[0.5rem] tracking-[0.18em] uppercase mb-[0.3rem]" style={{ color: '#4A4A4A' }}>
            Trend
          </p>
          <div className="flex flex-col gap-[0.2rem]">
            {[
              { label: 'LT', value: trend.long_term },
              { label: 'IT', value: trend.intermediate_term },
              { label: 'ST', value: trend.short_term },
            ].map(t => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="font-mono text-[0.5rem] tracking-[0.1em]" style={{ color: '#8B8B8B' }}>{t.label}</span>
                <span
                  className="font-mono text-[0.72rem] font-medium"
                  style={{ color: t.value === 'Up' ? '#6B8E7F' : t.value === 'Down' ? '#C0443A' : '#C9A961' }}
                >
                  {t.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="font-mono text-[0.48rem] tracking-[0.1em] mt-5" style={{ color: 'rgba(0,0,0,0.25)' }}>
        Updated {new Date(meta.generated_at_utc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' })}
      </p>
    </div>
  )
}
