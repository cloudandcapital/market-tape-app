// Fetches live NTM P/S approximations from Yahoo Finance for three stock baskets.
// These replace the three hardcoded valuation multiples previously in industryBenchmarks.ts.
// Cached at the same 30-min revalidation cadence as the rest of the live data pipeline.
//
// Method: (TTM P/S) ÷ (1 + trailing revenue growth) ≈ NTM P/S
// Basket result: equal-weighted median (robust to individual outliers)
// Labeled with "~" to communicate these are approximations, not official NTM multiples.

export interface LiveMultiples {
  publicCloud: string   // formatted, e.g. "~8.3×"
  saas: string
  aiInfra: string
  asOf: string          // ISO timestamp
  source: 'live' | 'fallback'
}

// ─── Basket definitions ────────────────────────────────────────────────────
// Exposed for use in the /sources page and prompt attribution strings.

export const BASKETS = {
  publicCloud: {
    tickers: ['AMZN', 'MSFT', 'GOOGL', 'ORCL'],
    label: 'Public Cloud hyperscaler basket',
    note: 'Blended corporate P/S — AWS, Azure, and GCP are segments within these companies, not isolated. Treat as a proxy.',
  },
  saas: {
    tickers: ['CRM', 'NOW', 'SNOW', 'DDOG', 'ZS', 'HUBS', 'WDAY', 'VEEV'],
    label: 'SaaS basket (representative BVP Cloud Index names)',
    note: 'Eight liquid names from the BVP Nasdaq Emerging Cloud Index. Not the full index; WCLD ETF is the closest tradeable equivalent.',
  },
  aiInfra: {
    tickers: ['NVDA', 'AVGO', 'AMD', 'MU', 'MRVL'],
    label: 'AI infrastructure semiconductor basket',
    note: 'Semiconductor and AI hardware names. Dominated by NVDA; results are sensitive to NVDA revenue forecasts.',
  },
} as const

// ─── Fallback values ───────────────────────────────────────────────────────
// Used when Yahoo Finance is unavailable or too many tickers fail.
// These match the last manually-confirmed values (2026-04-24).

const FALLBACKS: Pick<LiveMultiples, 'publicCloud' | 'saas' | 'aiInfra'> = {
  publicCloud: '~8×',
  saas:        '~6.5×',
  aiInfra:     '~12×',
}

// ─── Yahoo Finance fetch ───────────────────────────────────────────────────

async function fetchTickerMultiple(ticker: string): Promise<number | null> {
  try {
    const url =
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}` +
      `?modules=defaultKeyStatistics,financialData`

    const res = await fetch(url, {
      next: { revalidate: 1800 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; market-tape/1.0)',
        Accept: 'application/json',
      },
    })
    if (!res.ok) return null

    const json = await res.json()
    const result = json?.quoteSummary?.result?.[0]
    if (!result) return null

    const ttmPS: number | undefined =
      result.defaultKeyStatistics?.priceToSalesTrailing12Months?.raw
    if (!ttmPS || ttmPS <= 0) return null

    // Adjust TTM → approximate NTM using trailing revenue growth.
    // Only apply if growth is in a sane range (–40% to +200%).
    const growth: number | undefined = result.financialData?.revenueGrowth?.raw
    if (growth !== undefined && growth > -0.4 && growth < 2.0) {
      return ttmPS / (1 + growth)
    }

    return ttmPS
  } catch {
    return null
  }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function formatMultiple(n: number): string {
  return `~${n.toFixed(1)}×`
}

async function computeBasket(tickers: readonly string[]): Promise<string | null> {
  const results = await Promise.all(tickers.map(fetchTickerMultiple))
  const valid = results.filter((v): v is number => v !== null && isFinite(v) && v > 0)
  // Require at least half the basket to have valid data
  if (valid.length < Math.ceil(tickers.length / 2)) return null
  return formatMultiple(median(valid))
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function fetchLiveMultiples(): Promise<LiveMultiples> {
  try {
    const [publicCloud, saas, aiInfra] = await Promise.all([
      computeBasket(BASKETS.publicCloud.tickers),
      computeBasket(BASKETS.saas.tickers),
      computeBasket(BASKETS.aiInfra.tickers),
    ])

    return {
      publicCloud: publicCloud ?? FALLBACKS.publicCloud,
      saas:        saas        ?? FALLBACKS.saas,
      aiInfra:     aiInfra     ?? FALLBACKS.aiInfra,
      asOf:   new Date().toISOString(),
      source: (publicCloud && saas && aiInfra) ? 'live' : 'fallback',
    }
  } catch {
    return {
      ...FALLBACKS,
      asOf:   new Date().toISOString(),
      source: 'fallback',
    }
  }
}
