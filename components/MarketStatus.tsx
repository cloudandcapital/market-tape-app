import type { Snapshot } from '@/lib/types'
import { getRow } from '@/lib/data'
import { yieldChangeBasisPoints } from '@/lib/marketIntegrity'
import { equityBreadth } from '@/lib/equityBreadth'

function InternalRow({
  label, value, change, invertColor = false, arrow, period = '1D', changeLabel,
}: { label: string; value: string; change: number; invertColor?: boolean; arrow?: string; period?: string; changeLabel?: string }) {
  const positive = invertColor ? change < 0 : change > 0
  const changeColor = Math.abs(change) < 0.05 ? 'var(--theme-muted, #6D6964)' : positive ? 'var(--theme-green, #4A6B5F)' : 'var(--theme-rose, #C0443A)'
  const arrowColor = invertColor
    ? (change < -0.5 ? 'var(--theme-green, #4A6B5F)' : change > 0.5 ? 'var(--theme-rose, #C0443A)' : 'var(--theme-muted, #6D6964)')
    : (change > 0.5 ? 'var(--theme-green, #4A6B5F)' : change < -0.5 ? 'var(--theme-rose, #C0443A)' : 'var(--theme-muted, #6D6964)')
  const sign = change > 0 ? '+' : ''
  return (
    <div className="flex items-baseline justify-between py-[0.28rem]">
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-mono text-charcoal/65">{label}</span>
        {arrow && <span className="text-sm font-mono font-medium" style={{ color: arrowColor }}>{arrow}</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-mono font-medium text-charcoal">{value}</span>
        <span className="text-sm font-mono" style={{ color: changeColor }}>
          {changeLabel ?? `${sign}${change.toFixed(1)}%`} · {period}
        </span>
      </div>
    </div>
  )
}

export default function MarketStatus({ snapshot, detailsOnly = false }: { snapshot: Snapshot; detailsOnly?: boolean }) {
  const equity = equityBreadth(snapshot)
  const risk = equity.risk
  const momentum_env = equity.momentum
  const exposure = { level: equity.level, band: equity.band }
  const trend = { long_term: equity.trends.long, intermediate_term: equity.trends.intermediate, short_term: equity.trends.short }
  const breadth = { above_20d_pct: equity.above20d, above_50d_pct: equity.above50d, breadth_label: equity.label }

  return (
    <div>
      <h2 className="text-sm font-mono tracking-[0.2em] uppercase text-charcoal/65 mb-4">
        {detailsOnly ? 'Market conditions' : 'Market Status'}
      </h2>

      {/* Exposure */}
      {!detailsOnly && <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-mono text-charcoal/65">Equity ETF breadth</span>
          <span className={`text-xl font-serif font-semibold ${exposure.level >= 70 ? 'text-sage-dark' : exposure.level < 40 ? 'text-loss' : 'text-charcoal'}`}>
            {exposure.band}
          </span>
        </div>
        <div className="h-1 bg-charcoal/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              exposure.level >= 70 ? 'bg-sage'
              : exposure.level < 40 ? 'bg-loss'
              : 'bg-charcoal/30'
            }`}
            style={{ width: `${exposure.level}%` }}
          />
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-sm font-mono text-charcoal/65">{exposure.level}/100</span>
          <span className="text-sm font-mono text-charcoal/65">{equity.positiveCount} of {equity.count} positive RS1M scores</span>
        </div>
        <p className="text-sm font-mono text-charcoal/65 mt-2 leading-relaxed">Equity ETFs only, counted once. SPY is the benchmark and is excluded. This is a tracked sample, not all US stocks or a target allocation.</p>
      </div>}

      {!detailsOnly && <hr className="rule-subtle-bottom border-0 mb-6" />}

      {/* Trend */}
      <div className="mb-6">
        <p className="text-sm font-mono text-charcoal/65 mb-3">Equity ETF trend</p>
        <div className="space-y-2">
          {[
            { label: '20-session median', val: trend.long_term },
            { label: '5-session median', val: trend.intermediate_term },
            { label: '1-session median', val: trend.short_term },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-sm font-mono text-charcoal/65">{label}</span>
              <span className={`text-sm font-mono font-medium ${
                val === 'Up' ? 'text-sage-dark' : val === 'Down' ? 'text-loss' : 'text-charcoal/65'
              }`}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <hr className="rule-subtle-bottom border-0 mb-6" />

      {/* Breadth */}
      {!detailsOnly && <div className="mb-6">
        <div className="flex justify-between mb-3">
          <p className="text-sm font-mono text-charcoal/65">Equity ETFs above averages</p>
          <span className={`text-sm font-mono ${
            breadth.breadth_label === 'Strong' ? 'text-sage-dark'
            : breadth.breadth_label === 'Weak' ? 'text-loss'
            : 'text-charcoal/65'
          }`}>{breadth.breadth_label}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-mono text-charcoal/65">Above 20d MA</span>
            <span className="text-sm font-mono font-medium">{breadth.above_20d_pct.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-mono text-charcoal/65">Above 50d MA</span>
            <span className="text-sm font-mono font-medium">{breadth.above_50d_pct.toFixed(0)}%</span>
          </div>
        </div>
      </div>}

      {!detailsOnly && <hr className="rule-subtle-bottom border-0 mb-6" />}

      {/* Risk */}
      <div className="mb-6">
        <p className="text-sm font-mono text-charcoal/65 mb-3">Risk Environment</p>
        <div className="space-y-2">
          {[
            { label: 'Volatility', val: risk.volatility },
            { label: 'Sentiment',  val: risk.sentiment },
            { label: 'Momentum',   val: risk.momentum },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between">
              <span className="text-sm font-mono text-charcoal/65">{label}</span>
              <span className="text-sm font-mono font-medium text-charcoal">{val}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 rule-subtle-top">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-mono text-charcoal/65">Momentum Env</span>
            <span className="text-sm font-serif font-semibold text-charcoal">{momentum_env.label}</span>
          </div>
          <div className="h-1 bg-charcoal/10 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-charcoal/30 rounded-full" style={{ width: `${momentum_env.score}%` }} />
          </div>
        </div>
      </div>

    </div>
  )
}

export function MarketInternals({ snapshot }: { snapshot: Snapshot }) {
  const vix = getRow(snapshot, '^VIX')
  const dxy = getRow(snapshot, 'DXY')
  const uso = getRow(snapshot, 'USO')
  const gld = getRow(snapshot, 'GLD')
  const tnx = getRow(snapshot, '^TNX')
  const yieldChange = tnx ? yieldChangeBasisPoints(tnx.last, tnx.d1_pct) : null

  return (
    <section aria-labelledby="market-internals-heading">
      <h2 id="market-internals-heading" className="text-sm font-mono tracking-[0.2em] uppercase text-charcoal/65 mb-3">
        Market Internals
      </h2>
      <div className="rows-subtle">
        {vix && <InternalRow label={vix.last > 30 ? 'VIX elevated' : 'VIX'} value={vix.last.toFixed(1)} change={vix.d1_pct} invertColor arrow={vix.d1_pct < -0.5 ? '↓' : vix.d1_pct > 0.5 ? '↑' : '→'} />}
        {tnx && <InternalRow label="10Y Yield" value={`${tnx.last.toFixed(2)}%`} change={tnx.d1_pct} changeLabel={yieldChange === null ? 'Unavailable' : `~${Math.round(yieldChange)} bp`} />}
        {dxy && <InternalRow label="Dollar (DXY)" value={dxy.last.toFixed(1)} change={dxy.d20_pct} period="20D" />}
        {gld && <InternalRow label="GLD gold ETF" value={`$${gld.last.toFixed(0)}`} change={gld.d1_pct} />}
        {uso && <InternalRow label="USO oil ETF" value={`$${uso.last.toFixed(1)}`} change={uso.d1_pct} />}
      </div>
    </section>
  )
}
