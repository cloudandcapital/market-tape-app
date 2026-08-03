'use client'

import { useIntelligent } from './IntelligentProvider'
import { BENCHMARKS } from '@/lib/industryBenchmarks'
import { BASKETS, QUARTERLY_MULTIPLES } from '@/lib/liveMultiples'
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

function valuationTooltip(value: string, basket: keyof typeof BASKETS): RowTooltip {
  if (/Q[1-4]\s+20\d{2}/.test(value)) {
    return {
      source: `${QUARTERLY_MULTIPLES[basket].source} · ${BASKETS[basket].tickers.join(', ')}`,
      lastUpdated: QUARTERLY_MULTIPLES[basket].lastUpdated,
    }
  }
  return {
    source: `Yahoo Finance basket: ${BASKETS[basket].tickers.join(', ')}`,
    lastUpdated: 'updates every 30 min',
    isLive: true,
  }
}

function ValuationRow({ label, value, tooltip }: { label: string; value: string; tooltip: RowTooltip }) {
  const multiple = value.match(/~?\d+(?:\.\d+)?×/)?.[0] ?? value
  const periodMatch = value.match(/Q[1-4]\s+20\d{2}/)?.[0]
  const interpretation = value.split(/\s+—\s+/).slice(1).join(' — ').trim()

  return (
    <div className="py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-[0.58rem] tracking-[0.14em] uppercase text-charcoal/55">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className="font-serif text-[1.15rem] leading-none text-charcoal">{multiple} <span className="font-mono text-[0.62rem] font-normal text-charcoal/55">NTM P/S</span></p>
          <BenchmarkTooltip {...tooltip} />
        </div>
      </div>
      <p className="font-mono text-[0.6rem] text-charcoal/50 mt-0.5">{periodMatch ? `${periodMatch} basket median` : 'Live basket median'}</p>
      {interpretation && <p className="font-mono text-[0.68rem] text-charcoal/70 leading-snug mt-1">{interpretation}</p>}
    </div>
  )
}

