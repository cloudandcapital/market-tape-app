import type { Snapshot } from '@/lib/types'
import { uniqueRows } from '@/lib/marketIntegrity'
import { numberTone, signedNumber } from '@/lib/numberFormat'
import { EQUITY_ETFS } from '@/lib/equityBreadth'

export default function AllInstruments({ snapshot }: { snapshot: Snapshot }) {
  const rows = uniqueRows(snapshot)
  return (
    <details className="rule-subtle-top pt-5" id="all-instruments">
      <summary className="cursor-pointer font-mono text-sm text-sage-dark py-2">All {rows.length} tracked instruments</summary>
      <p className="font-mono text-sm text-charcoal/65 leading-relaxed my-3">Each ticker appears once. The equity basket excludes SPY and macro instruments. 1D, 5D, and 20D are percentage price changes over trading sessions; RS1M is a score. These changes are not a stored history of prior snapshots.</p>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="All tracked instruments, scroll horizontally for every column">
        <table className="w-full min-w-[720px] font-mono text-sm border-collapse">
          <caption className="text-left text-charcoal/65 py-3">Underlying price date: {rows[0]?.price_date} · Grades describe price trends.</caption>
          <thead><tr>{['Instrument', 'Basket', '1D', '5D', '20D', 'RS1M score', 'Trend grade'].map(label => <th key={label} scope="col" className="text-left font-medium py-3 pr-4 border-b border-charcoal/15">{label}</th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.ticker} className="border-b border-charcoal/10">
            <th scope="row" className="text-left font-normal py-2 pr-4"><a className="inline-flex min-h-8 items-center underline underline-offset-4 font-medium" href={`https://finance.yahoo.com/quote/${encodeURIComponent(row.ticker)}/`} target="_blank" rel="noopener noreferrer">{row.ticker}</a><span className="block text-charcoal/65 max-w-64">{row.name}</span></th>
            <td className="pr-4 text-charcoal/65">{EQUITY_ETFS.has(row.ticker) ? 'Equity ETF' : row.ticker === 'SPY' ? 'Benchmark' : 'Macro'}</td>
            {[row.d1_pct, row.d5_pct, row.d20_pct].map((value, index) => <td key={index} className={`pr-4 whitespace-nowrap ${numberTone(value)}`}>{signedNumber(value)}%</td>)}
            <td className={`pr-4 ${numberTone(row.rs1m)}`}>{signedNumber(row.rs1m)}</td>
            <td className="pr-4">{row.trend_grade}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </details>
  )
}
