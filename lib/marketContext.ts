import { formatMarketSessionLabel, getRow, getSectorRows } from './data'
import { marketPriceDate } from './marketIntegrity'
import type { MarketContextData } from './intelligentTypes'
import type { Meta, Snapshot } from './types'

export function buildContextData(meta: Meta, snapshot: Snapshot): MarketContextData {
  const r = (t: string) => getRow(snapshot, t)
  const sectors = getSectorRows(snapshot)

  const vix = r('^VIX'), spy = r('SPY'), tlt = r('TLT'), hyg = r('HYG')
  const dxy = r('DXY'), gld = r('GLD'), uso = r('USO'), iwm = r('IWM'), qqq = r('QQQ')

  return {
    marketSessionLabel: formatMarketSessionLabel(marketPriceDate(snapshot)),
    marketData: {
      vix: vix!.last,   vixD1: vix!.d1_pct,
      spy: spy!.last,    spyD1: spy!.d1_pct,
      guidance: meta.status.exposure.guidance,
      exposureLevel: meta.status.exposure.level,
      trends: { long: meta.status.trend.long_term, intermediate: meta.status.trend.intermediate_term, short: meta.status.trend.short_term },
      breadth: { above20d: meta.status.breadth.above_20d_pct, above50d: meta.status.breadth.above_50d_pct, label: meta.status.breadth.breadth_label },
      momentum: { score: meta.status.momentum_env.score, label: meta.status.momentum_env.label },
      risk: meta.status.risk,
    },
    sectorData: sectors.map(s => ({ ticker: s.ticker, name: s.short_name, rs1m: s.rs1m })),
    macroData: {
      tlt: tlt ? { rs1m: tlt.rs1m, grade: tlt.trend_grade, d1: tlt.d1_pct, d20: tlt.d20_pct } : null,
      hyg: hyg ? { rs1m: hyg.rs1m, grade: hyg.trend_grade, d20: hyg.d20_pct } : null,
      dxy: dxy ? { rs1m: dxy.rs1m, last: dxy.last, d20: dxy.d20_pct } : null,
      gld: gld ? { last: gld.last, d1: gld.d1_pct, rs1m: gld.rs1m } : null,
      uso: uso ? { last: uso.last, d1: uso.d1_pct } : null,
      iwm: iwm ? { rs1m: iwm.rs1m, last: iwm.last } : null,
      qqq: qqq ? { rs1m: qqq.rs1m, last: qqq.last, d1: qqq.d1_pct } : null,
    },
    leaderboard: {
      leaders: meta.leaderboard.leaders.slice(0, 10).map(l => ({ ticker: l.ticker, rs1m: l.rs1m, grade: l.trend_grade, intra_pct: l.intra_pct })),
      laggards: meta.leaderboard.laggards.slice(0, 5).map(l => ({ ticker: l.ticker, rs1m: l.rs1m, grade: l.trend_grade })),
    },
  }
}
