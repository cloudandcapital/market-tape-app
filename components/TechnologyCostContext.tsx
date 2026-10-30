import { BENCHMARKS, type Benchmark } from '@/lib/industryBenchmarks'
import BenchmarkTooltip from './BenchmarkTooltip'

const investment = BENCHMARKS.hyperscalerCapexTrend
const capacity = BENCHMARKS.dataCenterConstructionYoY
const gpu = BENCHMARKS.gpuSupplyStatus

function SourceRecord({ record }: { record: Benchmark }) {
  return <div className="tape-cost-source">Source record reviewed {record.lastUpdated}<BenchmarkTooltip source={record.source} sourceUrl={record.sourceUrl} sourceLinks={record.sourceLinks} lastUpdated={record.lastUpdated} /></div>
}

export default function TechnologyCostContext() {
  return (
    <div className="tape-cost-context">
      <h2 className="tape-eyebrow">Technology costs</h2>
      <p className="tape-cost-intro">Infrastructure context, with its own reporting dates.</p>
      <div className="tape-cost-observations">
        <div>
          <h3>Provider investment</h3>
          <p className="tape-cost-value">{investment.value}</p>
          <p>Capital spending direction across the tracked providers.</p>
          <SourceRecord record={investment} />
        </div>
        <div>
          <h3>Data center vacancy</h3>
          <p className="tape-cost-value">{capacity.numeric.vacancy_pct}%</p>
          <p>North America primary markets · H1 2026.</p>
          <SourceRecord record={capacity} />
        </div>
        <div>
          <h3>GPU rental comparisons</h3>
          <p className="tape-cost-value tape-cost-qualitative">Model, region &amp; terms matter</p>
          <p>Selected H100, H200 and B200 vendor comparisons. Open the source for the dated rates.</p>
          <SourceRecord record={gpu} />
        </div>
      </div>
    </div>
  )
}

export function CostConnections() {
  return (
    <section id="cost-connections" className="tape-connections" aria-labelledby="cost-connections-title">
      <div className="tape-connections-heading">
        <h2 id="cost-connections-title">How this connects to technology costs</h2>
        <p>Planning questions from the infrastructure records above. Your usage and contract complete the picture.</p>
      </div>
      <div className="tape-connection-grid">
        <article>
          <h3>Investment → usable capacity</h3>
          <p>Provider investment is recorded as <strong>{investment.value.toLowerCase()}</strong>. Planned spending and capacity you can use have different timelines.</p>
          <p className="tape-planning-question">Check: Is the capacity you need available in your region, on your schedule?</p>
        </article>
        <article>
          <h3>Available space → delivery choices</h3>
          <p>The cited data center report records <strong>{capacity.numeric.vacancy_pct}% vacancy</strong>. That is regional capacity context, rather than a quote for your workload.</p>
          <p className="tape-planning-question">Check: Do current quotes include the location, lead time and delivery terms you need?</p>
        </article>
        <article>
          <h3>Quoted rates → the bill you pay</h3>
          <p>The GPU comparisons cover different generations and purchase terms. Compare the same configuration and cost boundary.</p>
          <p className="tape-planning-question">Check: What will your expected hours, utilization and commitment actually cost?</p>
        </article>
      </div>
      <p className="tape-connection-note">Market scores describe investment performance. They do not measure cloud prices or establish savings. Open each source above to inspect its reporting period and scope.</p>
    </section>
  )
}
