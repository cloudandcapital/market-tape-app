import type { Snapshot } from './types'
import { uniqueRows } from './marketIntegrity'

// Explicit classification: never let a new macro instrument enter equity breadth.
// SPY is the benchmark, so its RS1M is zero by definition and is excluded.
export const EQUITY_ETFS = new Set([
  'XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE', 'XLC',
  'QQQ', 'IWM', 'IWF', 'IWD', 'MTUM', 'USMV', 'SMH', 'SOXX', 'IGV', 'SKYY', 'AIQ',
  'PAVE', 'SPLV', 'VNQ', 'REET', 'EFA', 'EEM', 'EWJ', 'EWZ', 'INDA', 'FXI', 'VGK', 'EWC',
])

export function equityBreadth(snapshot: Snapshot) {
  const rows = uniqueRows(snapshot).filter(row => EQUITY_ETFS.has(row.ticker))
  if (!rows.length) throw new Error('Equity basket is empty')
  const count = rows.length
  const positiveCount = rows.filter(row => row.rs1m > 0).length
  const level = Math.round(100 * positiveCount / count)
  const above20d = 100 * rows.filter(row => row.above_20d).length / count
  const above50d = 100 * rows.filter(row => row.above_50d).length / count
  const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }
  const trend = (field: 'd20_pct' | 'd5_pct' | 'd1_pct', up: number, down: number) => {
    const value = median(rows.map(row => row[field]))
    return value > up ? 'Up' : value < down ? 'Down' : 'Sideways'
  }
  const vix = uniqueRows(snapshot).find(row => row.ticker === '^VIX')!.last
  const volatility = vix <= 15 ? 'Low' : vix <= 22 ? 'Neutral' : 'High'
  const positiveDaily = rows.filter(row => row.intra_pct > 0).length / count
  const gradeA = rows.filter(row => row.trend_grade === 'A').length
  const gradeC = rows.filter(row => row.trend_grade === 'C').length
  const momentumScore = Math.round(50 * above50d / 100 + (volatility === 'Low' ? 25 : volatility === 'High' ? 0 : 10) + 25 * positiveDaily)
  return {
    count, positiveCount, level,
    band: level >= 70 ? 'Upper band' : level >= 40 ? 'Middle band' : 'Lower band',
    risk: { volatility, sentiment: positiveDaily > 0.6 ? 'Bullish' : positiveDaily < 0.4 ? 'Bearish' : 'Neutral', momentum: gradeA > gradeC ? 'Positive' : gradeA < gradeC ? 'Negative' : 'Neutral' },
    momentum: { score: momentumScore, label: momentumScore >= 70 ? 'Momentum-Friendly' : momentumScore >= 45 ? 'Selective' : 'Choppy' },
    above20d, above50d, label: above50d >= 60 ? 'Strong' : above50d >= 40 ? 'Mixed' : 'Weak',
    trends: { long: trend('d20_pct', 2, -1), intermediate: trend('d5_pct', 1, -0.5), short: trend('d1_pct', 0.5, -0.5) },
  }
}
