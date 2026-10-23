import type { Meta, Snapshot, SnapshotRow } from './types'

const DATE = /^\d{4}-\d{2}-\d{2}$/
const metrics = ['last', 'intra_pct', 'd1_pct', 'd5_pct', 'd20_pct', 'rs1m'] as const

export function uniqueRows(snapshot: Snapshot): SnapshotRow[] {
  const rows = new Map<string, SnapshotRow>()
  for (const group of snapshot.groups) {
    for (const row of group.rows) {
      const ticker = row.ticker.trim().toUpperCase()
      const previous = rows.get(ticker)
      if (previous && JSON.stringify(previous) !== JSON.stringify(row)) {
        throw new Error(`Conflicting repeated ticker: ${ticker}`)
      }
      rows.set(ticker, row)
    }
  }
  return [...rows.values()]
}

/** Fail closed rather than combine different pipeline runs or invent missing inputs. */
export function validateMarketData(meta: Meta, snapshot: Snapshot): { meta: Meta; snapshot: Snapshot } {
  if (!meta || !snapshot || !Array.isArray(snapshot.groups) || !snapshot.groups.length
    || !Number.isFinite(Date.parse(snapshot.generated_at_utc))
    || meta.generated_at_utc !== snapshot.generated_at_utc
    || meta.benchmark !== 'SPY' || snapshot.benchmark !== 'SPY') {
    throw new Error('Market files are incomplete or from different runs')
  }
  for (const group of snapshot.groups) {
    if (!Array.isArray(group.rows) || !group.rows.length) throw new Error('Missing market group')
    for (const row of group.rows) {
      if (typeof row.ticker !== 'string' || !row.ticker.trim()
        || metrics.some(key => !Number.isFinite(row[key])) || row.last <= 0
        || !['A', 'B', 'C'].includes(row.trend_grade)
        || typeof row.above_20d !== 'boolean' || typeof row.above_50d !== 'boolean'
        || !DATE.test(row.price_date) || row.price_status !== 'current' || !row.price_source) {
        throw new Error('Missing, stale, or invalid market row')
      }
    }
  }
  const rows = uniqueRows(snapshot)
  const session = rows.find(row => row.ticker === 'SPY')?.price_date
  if (!session || !rows.some(row => row.ticker === '^VIX') || rows.some(row => row.price_date !== session)) {
    throw new Error('Market price dates do not agree')
  }
  const publishedDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date(snapshot.generated_at_utc))
  if (session > publishedDay) throw new Error('Price date is later than publication')
  if (meta.instrument_count !== rows.length || meta.group_count !== snapshot.groups.length
    || (meta.display_row_count !== undefined && meta.display_row_count !== snapshot.groups.reduce((n, group) => n + group.rows.length, 0))) {
    throw new Error('Market coverage counts do not agree')
  }
  const status = meta.status
  if (!status || !['Risk-On', 'Hold', 'Defensive'].includes(status.exposure?.guidance)
    || !Number.isFinite(status.exposure?.level) || status.exposure.level < 0 || status.exposure.level > 100
    || !status.trend || !Object.values(status.trend).every(value => ['Up', 'Down', 'Sideways'].includes(value))
    || !status.risk || !status.momentum_env || !Number.isFinite(status.momentum_env.score)
    || !status.breadth || ![status.breadth.above_20d_pct, status.breadth.above_50d_pct].every(value => Number.isFinite(value) && value >= 0 && value <= 100)) {
    throw new Error('Invalid market status')
  }
  // Reconcile the displayed participation metrics independently of the pipeline metadata.
  const exposure = Math.round(rows.filter(row => row.rs1m > 0).length / rows.length * 100)
  const above20 = rows.filter(row => row.above_20d).length / rows.length * 100
  const above50 = rows.filter(row => row.above_50d).length / rows.length * 100
  if (status.exposure.level !== exposure || Math.abs(status.breadth.above_20d_pct - above20) > 0.011
    || Math.abs(status.breadth.above_50d_pct - above50) > 0.011
    || status.exposure.guidance !== (exposure >= 70 ? 'Risk-On' : exposure >= 40 ? 'Hold' : 'Defensive')) {
    throw new Error('Market status does not reconcile with unique instruments')
  }
  if (!meta.leaders || !Array.isArray(meta.leaders.sectors) || !Array.isArray(meta.leaders.countries)
    || !meta.leaderboard || !Number.isInteger(meta.leaderboard.universe_count) || meta.leaderboard.universe_count <= 0) {
    throw new Error('Missing market rankings')
  }
  const ranked = [...meta.leaderboard.leaders, ...meta.leaderboard.laggards]
  if (new Set(ranked.map(row => row.ticker)).size !== ranked.length
    || ranked.some(row => row.price_date !== session || row.price_status !== 'current'
      || !row.price_source || !Number.isFinite(row.price) || row.price <= 0 || !Number.isFinite(row.rs1m) || !Number.isFinite(row.intra_pct))) {
    throw new Error('Invalid or repeated momentum entry')
  }
  return { meta, snapshot }
}

export function marketPriceDate(snapshot: Snapshot): string {
  return snapshot.groups.flatMap(group => group.rows).find(row => row.ticker === 'SPY')!.price_date
}

export function snapshotIsOld(published: string, now = Date.now()): boolean {
  return !Number.isFinite(Date.parse(published)) || now - Date.parse(published) > 96 * 60 * 60 * 1000
}

export function yieldChangeBasisPoints(last: number, dailyPercent: number): number | null {
  if (!Number.isFinite(last) || !Number.isFinite(dailyPercent) || dailyPercent <= -100) return null
  return (last - last / (1 + dailyPercent / 100)) * 100
}
