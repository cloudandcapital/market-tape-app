import type { Meta, Snapshot } from '@/lib/types'
import { getRow } from '@/lib/data'

interface Rec { label: string; color: string; note: string }
interface Recs { oneYear: Rec; threeYear: Rec; spot: Rec }

function getRecs(vix: number, guidance: string, longTrend: string): Recs {
  const bullish = vix < 20 && longTrend === 'Up' && guidance === 'Risk-On'
  const bearish = vix > 28 || guidance === 'Defensive'

  if (bullish) return {
    oneYear:   { label: 'FAVORABLE',  color: '#6B8E7F', note: 'Market supports 1Y commits' },
    threeYear: { label: 'CONSIDER',   color: '#C9A961', note: 'Evaluate multi-year carefully' },
    spot:      { label: 'SAFE',       color: '#6B8E7F', note: 'On-demand is low-risk' },
  }
  if (bearish) return {
    oneYear:   { label: 'HOLD',       color: '#C0443A', note: 'Pause non-critical commits' },
    threeYear: { label: 'HOLD',       color: '#C0443A', note: 'Wait for clearer signal' },
    spot:      { label: 'SAFE',       color: '#6B8E7F', note: 'On-demand is lowest-risk' },
  }
  return {
    oneYear:   { label: 'CAUTIOUS',   color: '#C9A961', note: 'Selective commits only' },
    threeYear: { label: 'HOLD',       color: '#C0443A', note: 'Not the right window' },
    spot:      { label: 'SAFE',       color: '#6B8E7F', note: 'On-demand is safest now' },
  }
}

export default function CommitmentWindow({ meta, snapshot }: { meta: Meta; snapshot: Snapshot }) {
  const vixRow = getRow(snapshot, '^VIX')
  const vix = vixRow?.last ?? 20
  const { guidance } = meta.status.exposure
  const longTrend = meta.status.trend.long_term
  const recs = getRecs(vix, guidance, longTrend)

  const rows = [
    { emoji: '☁️', label: '1-Year Reserved', rec: recs.oneYear },
    { emoji: '💰', label: '3-Year Commits',  rec: recs.threeYear },
    { emoji: '🔧', label: 'Spot/On-Demand',  rec: recs.spot },
  ]

  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-1">
        Commitment Windows
      </h2>
      <p className="text-[9px] font-mono text-charcoal/30 mb-4">
        VIX {vix.toFixed(1)} · {guidance} · LT {longTrend}
      </p>

      <div className="divide-y divide-charcoal/8">
        {rows.map(({ emoji, label, rec }) => (
          <div key={label} className="py-2.5 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <span className="text-[11px] flex-shrink-0 mt-0.5">{emoji}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-charcoal/50 leading-none mb-0.5">{label}</p>
                <p className="text-[9px] font-mono text-charcoal/30 truncate">{rec.note}</p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-semibold tracking-[0.08em] flex-shrink-0" style={{ color: rec.color }}>
              {rec.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
