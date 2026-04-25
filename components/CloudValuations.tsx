const VALUATIONS = [
  { label: 'Public Cloud',      value: '8.2×', sub: 'NTM Revenue' },
  { label: 'SaaS Average',      value: '6.5×', sub: 'NTM Revenue' },
  { label: 'AI Infrastructure', value: '12.3×', sub: 'NTM Revenue' },
]

export default function CloudValuations() {
  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-1">
        Cloud Valuations
      </h2>
      <p className="text-[9px] font-mono text-charcoal/25 mb-4">Updated quarterly from earnings data</p>

      <div className="divide-y divide-charcoal/8">
        {VALUATIONS.map(v => (
          <div key={v.label} className="flex items-baseline justify-between py-[0.35rem]">
            <span className="text-[10px] font-mono text-charcoal/40">{v.label}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-mono font-semibold text-charcoal">{v.value}</span>
              <span className="text-[9px] font-mono text-charcoal/30">{v.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
