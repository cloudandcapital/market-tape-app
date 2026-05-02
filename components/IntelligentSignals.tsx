'use client'

import { useIntelligent } from './IntelligentProvider'
import { BENCHMARKS } from '@/lib/industryBenchmarks'
import { BASKETS } from '@/lib/liveMultiples'
import BenchmarkTooltip from './BenchmarkTooltip'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
      {children}
    </h2>
  )
}

interface RowTooltip {
  source: string
  sourceUrl?: string
  lastUpdated: string
  isLive?: boolean
}

function Row({ label, value, color, sub, tooltip }: {
  label: string; value: string; color?: string; sub?: string; tooltip?: RowTooltip
}) {
  return (
    <div className="flex items-start justify-between py-[0.32rem]" style={{ borderBottom: '1px solid rgba(0,0,0,0.055)' }}>
      <span className="font-mono text-[0.5rem] tracking-[0.16em] uppercase text-charcoal/40 flex-shrink-0 mt-0.5">{label}</span>
      <div className="text-right ml-2 min-w-0 flex items-baseline justify-end gap-0.5">
        <p className="font-mono text-[0.75rem] font-medium leading-snug" style={{ color: color ?? '#191714' }}>{value}</p>
        {tooltip && (
          <BenchmarkTooltip
            source={tooltip.source}
            sourceUrl={tooltip.sourceUrl}
            lastUpdated={tooltip.lastUpdated}
            isLive={tooltip.isLive}
          />
        )}
        {sub && <p className="font-mono text-[0.48rem] text-charcoal/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function statusColor(s: string): string {
  if (s === 'FAVORABLE' || s === 'SAFE') return '#16a34a'
  if (s === 'RISKY')   return '#dc2626'
  if (s === 'HOLD')    return '#ca8a04'
  return '#ca8a04' // CAUTION
}

function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-3 bg-charcoal/8 rounded" style={{ width: `${55 + i * 14}%` }} />
      ))}
    </div>
  )
}

