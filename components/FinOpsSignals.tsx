import type { Meta } from '@/lib/types'

interface Props { meta: Meta }

interface Signal {
  emoji: string
  category: string
  action: string
}

const SIGNALS: Record<string, Signal[]> = {
  'Risk-On': [
    { emoji: '☁️', category: 'Cloud Spend',      action: 'Accelerate commits — conditions support it' },
    { emoji: '💰', category: 'SaaS Renewals',     action: 'Expand strategically, lock multi-year' },
    { emoji: '🔧', category: 'Infrastructure',    action: 'Add capacity now, before rates move' },
  ],
  'Hold': [
    { emoji: '☁️', category: 'Cloud Spend',      action: 'Hold non-critical commits' },
    { emoji: '💰', category: 'SaaS Renewals',     action: 'Negotiate harder on renewals' },
    { emoji: '🔧', category: 'Infrastructure',    action: 'Lock Tech capacity now' },
  ],
  'Defensive': [
    { emoji: '☁️', category: 'Cloud Spend',      action: 'Pause expansion, audit utilization' },
    { emoji: '💰', category: 'SaaS Renewals',     action: 'Renegotiate everything aggressively' },
    { emoji: '🔧', category: 'Infrastructure',    action: 'Cut discretionary capacity' },
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
              <span>{s.emoji}</span>
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