function CapexRow({ label, value, detail, color, tooltip }: {
  label: string; value: string; detail: string; color: string; tooltip: RowTooltip
}) {
  return (
    <div className="py-4 md:px-6 first:pl-0 last:pr-0">
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

export function FinOpsSignals() {
  const { data, loading } = useIntelligent()
  if (loading) return <div><SectionLabel>FinOps Signals</SectionLabel><Skeleton /></div>
  if (!data) return null
  const { finopsSignals } = data

  return (
    <div>
      <SectionLabel>FinOps Signals</SectionLabel>
      <div className="rows-subtle">
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
    </div>
  )
}

export function CommitmentWindows() {
  const { data, loading } = useIntelligent()
  if (loading) return <div><SectionLabel>Commitment Windows</SectionLabel><Skeleton /></div>
  if (!data) return null
  const { commitmentWindows } = data

  return (
    <div>
      <SectionLabel>Commitment Windows</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 strip-dividers">
        {[
          { label: '1-Year Commitment', win: commitmentWindows.oneYear },
          { label: '3-Year Commitment', win: commitmentWindows.threeYear },
          { label: 'Spot / On-Demand',  win: commitmentWindows.spot },
        ].map(({ label, win }) => (
          <div key={label} className="py-4 md:px-6 first:pl-0 last:pr-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[0.62rem] font-mono uppercase tracking-[0.12em] text-charcoal/55">{label}</span>
              <span className="font-mono text-[9px] font-semibold tracking-[0.08em] flex-shrink-0"
                style={{ color: statusColor(win.status) }}>{win.status.charAt(0) + win.status.slice(1).toLowerCase()}</span>
            </div>
            <p className="text-[0.68rem] font-mono text-charcoal/70 leading-relaxed">{win.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CloudValuations() {
  const { data, loading } = useIntelligent()
  if (loading) return <div><SectionLabel>Cloud Valuations</SectionLabel><Skeleton /></div>
  if (!data) return null
  const { cloudValuations } = data
  return (
    <div>
      <SectionLabel>Cloud Valuations</SectionLabel>
      <div className="rows-subtle">
        <ValuationRow label="Public Cloud" value={cloudValuations.publicCloud}
          tooltip={valuationTooltip(cloudValuations.publicCloud, 'publicCloud')} />
        <ValuationRow label="SaaS Average" value={cloudValuations.saasAverage}
          tooltip={valuationTooltip(cloudValuations.saasAverage, 'saas')} />
        <ValuationRow label="AI Infrastructure" value={cloudValuations.aiInfrastructure}
          tooltip={valuationTooltip(cloudValuations.aiInfrastructure, 'aiInfra')} />
      </div>
    </div>
  )
}

export function HyperscalerCapex() {
  const { data, loading } = useIntelligent()
  if (loading) return <div><SectionLabel>Hyperscaler CapEx</SectionLabel><Skeleton /></div>
  if (!data) return null
  const { hyperscalerCapex } = data
  const capexMatch = hyperscalerCapex.trend.match(/\b(?:Expanding|Stable|Contracting)\b/i)?.[0]
  const capexDirection = capexMatch ? capexMatch.charAt(0).toUpperCase() + capexMatch.slice(1).toLowerCase() : hyperscalerCapex.trend
  return (
    <div>
      <SectionLabel>Hyperscaler CapEx</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 strip-dividers">
        <CapexRow label="Hyperscaler spend" value={capexDirection} detail="Amazon, Microsoft, Alphabet, and Meta 2026 investment direction."
          color={capexDirection.toLowerCase() === 'expanding' ? '#4A6B5F' : capexDirection.toLowerCase() === 'contracting' ? '#A93A33' : '#666'}
          tooltip={{ source: BENCHMARKS.hyperscalerCapexTrend.source, sourceUrl: BENCHMARKS.hyperscalerCapexTrend.sourceUrl, lastUpdated: BENCHMARKS.hyperscalerCapexTrend.lastUpdated }} />
        <CapexRow label="GPU supply" value="Blackwell constrained" detail={hyperscalerCapex.gpuSupplyStatus} color="#9A762A"
          tooltip={{ source: BENCHMARKS.gpuSupplyStatus.source, sourceUrl: BENCHMARKS.gpuSupplyStatus.sourceUrl, lastUpdated: BENCHMARKS.gpuSupplyStatus.lastUpdated }} />
        <CapexRow label="Data-center capacity" value="Tightening" detail={hyperscalerCapex.dataCenterGrowth} color="#6B8E7F"
          tooltip={{ source: BENCHMARKS.dataCenterConstructionYoY.source, sourceUrl: BENCHMARKS.dataCenterConstructionYoY.sourceUrl, lastUpdated: BENCHMARKS.dataCenterConstructionYoY.lastUpdated }} />
      </div>
    </div>
  )
}

export function RiskAlerts() {
  const { data, loading } = useIntelligent()

  if (loading) return (
    <div><SectionLabel>Risk &amp; Opportunity</SectionLabel><Skeleton count={2} /></div>
  )

  if (!data) return null
  const { riskAlerts, cloudValuations } = data

  const sourceForAlert = (title: string): RowTooltip => {
    if (/GPU/i.test(title)) {
      return { source: BENCHMARKS.gpuSupplyStatus.source, sourceUrl: BENCHMARKS.gpuSupplyStatus.sourceUrl, lastUpdated: BENCHMARKS.gpuSupplyStatus.lastUpdated }
    }
    if (/SaaS/i.test(title)) return valuationTooltip(cloudValuations.saasAverage, 'saas')
    return { source: BENCHMARKS.dataCenterConstructionYoY.source, sourceUrl: BENCHMARKS.dataCenterConstructionYoY.sourceUrl, lastUpdated: BENCHMARKS.dataCenterConstructionYoY.lastUpdated }
  }

  return (
    <div>
      {riskAlerts && riskAlerts.length > 0 && (
        <>
          <SectionLabel>Risk &amp; Opportunity</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 strip-dividers">
            {riskAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-2 py-4 md:px-6 first:pl-0 last:pr-0">
                <span className="text-[13px] flex-shrink-0 mt-0.5">
                  {alert.type === 'warning' ? '⚠️' : '✅'}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="font-mono text-[0.7rem] font-semibold text-charcoal/80 leading-none">{alert.title}</p>
                    <BenchmarkTooltip {...sourceForAlert(alert.title)} />
                  </div>
                  <p className="font-mono text-[0.68rem] text-charcoal/65 leading-snug">{alert.message}</p>
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
  return <><FinOpsSignals /><CommitmentWindows /><CloudValuations /><HyperscalerCapex /><RiskAlerts /></>
}