/** Middle column: FinOps Signals + Commitment Windows + Cloud Valuations + Hyperscaler CapEx */
export function IntelligentMiddle() {
  const { data, loading } = useIntelligent()

  if (loading) return (
    <div className="space-y-8">
      {['FinOps Signals', 'Commitment Windows', 'Cloud Valuations', 'Hyperscaler CapEx'].map(l => (
        <div key={l}><SectionLabel>{l}</SectionLabel><Skeleton /></div>
      ))}
    </div>
  )

  if (!data) return null
  const { finopsSignals, commitmentWindows, cloudValuations, hyperscalerCapex } = data

  return (
    <div>
      <SectionLabel>FinOps Signals</SectionLabel>
      <div className="divide-y divide-charcoal/8">
        {[
          { emoji: '☁️', label: 'Cloud Spend',    text: finopsSignals.cloudSpend },
          { emoji: '💰', label: 'SaaS Renewals',  text: finopsSignals.saasRenewals },
          { emoji: '🔧', label: 'Infrastructure', text: finopsSignals.infrastructure },
        ].map(({ emoji, label, text }) => (
          <div key={label} className="py-2.5 flex items-start gap-2">
            <span className="text-[11px] flex-shrink-0 mt-0.5">{emoji}</span>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.1em] text-charcoal/35 mb-0.5">{label}</p>
              <p className="text-[0.76rem] font-mono text-charcoal/75 leading-snug">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-charcoal/10 my-6" />

      <SectionLabel>Commitment Windows</SectionLabel>
      <div className="divide-y divide-charcoal/8">
        {[
          { emoji: '☁️', label: '1-Year Reserved', win: commitmentWindows.oneYear },
          { emoji: '💰', label: '3-Year Commits',  win: commitmentWindows.threeYear },
          { emoji: '🔧', label: 'Spot/On-Demand',  win: commitmentWindows.spot },
        ].map(({ emoji, label, win }) => (
          <div key={label} className="py-2.5">
            {/* Row 1: label + badge — short content, no flex competition */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] flex-shrink-0">{emoji}</span>
                <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-charcoal/35">{label}</span>
              </div>
              <span className="font-mono text-[9px] font-semibold tracking-[0.08em] flex-shrink-0"
                style={{ color: statusColor(win.status) }}>{win.status}</span>
            </div>
            {/* Row 2: reason — block-level paragraph, full column width, no flex siblings */}
            <p className="text-[9px] font-mono text-charcoal/50 leading-relaxed pl-5">{win.reason}</p>
          </div>
        ))}
      </div>

      <hr className="border-charcoal/10 my-6" />

      <SectionLabel>Cloud Valuations</SectionLabel>
      <div className="divide-y divide-charcoal/8">
        <Row label="Public Cloud"      value={cloudValuations.publicCloud}
          tooltip={{ source: `Yahoo Finance basket: ${BASKETS.publicCloud.tickers.join(', ')}`, lastUpdated: 'updates every 30 min', isLive: true }} />
        <Row label="SaaS Average"      value={cloudValuations.saasAverage}
          tooltip={{ source: `Yahoo Finance basket: ${BASKETS.saas.tickers.join(', ')}`, lastUpdated: 'updates every 30 min', isLive: true }} />
        <Row label="AI Infrastructure" value={cloudValuations.aiInfrastructure}
          tooltip={{ source: `Yahoo Finance basket: ${BASKETS.aiInfra.tickers.join(', ')}`, lastUpdated: 'updates every 30 min', isLive: true }} />
      </div>

      <hr className="border-charcoal/10 my-6" />

      <SectionLabel>Hyperscaler CapEx</SectionLabel>
      <div className="divide-y divide-charcoal/8">
        <Row label="AWS/Azure/GCP" value={hyperscalerCapex.trend}
          color={hyperscalerCapex.trend === 'Expanding' ? '#6B8E7F' : hyperscalerCapex.trend === 'Contracting' ? '#C0443A' : '#888'}
          tooltip={{ source: BENCHMARKS.hyperscalerCapexTrend.source, lastUpdated: BENCHMARKS.hyperscalerCapexTrend.lastUpdated }} />
        <Row label="GPU Supply"    value={hyperscalerCapex.gpuLeadTimes}  color="#C9A961"
          tooltip={{ source: BENCHMARKS.gpuSupplyStatus.source, sourceUrl: BENCHMARKS.gpuSupplyStatus.sourceUrl, lastUpdated: BENCHMARKS.gpuSupplyStatus.lastUpdated }} />
        <Row label="Data Center"   value={hyperscalerCapex.dataCenterGrowth} color="#6B8E7F"
          tooltip={{ source: BENCHMARKS.dataCenterConstructionYoY.source, sourceUrl: BENCHMARKS.dataCenterConstructionYoY.sourceUrl, lastUpdated: BENCHMARKS.dataCenterConstructionYoY.lastUpdated }} />
      </div>
      {hyperscalerCapex.detail && (
        <p className="font-mono text-[0.48rem] tracking-[0.06em] text-charcoal/30 mt-2 leading-relaxed">
          {hyperscalerCapex.detail}
        </p>
      )}
    </div>
  )
}

/** Right column: Risk Alerts + Sector Insights */
export function IntelligentRight() {
  const { data, loading } = useIntelligent()

  if (loading) return (
    <div className="space-y-6">
      <div><SectionLabel>Risk Alerts</SectionLabel><Skeleton count={2} /></div>
      <div><SectionLabel>Sector Insights</SectionLabel><Skeleton count={4} /></div>
    </div>
  )

  if (!data) return null
  const { riskAlerts, sectorInsights } = data

  return (
    <div>
      {riskAlerts && riskAlerts.length > 0 && (
        <>
          <SectionLabel>Risk Alerts</SectionLabel>
          <div className="space-y-3 mb-0">
            {riskAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[13px] flex-shrink-0 mt-0.5">
                  {alert.type === 'warning' ? '⚠️' : '✅'}
                </span>
                <div>
                  <p className="font-mono text-[0.7rem] font-semibold text-charcoal/80 leading-none mb-1">{alert.title}</p>
                  <p className="font-mono text-[0.65rem] text-charcoal/50 leading-snug">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {sectorInsights && (
        <>
          <hr className="border-charcoal/10 my-6" />
          <SectionLabel>Sector Insights</SectionLabel>
          <p className="font-mono text-[0.72rem] text-charcoal/60 leading-relaxed">{sectorInsights}</p>
        </>
      )}
    </div>
  )
}

/** Default: everything (legacy, unused in current layout) */
export default function IntelligentSignals() {
  return <><IntelligentMiddle /><hr className="border-charcoal/10 my-6" /><IntelligentRight /></>
}
