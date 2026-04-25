'use client'

import { useIntelligent } from './IntelligentProvider'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
      {children}
    </h2>
  )
}

function Row({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between py-[0.32rem]" style={{ borderBottom: '1px solid rgba(0,0,0,0.055)' }}>
      <span className="font-mono text-[0.5rem] tracking-[0.16em] uppercase text-charcoal/40 flex-shrink-0 mt-0.5">{label}</span>
      <div className="text-right ml-2 min-w-0">
        <p className="font-mono text-[0.75rem] font-medium leading-snug" style={{ color: color ?? '#191714' }}>{value}</p>
        {sub && <p className="font-mono text-[0.48rem] text-charcoal/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function statusColor(s: string): string {
  if (s === 'FAVORABLE' || s === 'SAFE') return '#6B8E7F'
  if (s === 'HOLD' || s === 'RISKY') return '#C0443A'
  return '#C9A961'
}

function Skeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1,2,3].map(i => (
        <div key={i} className="h-3 bg-charcoal/8 rounded" style={{ width: `${60 + i * 12}%` }} />
      ))}
    </div>
  )
}

export default function IntelligentSignals() {
  const { data, loading } = useIntelligent()

  if (loading) {
    return (
      <div className="space-y-8">
        {['FinOps Signals', 'Commitment Windows', 'Cloud Valuations', 'Hyperscaler CapEx', 'Risk Alerts'].map(label => (
          <div key={label}>
            <SectionLabel>{label}</SectionLabel>
            <Skeleton />
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const { finopsSignals, commitmentWindows, riskAlerts, cloudValuations, hyperscalerCapex, sectorInsights } = data

  return (
    <div>

      {/* FinOps Signals */}
      <SectionLabel>FinOps Signals</SectionLabel>
      <div className="divide-y divide-charcoal/8 mb-0">
        {[
          { emoji: '☁️', label: 'Cloud Spend',   text: finopsSignals.cloudSpend },
          { emoji: '💰', label: 'SaaS Renewals', text: finopsSignals.saasRenewals },
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

      {/* Commitment Windows */}
      <SectionLabel>Commitment Windows</SectionLabel>
      <div className="divide-y divide-charcoal/8">
        {[
          { emoji: '☁️', label: '1-Year Reserved', win: commitmentWindows.oneYear },
          { emoji: '💰', label: '3-Year Commits',  win: commitmentWindows.threeYear },
          { emoji: '🔧', label: 'Spot/On-Demand',  win: commitmentWindows.spot },
        ].map(({ emoji, label, win }) => (
          <div key={label} className="py-2.5 flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5 min-w-0">
              <span className="text-[11px] flex-shrink-0 mt-0.5">{emoji}</span>
              <div className="min-w-0">
                <p className="text-[9px] font-mono uppercase tracking-[0.1em] text-charcoal/35 mb-0.5">{label}</p>
                <p className="text-[9px] font-mono text-charcoal/50 leading-snug">{win.reason}</p>
              </div>
            </div>
            <span className="font-mono text-[9px] font-semibold tracking-[0.08em] flex-shrink-0"
              style={{ color: statusColor(win.status) }}>
              {win.status}
            </span>
          </div>
        ))}
      </div>

      <hr className="border-charcoal/10 my-6" />

      {/* Cloud Valuations */}
      <SectionLabel>Cloud Valuations</SectionLabel>
      <div className="divide-y divide-charcoal/8">
        <Row label="Public Cloud" value={cloudValuations.publicCloud} />
        <Row label="SaaS Average" value={cloudValuations.saasAverage} />
        <Row label="AI Infrastructure" value={cloudValuations.aiInfrastructure} />
      </div>

      <hr className="border-charcoal/10 my-6" />

      {/* Hyperscaler CapEx */}
      <SectionLabel>Hyperscaler CapEx</SectionLabel>
      <div className="divide-y divide-charcoal/8">
        <Row label="AWS/Azure/GCP"
          value={hyperscalerCapex.trend}
          color={hyperscalerCapex.trend === 'Expanding' ? '#6B8E7F' : hyperscalerCapex.trend === 'Contracting' ? '#C0443A' : '#888'} />
        <Row label="GPU Lead Times" value={hyperscalerCapex.gpuLeadTimes} color="#C9A961" />
        <Row label="Data Center" value={hyperscalerCapex.dataCenterGrowth} color="#6B8E7F" />
      </div>
      {hyperscalerCapex.detail && (
        <p className="font-mono text-[0.48rem] tracking-[0.06em] text-charcoal/30 mt-2 leading-relaxed">
          {hyperscalerCapex.detail}
        </p>
      )}

      {riskAlerts && riskAlerts.length > 0 && (
        <>
          <hr className="border-charcoal/10 my-6" />
          <SectionLabel>Risk Alerts</SectionLabel>
          <div className="space-y-3">
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
