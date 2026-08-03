import type { Meta } from '@/lib/types'
import DashboardIcon from './DashboardIcon'

interface Props { meta: Meta }

interface Signal {
  icon: 'cloud' | 'renewal' | 'infrastructure'
  category: string
  action: string
}

const SIGNALS: Record<string, Signal[]> = {
  'Risk-On': [
    { icon: 'cloud', category: 'Cloud Spend', action: 'Review planned expansion against utilization and business demand' },
    { icon: 'renewal', category: 'SaaS Renewals', action: 'Benchmark renewal pricing before extending duration' },
    { icon: 'infrastructure', category: 'Infrastructure', action: 'Review capacity additions against workload requirements' },
  ],
  'Hold': [
    { icon: 'cloud', category: 'Cloud Spend', action: 'Review or defer non-critical expansion' },
    { icon: 'renewal', category: 'SaaS Renewals', action: 'Benchmark renewals and test for concessions' },
    { icon: 'infrastructure', category: 'Infrastructure', action: 'Monitor before extending commitment duration' },
  ],
  'Defensive': [
    { icon: 'cloud', category: 'Cloud Spend', action: 'Raise the approval threshold for discretionary expansion' },
    { icon: 'renewal', category: 'SaaS Renewals', action: 'Benchmark pricing and test for concessions' },
    { icon: 'infrastructure', category: 'Infrastructure', action: 'Review discretionary capacity against utilization' },
  ],
}

export default function FinOpsSignals({ meta }: Props) {
  const guidance = meta.status.exposure.guidance
  const signals = SIGNALS[guidance] ?? SIGNALS['Hold']

  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
        FinOps Signals
      </h2>

      <div className="space-y-0 divide-y divide-charcoal/8">
        {signals.map(s => (
          <div key={s.category} className="py-2.5">
            <p className="text-[10px] font-mono tracking-[0.1em] uppercase text-charcoal/35 mb-0.5 flex items-center gap-1.5">
              <DashboardIcon name={s.icon} />
              <span>{s.category}</span>
            </p>
            <p className="text-[0.78rem] font-mono text-charcoal/80 leading-snug">
              {s.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
