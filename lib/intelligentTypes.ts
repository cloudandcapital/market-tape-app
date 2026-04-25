export interface MarketContextData {
  marketData: {
    vix: number
    vixD1: number
    spy: number
    spyD1: number
    guidance: string
    exposureLevel: number
    trends: { long: string; intermediate: string; short: string }
    breadth: { above20d: number; above50d: number; label: string }
    momentum: { score: number; label: string }
    risk: { volatility: string; sentiment: string; momentum: string }
  }
  sectorData: Array<{ ticker: string; name: string; rs1m: number }>
  macroData: {
    tlt: { rs1m: number; grade: string; d1: number } | null
    hyg: { rs1m: number; grade: string } | null
    dxy: { rs1m: number; last: number } | null
    gld: { last: number; d1: number; rs1m: number } | null
    uso: { last: number; d1: number } | null
    iwm: { rs1m: number; last: number } | null
    qqq: { rs1m: number; last: number; d1: number } | null
  }
  leaderboard: {
    leaders: Array<{ ticker: string; rs1m: number; grade: string; intra_pct: number }>
    laggards: Array<{ ticker: string; rs1m: number; grade: string }>
  }
}

export interface BriefResponse {
  morningBrief: {
    headline: string
    paragraphs: string[]
  }
  finopsSignals: {
    cloudSpend: string
    saasRenewals: string
    infrastructure: string
  }
  commitmentWindows: {
    oneYear: { status: string; reason: string }
    threeYear: { status: string; reason: string }
    spot: { status: string; reason: string }
  }
  riskAlerts: Array<{ type: 'warning' | 'opportunity'; title: string; message: string }>
  sectorInsights: string
  cloudValuations: {
    publicCloud: string
    saasAverage: string
    aiInfrastructure: string
  }
  hyperscalerCapex: {
    trend: string
    gpuLeadTimes: string
    dataCenterGrowth: string
    detail: string
  }
  generatedAt: string
}

export interface CachedBrief {
  data: BriefResponse
  timestamp: number
  contextHash: string
}
