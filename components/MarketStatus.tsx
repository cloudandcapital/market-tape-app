import type { Meta } from '@/lib/types'
import { guidanceColor } from '@/lib/data'

export default function MarketStatus({ meta }: { meta: Meta }) {
  const { status } = meta
  const { exposure, trend, risk, breadth, momentum_env } = status

  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
        Market Status
      </h2>

      {/* Exposure */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-mono text-charcoal/60">Exposure</span>
          <span className={`text-xl font-serif font-semibold ${guidanceColor(exposure.guidance)}`}>
            {exposure.guidance}
          </span>
        </div>
        <div className="h-1 bg-charcoal/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              exposure.guidance === 'Risk-On'
                ? 'bg-sage'
                : exposure.guidance === 'Defensive'
                ? 'bg-loss'
                : 'bg-charcoal/30'
            }`}
            style={{ width: `${exposure.level}%` }}
          />
        </div>
        <span className="text-xs font-mono text-charcoal/40 mt-1 block">{exposure.level}/100</span>
      </div>

      <hr className="border-charcoal/10 mb-6" />

      {/* Trend */}
      <div className="mb-6">
        <p className="text-sm font-mono text-charcoal/60 mb-3">Trend</p>
        <div className="space-y-2">
          {[
            { label: 'Long-term', val: trend.long_term },
            { label: 'Intermediate', val: trend.intermediate_term },
            { label: 'Short-term', val: trend.short_term },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs font-mono text-charcoal/40">{label}</span>
              <span
                className={`text-xs font-mono font-medium ${
                  val === 'Up' ? 'text-sage' : val === 'Down' ? 'text-loss' : 'text-charcoal/50'
                }`}
              >
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-charcoal/10 mb-6" />

      {/* Breadth */}
      <div className="mb-6">
        <div className="flex justify-between mb-3">
          <p className="text-sm font-mono text-charcoal/60">Breadth</p>
          <span
            className={`text-xs font-mono ${
              breadth.breadth_label === 'Strong'
                ? 'text-sage'
                : breadth.breadth_label === 'Weak'
                ? 'text-loss'
                : 'text-charcoal/50'
            }`}
          >
            {breadth.breadth_label}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs font-mono text-charcoal/40">Above 20d MA</span>
            <span className="text-xs font-mono font-medium">{breadth.above_20d_pct.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-mono text-charcoal/40">Above 50d MA</span>
            <span className="text-xs font-mono font-medium">{breadth.above_50d_pct.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <hr className="border-charcoal/10 mb-6" />

      {/* Risk */}
      <div>
        <p className="text-sm font-mono text-charcoal/60 mb-3">Risk Environment</p>
        <div className="space-y-2">
          {[
            { label: 'Volatility', val: risk.volatility },
            { label: 'Sentiment', val: risk.sentiment },
            { label: 'Momentum', val: risk.momentum },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between">
              <span className="text-xs font-mono text-charcoal/40">{label}</span>
              <span className="text-xs font-mono font-medium text-charcoal">{val}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-charcoal/10">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-mono text-charcoal/40">Momentum Env</span>
            <span className="text-sm font-serif font-semibold text-charcoal">
              {momentum_env.label}
            </span>
          </div>
          <div className="h-1 bg-charcoal/10 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-charcoal/30 rounded-full"
              style={{ width: `${momentum_env.score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
