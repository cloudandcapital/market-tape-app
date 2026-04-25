export interface SnapshotRow {
  ticker: string
  name: string
  short_name: string
  last: number
  intra_pct: number
  d1_pct: number
  d5_pct: number
  d20_pct: number
  atr_pct: number
  dist50_atr: number
  rs1m: number
  trend_grade: 'A' | 'B' | 'C'
  above_20d: boolean
  above_50d: boolean
  mini_rs_chart: string
  tradingview_symbol: string
  leveraged: { long: string | null; short: string | null }
  volume_ratio?: number
}

export interface SnapshotGroup {
  name: string
  rows: SnapshotRow[]
}

export interface Snapshot {
  generated_at_utc: string
  benchmark: string
  groups: SnapshotGroup[]
}

export interface LeaderboardEntry {
  ticker: string
  short_name: string
  name: string
  price: number
  intra_pct: number
  rs1m: number
  trend_grade: 'A' | 'B' | 'C'
  tradingview_symbol: string
}

export interface Meta {
  app: string
  generated_at_utc: string
  benchmark: string
  group_count: number
  instrument_count: number
  status: {
    exposure: { level: number; guidance: 'Risk-On' | 'Hold' | 'Defensive' }
    trend: { long_term: string; intermediate_term: string; short_term: string }
    risk: { volatility: string; sentiment: string; momentum: string }
    breadth: { above_20d_pct: number; above_50d_pct: number; breadth_label: string }
    momentum_env: { score: number; label: string }
  }
  leaders: {
    sectors: Array<{ ticker: string; name: string; rs1m: number }>
    countries: Array<{ ticker: string; name: string; rs1m: number }>
  }
  leaderboard: {
    leaders: LeaderboardEntry[]
    laggards: LeaderboardEntry[]
    universe_count: number
  }
}
