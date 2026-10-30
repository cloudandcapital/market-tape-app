import { CLOUD_REVIEW } from '@/lib/cloudReview'

export default function CloudReview() {
  return (
    <section aria-labelledby="cloud-review-heading">
      <h2 id="cloud-review-heading" className="text-sm font-mono tracking-[0.18em] uppercase text-charcoal/65 mb-2">Before a cloud commitment</h2>
      <p className="font-mono text-sm text-charcoal/65 leading-relaxed mb-3 max-w-3xl">Markets give you context. Your usage and contract decide whether a commitment makes sense. Start with these questions.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 strip-dividers">
        {[
          { label: '1-year commitment', ...CLOUD_REVIEW.oneYear },
          { label: '3-year commitment', ...CLOUD_REVIEW.threeYear },
          { label: 'Spot or on-demand', ...CLOUD_REVIEW.spot },
        ].map(row => <div key={row.label} className="py-4 md:px-6 first:pl-0 last:pr-0">
          <h3 className="font-serif text-lg text-charcoal mb-2">{row.label}</h3>
          <p className="font-mono text-sm text-charcoal/75 leading-relaxed">{row.reason}</p>
        </div>)}
      </div>
      <a className="font-mono text-sm text-sage-dark underline underline-offset-4" href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-interruptions.html" target="_blank" rel="noopener noreferrer">How AWS Spot interruptions work ↗</a>
    </section>
  )
}
