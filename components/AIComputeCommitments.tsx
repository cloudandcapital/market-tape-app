import {
  aiComputeData,
  AI_COMPUTE_LAST_UPDATED,
  getSignedDollarSummary,
  type AiComputeRow,
} from '@/lib/aiCompute'

function formatUpdatedDate(raw: string): string {
  return raw
}

function SourceLinks({ row, compact = false }: { row: AiComputeRow; compact?: boolean }) {
  return <>{row.sources.map((source, index) => <span key={source.url}>{index > 0 && ' · '}<a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-8 py-1 font-mono text-[0.72rem] text-charcoal/65 hover:text-sage-dark transition-colors" aria-label={`${source.kind} source for ${row.buyer} ${row.provider}`}>{compact ? source.label : `${source.label} ↗`}</a></span>)}</>
}

function StatusBadge({ status }: { status: AiComputeRow['status'] }) {
  return (
    <span className="inline-block rounded-full border border-charcoal/10 px-2 py-0.5 font-mono text-[0.72rem] tracking-[0.05em] text-charcoal/65 whitespace-nowrap">
      {status}
    </span>
  )
}

function DesktopTable({ rows }: { rows: AiComputeRow[] }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse">
        <thead><tr>
          {['Buyer', 'Compute Provider', 'Status', 'Value / basis', 'Capacity / basis', 'Term', 'Announced', 'Source'].map(h => (
            <th key={h} className="text-left font-mono text-[0.72rem] tracking-[0.16em] uppercase text-charcoal/65 pb-2.5 pr-3 font-normal">{h}</th>
          ))}
        </tr></thead>
        <tbody className="rows-subtle">
          {rows.map(row => (
            <tr key={`${row.buyer}-${row.provider}`}>
              <td className="font-mono text-[0.72rem] font-medium text-charcoal/80 py-2 pr-3 whitespace-nowrap">
                {row.buyer}
                {row.equityInvestment && <span className="block text-[0.72rem] font-normal text-charcoal/65">Separate equity investment: {row.equityInvestment} ({row.equityInvestmentBasis})</span>}
              </td>
              <td className="font-mono text-[0.72rem] text-charcoal/65 py-2 pr-3">{row.provider}</td>
              <td className="py-2 pr-3"><StatusBadge status={row.status} /></td>
              <td className="font-mono text-[0.72rem] font-medium py-2 pr-3" style={{ color: '#4A6B5F' }}>{row.amount}<span className="block text-[0.72rem] font-normal text-charcoal/65">{row.amountBasis}</span></td>
              <td className="font-mono text-[0.72rem] text-charcoal/65 py-2 pr-3 whitespace-nowrap">{row.capacity}<span className="block text-[0.72rem] text-charcoal/65">{row.capacityBasis}</span></td>
              <td className="font-mono text-[0.72rem] text-charcoal/65 py-2 pr-3">{row.term}</td>
              <td className="font-mono text-[0.72rem] text-charcoal/65 py-2 pr-3 whitespace-nowrap">{row.announced}</td>
              <td className="py-2 whitespace-nowrap"><SourceLinks row={row} compact /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MobileCards({ rows }: { rows: AiComputeRow[] }) {
  return (
    <div className="md:hidden space-y-1 rows-subtle">
      {rows.map(row => (
        <article key={`${row.buyer}-${row.provider}`} className="py-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div><p className="font-mono text-[0.75rem] font-medium text-charcoal/80">{row.buyer}</p><p className="font-mono text-[0.72rem] text-charcoal/65 mt-0.5">{row.provider}</p></div>
            <StatusBadge status={row.status} />
          </div>
          <p className="font-mono text-[0.72rem] font-medium mb-1" style={{ color: '#4A6B5F' }}>{row.amount} <span className="text-[0.72rem] font-normal text-charcoal/65">· {row.amountBasis}</span></p>
          {row.equityInvestment && <p className="font-mono text-[0.72rem] text-charcoal/65 mb-1">Separate equity investment: {row.equityInvestment} ({row.equityInvestmentBasis})</p>}
          <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-[0.72rem] text-charcoal/65">
            <span>{row.capacity} <span className="text-[0.72rem] text-charcoal/65">({row.capacityBasis})</span></span><span>·</span><span>{row.term}</span><span>·</span><span>{row.announced}</span>
            <SourceLinks row={row} />
          </div>
        </article>
      ))}
    </div>
  )
}

export default function AIComputeCommitments() {
  const statusCounts = aiComputeData.reduce<Record<string, number>>((counts, row) => {
    counts[row.status] = (counts[row.status] ?? 0) + 1
    return counts
  }, {})
  const signedSummary = getSignedDollarSummary()

  return (
    <section id="ai-compute-tracker">
      <h2 className="text-[0.72rem] font-mono tracking-[0.2em] uppercase text-charcoal/65 mb-4">AI Compute Commitments</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <div><p className="font-serif text-2xl text-charcoal">{aiComputeData.length}</p><p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-charcoal/65">tracked deals</p></div>
        {Object.entries(statusCounts).map(([status, count]) => <div key={status}><p className="font-serif text-2xl text-charcoal">{count}</p><p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-charcoal/65">{status}</p></div>)}
      </div>
      <p className="font-mono text-[0.72rem] text-charcoal/65 mb-4">Last updated {formatUpdatedDate(AI_COMPUTE_LAST_UPDATED)} · Values and capacity identify their provenance; only comparable, company-disclosed signed compute/cloud values enter the dollar headline, and no GW total is calculated.</p>

      <p className="font-serif italic text-sm leading-relaxed text-sage-dark mb-5">
        Company-disclosed signed compute and cloud-service contracts total {signedSummary.totalLabel} across {signedSummary.count} qualifying contracts; reported-only and undisclosed values remain excluded.
      </p>

      <details className="group rule-subtle-top pt-3">
        <summary className="cursor-pointer list-none font-mono text-[0.72rem] uppercase tracking-[0.12em] text-charcoal/65 hover:text-charcoal/80 mb-3">View full tracker <span aria-hidden="true" className="group-open:hidden">↓</span><span aria-hidden="true" className="hidden group-open:inline">↑</span></summary>
        <DesktopTable rows={aiComputeData} />
        <MobileCards rows={aiComputeData} />
      </details>
    </section>
  )
}
