import type { Snapshot } from '@/lib/types'
import { equityBreadth } from '@/lib/equityBreadth'
import { getRow } from '@/lib/data'
import { signedNumber } from '@/lib/numberFormat'
import { BENCHMARKS } from '@/lib/industryBenchmarks'
import TechConcentration from './TechConcentration'
import TechnologyCostContext from './TechnologyCostContext'

export default function MarketOverview({ snapshot }: { snapshot: Snapshot }) {
  const equity = equityBreadth(snapshot)
  const technology = getRow(snapshot, 'XLK')

  return (
    <>
    <dl className="tape-mobile-summary" aria-label="Quick dashboard summary">
      <div><dt>Market breadth</dt><dd>{equity.positiveCount}/{equity.count}<span>ETFs with positive relative scores</span></dd></div>
      <div><dt>Technology</dt><dd>{technology ? signedNumber(technology.rs1m) : 'Unavailable'}<span>XLK relative score</span></dd></div>
      <div><dt>Cost context</dt><dd>{BENCHMARKS.dataCenterConstructionYoY.numeric.vacancy_pct}%<span>Data center vacancy · H1 2026</span></dd></div>
    </dl>
    <section id="market-signals" className="tape-overview" aria-label="Primary market signals">
      <div className="tape-breadth">
        <h2 className="tape-eyebrow">Market status</h2>
        <p className="tape-measure-label">Equity ETF breadth</p>
        <div className="tape-breadth-reading">
          <p className="tape-breadth-value">{equity.level}<span>/100</span></p>
          <div className="tape-breadth-context">
            <p className="tape-band">{equity.band}</p>
            <p>{equity.positiveCount} of {equity.count} have positive RS1M scores.</p>
          </div>
        </div>
        <div className="tape-breadth-bar" role="meter" aria-label="Tracked equity ETFs with positive RS1M scores" aria-valuemin={0} aria-valuemax={100} aria-valuenow={equity.level} aria-valuetext={`${equity.positiveCount} of ${equity.count} tracked equity ETFs, ${equity.level}%`}>
          <span style={{ width: `${equity.level}%` }} />
        </div>
        <p className="tape-measure-note">A tracked sample of {equity.count} equity ETFs. SPY is the benchmark and is excluded. RS1M compares performance with SPY, adjusted for volatility.</p>
        <div className="tape-averages">
          <h3>Equity ETFs above averages</h3>
          <div><p>Above 20-day average</p><strong>{equity.above20d.toFixed(0)}%</strong></div>
          <div><p>Above 50-day average</p><strong>{equity.above50d.toFixed(0)}%</strong></div>
        </div>
      </div>
      <TechConcentration snapshot={snapshot} />
      <TechnologyCostContext />
    </section>
    </>
  )
}
