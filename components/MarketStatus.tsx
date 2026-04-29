import type { Meta, Snapshot } from '@/lib/types'
import { guidanceColor, getRow, pctLabel } from '@/lib/data'

function InternalRow({
  label, value, change, invertColor = false, arrow,
}: { label: string; value: string; change: number; invertColor?: boolean; arrow?: string }) {
  const positive = invertColor ? change < 0 : change > 0
  const changeColor = Math.abs(change) < 0.05 ? '#888' : positive ? '#6B8E7F' : '#C0443A'
  const arrowColor = invertColor
    ? (change < -0.5 ? '#6B8E7F' : change > 0.5 ? '#C0443A' : '#888')
    : (change > 0.5 ? '#6B8E7F' : change < -0.5 ? '#C0443A' : '#888')
  const sign = change > 0 ? '+' : ''
  return (
    <div className="flex items-baseline justify-between py-[0.28rem]">
      <div className="flex items-baseline gap-1">
        <span className="text-[10px] font-mono text-charcoal/40">{label}</span>
        {arrow && <span className="text-[10px] font-mono font-medium" style={{ color: arrowColor }}>{arrow}</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xs font-mono font-medium text-charcoal">{value}</span>
        <span className="text-[10px] font-mono" style={{ color: changeColor }}>
          {sign}{change.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

export default function MarketStatus({ meta, snapshot }: { meta: Meta; snapshot: Snapshot }) {
  const { status } = meta
  const { exposure, trend, risk, breadth, momentum_env } = status

  const vix = getRow(snapshot, '^VIX')
  const dxy = getRow(snapshot, 'DXY')
  const uso = getRow(snapshot, 'USO')
  const gld = getRow(snapshot, 'GLD')
  const tnx = getRow(snapshot, '^TNX')

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
              exposure.guidance === 'Risk-On' ? 'bg-sage'
              : exposure.guidance === 'Defensive' ? 'bg-loss'
              : 'bg-charcoal/30'
            }`}
            style={{ width: `${exposure.level}%` }}
          />
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-xs font-mono text-charcoal/40">{exposure.level}/100</span>
          <span className="text-[9px] font-mono text-charcoal/25">0 = max defensive · 100 = max risk-on</span>
        </div>
      </div>

      <hr className="border-charcoal/10 mb-6" />

      {/* Trend */}
      <div className="mb-6">
        <p className="text-sm font-mono text-charcoal/60 mb-3">Trend</p>
        <div className="space-y-2">
          {[
            { label: 'Long-term',    val: trend.long_term },
            { label: 'Intermediate', val: trend.intermediate_term },
            { label: 'Short-term',   val: trend.short_term },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs font-mono text-charcoal/40">{label}</span>
              <span className={`text-xs font-mono font-medium ${
                val === 'Up' ? 'text-sage' : val === 'Down' ? 'text-loss' : 'text-charcoal/50'
              }`}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-charcoal/10 mb-6" />

      {/* Breadth */}
      <div className="mb-6">
        <div className="flex justify-between mb-3">
          <p className="text-sm font-mono text-charcoal/60">Breadth</p>
          <span className={`text-xs font-mono ${
            breadth.breadth_label === 'Strong' ? 'text-sage'
            : breadth.breadth_label === 'Weak' ? 'text-loss'
            : 'text-charcoal/50'
          }`}>{breadth.breadth_label}</span>
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
      <div className="mb-6">
        <p className="text-sm font-mono text-charcoal/60 mb-3">Risk Environment</p>
        <div className="space-y-2">
          {[
            { label: 'Volatility', val: risk.volatility },
            { label: 'Sentiment',  val: risk.sentiment },
            { label: 'Momentum',   val: risk.momentum },
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
            <span className="text-sm font-serif font-semibold text-charcoal">{momentum_env.label}</span>
          </div>
          <div className="h-1 bg-charcoal/10 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-charcoal/30 rounded-full" style={{ width: `${momentum_env.score}%` }} />
          </div>
        </div>
      </div>

      <hr className="border-charcoal/10 mb-6" />

      {/* Market Internals */}
      <div>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-3">
          Market Internals
        </p>
        <div className="divide-y divide-charcoal/8">
          {vix && (
            <InternalRow
              label={vix.last > 30 ? 'VIX ⚠' : 'VIX'}
              value={vix.last.toFixed(1)}
              change={vix.d1_pct}
              invertColor
              arrow={vix.d1_pct < -0.5 ? '↓' : vix.d1_pct > 0.5 ? '↑' : '→'}
            />
          )}
          {tnx && (
            <InternalRow label="10Y Yield" value={`${tnx.last.toFixed(2)}%`} change={tnx.d1_pct} />
          )}
          {dxy && (
            <InternalRow label="Dollar (DXY)" value={dxy.last.toFixed(1)} change={dxy.d20_pct} />
          )}
          {gld && (
            <InternalRow label="Gold (GLD)" value={`$${gld.last.toFixed(0)}`} change={gld.d1_pct} />
          )}
          {uso && (
            <InternalRow label="Oil (USO)" value={`$${uso.last.toFixed(1)}`} change={uso.d1_pct} />
          )}
        </div>
      </div>
    </div>
  )
}
