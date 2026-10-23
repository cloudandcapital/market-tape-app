'use client'

import { useIntelligent } from './IntelligentProvider'
import { riskAlertSource, validateRiskAlerts } from '@/lib/intelligentGuardrails'
import { BENCHMARKS } from '@/lib/industryBenchmarks'
import { type LiveMultiples, BASKETS, QUARTERLY_MULTIPLES } from '@/lib/liveMultiples'
import BenchmarkTooltip from './BenchmarkTooltip'
import DashboardIcon from './DashboardIcon'
import CloudReview from './CloudReview'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[0.72rem] font-mono tracking-[0.2em] uppercase text-charcoal/65 mb-4">
      {children}
    </h2>
  )
}

interface RowTooltip {
  source: string
  sourceUrl?: string
  sourceLinks?: { label: string; url: string }[]
  lastUpdated: string
  isLive?: boolean
}

function valuationTooltip(value: string, basket: keyof typeof BASKETS): RowTooltip {
  if (/^Unavailable\b/i.test(value)) {
    return {
      source: `${QUARTERLY_MULTIPLES[basket].source} · archived historical context`,
      lastUpdated: QUARTERLY_MULTIPLES[basket].lastUpdated,
    }
  }
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

function ValuationRow({ label, value, tooltip, basket }: { label: string; value: string; tooltip: RowTooltip; basket: keyof typeof BASKETS }) {
  const multiple = value.match(/~?\d+(?:\.\d+)?×/)?.[0] ?? value
  const periodMatch = value.match(/Q[1-4]\s+20\d{2}/)?.[0]
  const unavailable = /^Unavailable\b/i.test(value)
  const interpretation = value.split(/\s+—\s+/).slice(1).join(' — ').trim()

  return (
    <div className="py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-[0.72rem] tracking-[0.14em] uppercase text-charcoal/65">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className="font-serif text-[1.15rem] leading-none text-charcoal">{unavailable ? 'Unavailable' : multiple} {!unavailable && <span className="font-mono text-[0.72rem] font-normal text-charcoal/65">NTM P/S</span>}</p>
          <BenchmarkTooltip {...tooltip} />
        </div>
      </div>
      <p className="font-mono text-[0.72rem] text-charcoal/65 mt-0.5">{unavailable
        ? `Live multiple unavailable · Archived ${QUARTERLY_MULTIPLES[basket].value} as of ${QUARTERLY_MULTIPLES[basket].lastUpdated}`
        : periodMatch ? `${periodMatch} basket median` : 'Live basket median'}</p>
      {interpretation && <p className="font-mono text-[0.72rem] text-charcoal/70 leading-snug mt-1">{interpretation}</p>}
    </div>
  )
}

function CapexRow({ label, value, detail, color, tooltip }: {
  label: string; value: string; detail: string; color: string; tooltip: RowTooltip
}) {
  return (
    <div className="py-4 md:px-6 first:pl-0 last:pr-0">
      <div className="flex items-center gap-1 mb-1">
        <p className="font-mono text-[0.72rem] tracking-[0.14em] uppercase text-charcoal/65">{label}</p>
        <BenchmarkTooltip {...tooltip} />
      </div>
      <p className="font-mono text-[0.82rem] font-semibold leading-snug" style={{ color }}>{value}</p>
      <p className="font-mono text-[0.72rem] text-charcoal/65 leading-relaxed mt-1">{detail}</p>
    </div>
  )
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

function UnavailableAnalysis({ title }: { title: string }) {
  return <div><SectionLabel>{title}</SectionLabel><p className="font-mono text-[0.72rem] text-charcoal/65 leading-relaxed">Lumen analysis is temporarily unavailable.</p></div>
}

export function FinOpsSignals() {
  const { data, loading } = useIntelligent()
  if (loading) return <div><SectionLabel>FinOps Signals</SectionLabel><Skeleton /></div>
  if (!data) return <UnavailableAnalysis title="FinOps Signals" />
  const { finopsSignals } = data

  return (
    <div>
      <SectionLabel>FinOps Signals</SectionLabel>
      <div className="rows-subtle">
        {[
          { icon: 'cloud' as const, label: 'Cloud Spend', text: finopsSignals.cloudSpend },
          { icon: 'renewal' as const, label: 'SaaS Renewals', text: finopsSignals.saasRenewals },
          { icon: 'infrastructure' as const, label: 'Infrastructure', text: finopsSignals.infrastructure },
        ].map(({ icon, label, text }) => (
          <div key={label} className="py-2.5 flex items-start gap-2">
            <DashboardIcon name={icon} />
            <div>
              <p className="text-[0.72rem] font-mono uppercase tracking-[0.1em] text-charcoal/65 mb-0.5">{label}</p>
              <p className="text-[0.76rem] font-mono text-charcoal/75 leading-snug">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CommitmentWindows() {
  return <CloudReview />
}

export function CloudValuations({ multiples }: { multiples: LiveMultiples }) {
  // Numeric values always come from the source fetch, never from generated prose.
  if ([multiples.publicCloud, multiples.saas, multiples.aiInfra].every(value => /^Unavailable\b/i.test(value))) return null
  const cloudValuations = { publicCloud: multiples.publicCloud, saasAverage: multiples.saas, aiInfrastructure: multiples.aiInfra }
  return (
    <div>
      <SectionLabel>Cloud Valuations</SectionLabel>
      <div className="rows-subtle">
        <ValuationRow label="Public Cloud" value={cloudValuations.publicCloud} basket="publicCloud"
          tooltip={valuationTooltip(cloudValuations.publicCloud, 'publicCloud')} />
        <ValuationRow label="SaaS Average" value={cloudValuations.saasAverage} basket="saas"
          tooltip={valuationTooltip(cloudValuations.saasAverage, 'saas')} />
        <ValuationRow label="AI Infrastructure" value={cloudValuations.aiInfrastructure} basket="aiInfra"
          tooltip={valuationTooltip(cloudValuations.aiInfrastructure, 'aiInfra')} />
      </div>
    </div>
  )
}

export function HyperscalerCapex() {
  const capexDirection = BENCHMARKS.hyperscalerCapexTrend.value
  return (
    <div>
      <SectionLabel>Hyperscaler CapEx</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 strip-dividers">
        <CapexRow label="Hyperscaler spend" value={capexDirection} detail="Amazon, Microsoft, Alphabet, Meta, and Oracle investment direction; Google Finland infrastructure context."
          color={capexDirection.toLowerCase() === 'expanding' ? '#4A6B5F' : capexDirection.toLowerCase() === 'contracting' ? '#A93A33' : '#666'}
          tooltip={{ source: BENCHMARKS.hyperscalerCapexTrend.source, sourceUrl: BENCHMARKS.hyperscalerCapexTrend.sourceUrl, lastUpdated: BENCHMARKS.hyperscalerCapexTrend.lastUpdated }} />
        <CapexRow label="GPU rental rates" value="Selected list rates" detail={`${BENCHMARKS.gpuSupplyStatus.value}. Thunder Compute, October 16, 2026; includes reservation-only and on-demand-equivalent endpoints.`} color="#9A762A"
          tooltip={{ source: BENCHMARKS.gpuSupplyStatus.source, sourceUrl: BENCHMARKS.gpuSupplyStatus.sourceUrl, sourceLinks: BENCHMARKS.gpuSupplyStatus.sourceLinks, lastUpdated: BENCHMARKS.gpuSupplyStatus.lastUpdated }} />
        <CapexRow label="Data-center capacity" value="Tightening" detail={BENCHMARKS.dataCenterConstructionYoY.value} color="#4A6B5F"
          tooltip={{ source: BENCHMARKS.dataCenterConstructionYoY.source, sourceUrl: BENCHMARKS.dataCenterConstructionYoY.sourceUrl, lastUpdated: BENCHMARKS.dataCenterConstructionYoY.lastUpdated }} />
      </div>
    </div>
  )
}

export function RiskAlerts() {
  const { data, loading, contextData } = useIntelligent()

  if (loading) return (
    <div><SectionLabel>Risk &amp; Opportunity</SectionLabel><Skeleton count={2} /></div>
  )

  if (!data) return <UnavailableAnalysis title="Risk & Opportunity" />
  const { cloudValuations } = data
  const riskAlerts = contextData ? validateRiskAlerts(data.riskAlerts, {
    market: contextData, multiples: { saas: cloudValuations.saasAverage }, benchmarks: BENCHMARKS,
  }) : []

  const sourceForAlert = (title: string): RowTooltip => {
    const source = riskAlertSource(title)
    if (source === 'TLT' || source === 'DXY') {
      return {
        source: `Yahoo Finance via yFinance · ${source} · 20-session price change (not a relative-strength score)`,
        sourceUrl: `https://finance.yahoo.com/quote/${source === 'DXY' ? 'DX-Y.NYB' : 'TLT'}/`,
        lastUpdated: contextData?.marketSessionLabel ?? 'Market price date unavailable',
      }
    }
    if (source === 'gpuSupplyStatus') {
      return { source: BENCHMARKS.gpuSupplyStatus.source, sourceUrl: BENCHMARKS.gpuSupplyStatus.sourceUrl, sourceLinks: BENCHMARKS.gpuSupplyStatus.sourceLinks, lastUpdated: BENCHMARKS.gpuSupplyStatus.lastUpdated }
    }
    if (source === 'dataCenterConstructionYoY') return { source: BENCHMARKS.dataCenterConstructionYoY.source, sourceUrl: BENCHMARKS.dataCenterConstructionYoY.sourceUrl, lastUpdated: BENCHMARKS.dataCenterConstructionYoY.lastUpdated }
    return { source: 'Unsupported alert', lastUpdated: 'Unavailable' }
  }

  return (
    <div>
      {riskAlerts && riskAlerts.length > 0 && (
        <>
          <SectionLabel>Risk &amp; Opportunity</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 strip-dividers">
            {riskAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-2 py-4 md:px-6 first:pl-0 last:pr-0">
                <DashboardIcon name={alert.type === 'warning' ? 'warning' : 'opportunity'} tone={alert.type === 'warning' ? 'caution' : 'positive'} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="font-mono text-[0.72rem] font-semibold text-charcoal/80 leading-none">{alert.title}</p>
                    <BenchmarkTooltip {...sourceForAlert(alert.title)} />
                  </div>
                  <p className="font-mono text-[0.72rem] text-charcoal/65 leading-snug">{alert.message}</p>
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
export default function IntelligentSignals({ multiples }: { multiples: LiveMultiples }) {
  return <><FinOpsSignals /><CommitmentWindows /><CloudValuations multiples={multiples} /><HyperscalerCapex /><RiskAlerts /></>
}
