'use client'

import { useIntelligent } from './IntelligentProvider'
import { BENCHMARKS } from '@/lib/industryBenchmarks'
import { BASKETS } from '@/lib/liveMultiples'
import BenchmarkTooltip from './BenchmarkTooltip'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/50 mb-4">
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

function ValuationRow({ label, value, tooltip }: { label: string; value: string; tooltip: RowTooltip }) {
  const multiple = value.match(/~?\d+(?:\.\d+)?×/)?.[0] ?? value
  const periodMatch = value.match(/Q[1-4]\s+20\d{2}/)?.[0]
  const interpretation = value.split(/\s+—\s+/).slice(1).join(' — ').trim()

  return (
    <div className="py-3 border-b border-charcoal/8">
      <div className="flex items-center gap-1 mb-1">
        <p className="font-mono text-[0.58rem] tracking-[0.14em] uppercase text-charcoal/55">{label}</p>
        <BenchmarkTooltip {...tooltip} />
      </div>
      <p className="font-serif text-[1.25rem] leading-none text-charcoal">{multiple} <span className="font-mono text-[0.62rem] font-normal text-charcoal/55">NTM P/S</span></p>
      <p className="font-mono text-[0.6rem] text-charcoal/50 mt-1">{periodMatch ? `${periodMatch} basket median` : 'Live basket median'}</p>
      {interpretation && <p className="font-mono text-[0.68rem] text-charcoal/70 leading-relaxed mt-1.5">{interpretation}</p>}
    </div>
  )
}

function CapexRow({ label, value, detail, color, tooltip }: {
  label: string; value: string; detail: string; color: string; tooltip: RowTooltip
}) {
  return (
    <div className="py-3 border-b border-charcoal/8">
      <div className="flex items-center gap-1 mb-1">
        <p className="font-mono text-[0.58rem] tracking-[0.14em] uppercase text-charcoal/55">{label}</p>
        <BenchmarkTooltip {...tooltip} />
      </div>
      <p className="font-mono text-[0.82rem] font-semibold leading-snug" style={{ color }}>{value}</p>
      <p className="font-mono text-[0.64rem] text-charcoal/60 leading-relaxed mt-1">{detail}</p>
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
              <p className="text-[0.58rem] font-mono uppercase tracking-[0.1em] text-charcoal/50 mb-0.5">{label}</p>
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
                <span className="text-[0.58rem] font-mono uppercase tracking-[0.1em] text-charcoal/50">{label}</span>
              </div>
              <span className="font-mono text-[9px] font-semibold tracking-[0.08em] flex-shrink-0"
                style={{ color: statusColor(win.status) }}>{win.status}</span>
            </div>
            {/* Row 2: reason — block-level paragraph, full column width, no flex siblings */}
            <p className="text-[0.64rem] font-mono text-charcoal/65 leading-relaxed pl-5">{win.reason}</p>
          </div>
        ))}
      </div>

      <hr className="border-charcoal/10 my-6" />

      <SectionLabel>Cloud Valuations</SectionLabel>
      <div>
        <ValuationRow label="Public Cloud" value={cloudValuations.publicCloud}
          tooltip={{ source: `Yahoo Finance basket: ${BASKETS.publicCloud.tickers.join(', ')}`, lastUpdated: 'updates every 30 min', isLive: true }} />
        <ValuationRow label="SaaS Average" value={cloudValuations.saasAverage}
          tooltip={{ source: `Yahoo Finance basket: ${BASKETS.saas.tickers.join(', ')}`, lastUpdated: 'updates every 30 min', isLive: true }} />
        <ValuationRow label="AI Infrastructure" value={cloudValuations.aiInfrastructure}
          tooltip={{ source: `Yahoo Finance basket: ${BASKETS.aiInfra.tickers.join(', ')}`, lastUpdated: 'updates every 30 min', isLive: true }} />
      </div>

      <hr className="border-charcoal/10 my-6" />

      <SectionLabel>Hyperscaler CapEx</SectionLabel>
      <div>
        <CapexRow label="Hyperscaler spend" value={hyperscalerCapex.trend} detail="Amazon, Microsoft, Alphabet, and Meta 2026 investment direction."
          color={hyperscalerCapex.trend === 'Expanding' ? '#6B8E7F' : hyperscalerCapex.trend === 'Contracting' ? '#C0443A' : '#888'}
          tooltip={{ source: BENCHMARKS.hyperscalerCapexTrend.source, sourceUrl: BENCHMARKS.hyperscalerCapexTrend.sourceUrl, lastUpdated: BENCHMARKS.hyperscalerCapexTrend.lastUpdated }} />
        <CapexRow label="GPU supply" value="Blackwell constrained" detail={hyperscalerCapex.gpuSupplyStatus} color="#9A762A"
          tooltip={{ source: BENCHMARKS.gpuSupplyStatus.source, sourceUrl: BENCHMARKS.gpuSupplyStatus.sourceUrl, lastUpdated: BENCHMARKS.gpuSupplyStatus.lastUpdated }} />
        <CapexRow label="Data-center capacity" value="Tightening" detail={hyperscalerCapex.dataCenterGrowth} color="#6B8E7F"
          tooltip={{ source: BENCHMARKS.dataCenterConstructionYoY.source, sourceUrl: BENCHMARKS.dataCenterConstructionYoY.sourceUrl, lastUpdated: BENCHMARKS.dataCenterConstructionYoY.lastUpdated }} />
      </div>
    </div>
  )
}

/** Right column: Risk Alerts */
export function IntelligentRight() {
  const { data, loading } = useIntelligent()

  if (loading) return (
    <div><SectionLabel>Risk Alerts</SectionLabel><Skeleton count={2} /></div>
  )

  if (!data) return null
  const { riskAlerts } = data

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
                  <p className="font-mono text-[0.68rem] text-charcoal/65 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Default: everything (legacy, unused in current layout) */
export default function IntelligentSignals() {
  return <><IntelligentMiddle /><hr className="border-charcoal/10 my-6" /><IntelligentRight /></>
}
