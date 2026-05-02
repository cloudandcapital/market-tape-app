import { BENCHMARKS } from '@/lib/industryBenchmarks'

const CAPEX = [
  { label: 'AWS / Azure / GCP', value: BENCHMARKS.hyperscalerCapexTrend.value,      color: '#6B8E7F' },
  { label: 'GPU Supply',        value: BENCHMARKS.gpuSupplyStatus.value,             color: '#C9A961' },
  { label: 'DC Build',          value: BENCHMARKS.dataCenterConstructionYoY.value,   color: '#6B8E7F' },
]

export default function HyperscalerCapEx() {
  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-1">
        Hyperscaler CapEx
      </h2>
      <p className="text-[9px] font-mono text-charcoal/25 mb-4">Updated quarterly from earnings</p>

      <div className="divide-y divide-charcoal/8">
        {CAPEX.map(c => (
          <div key={c.label} className="flex items-baseline justify-between py-[0.35rem]">
            <span className="text-[10px] font-mono text-charcoal/40">{c.label}</span>
            <span className="text-xs font-mono font-medium" style={{ color: c.color }}>{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
