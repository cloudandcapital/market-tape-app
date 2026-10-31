# Market Tape

Snapshot-based market dashboard for FinOps and cloud infrastructure teams. Connects public-market observations with source-linked infrastructure context and practical questions for a cost review. It does not use stock-market signals to prescribe cloud commitment timing or Spot safety.

Live at [market-tape.cloudandcapital.com](https://market-tape.cloudandcapital.com).

## What it does

48 unique tracked instruments displayed as 52 rows across seven groups. The upstream pipeline is scheduled to check every 30 minutes during weekday market hours; timestamps identify publication separately from the underlying price date. Lumen reads the latest published snapshot and translates moves in plain English. RS1M is a dimensionless, volatility-adjusted score, never a percentage return.

There's no shortage of market data. There's a shortage of translation between markets and infrastructure decisions. That's the gap Market Tape fills.

## Sections

| Section | What it shows |
|---|---|
| **Lumen Analysis** | Three-paragraph market read with FinOps Signals (cloud spend / SaaS renewals / infrastructure), Risk & Opportunity, and Sector Insights — all anchored to specific signals to prevent flip-flopping verdicts across regenerations |
| **AI Compute Commitments** | Major AI compute deals with a source-linked status for each row: Signed, Announced, Target, or Reported / in talks. No misleading aggregate is calculated across unlike deal types |
| **Market Status** | Exposure guidance (Risk-On / Neutral / Defensive), trend, breadth, momentum |
| **Before a cloud commitment** | Fixed questions about baseline usage, term risk, interruptions, and capacity; available without Lumen |
| **Macro Context** | Rates (TLT), gold (GLD), small caps (IWM), Nasdaq (QQQ), dollar (DXY) — relative strength readings tied to commitment math |
| **Cloud Valuations** | Yahoo Finance basket approximations when available; stale quarterly fallbacks are suppressed and separately dated |
| **Hyperscaler CapEx** | AWS / Azure / Google Cloud / Meta / Oracle quarterly CapEx trend |
| **Tech Concentration** | SMH, SOXX, IGV, SKYY, AIQ, PAVE — prices, % change, sparklines |
| **Sector Rotation & Leaders** | Top performers by 1-month relative strength across sectors and countries |
| **Momentum Leaderboard** | Top 10 leaders + top 5 laggards with trend grades |

## Stack

- **Framework:** Next.js 16.4.3 (App Router) + React 19.2.8
- **Styling:** Tailwind CSS v4
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk` ^0.91.1) — Haiku for AI Compute analysis line, Sonnet for the heavier intelligent brief
- **Valuation multiples:** Yahoo Finance via API route (representative SaaS, AI infrastructure, and public-cloud baskets); per-basket source/date reported, unavailable values suppressed
- **Static market data:** Checked on a 30-minute weekday schedule by the Python pipeline at [cloudandcapital/market-tape](https://github.com/cloudandcapital/market-tape), fetched via GitHub raw URLs with 30-minute ISR revalidation
- **Hosting:** Vercel

## Verification discipline

Market Tape ships under a "trust first, real receipts" rule. Every numeric claim on the dashboard either:
1. Is a market value with a stated source and underlying data date
2. Has a primary source citation visible via tooltip + listed on the [/sources](https://market-tape.cloudandcapital.com/sources) page
3. Is a Lumen interpretation explicitly framed as such

Hardcoded industry benchmarks live in a single source of truth (`lib/industryBenchmarks.ts`) with `lastUpdated`, `nextReviewDue`, `source`, and `reviewCadence` metadata. Before each deployment:

The AI compute tracker follows a conservative methodology: it includes major deals with a disclosed dollar value or capacity, labels each row by what its source confirms, and does not combine signed contracts, targets, equity investments, or negotiations into one dollar or GW headline.

```bash
npm run check-benchmarks
```

This flags any benchmark that's overdue for review against its source's publication cadence. See [`BENCHMARKS-MAINTENANCE.md`](./BENCHMARKS-MAINTENANCE.md) for the update protocol.

## Development

```bash
npm install
npm run dev      # localhost:3000
npm run build
npm run check-benchmarks
```

## Environment variables

```
ANTHROPIC_API_KEY=sk-ant-...
```

Set in Vercel project settings for production. Required for Lumen's analysis output.

## Brand

- Beige `#f5eee9` · Sage `#6B8E7F` · Ink `#191714` · Gold `#D4AF37`
- Serif: Playfair Display · Sans: Inter · Mono: DM Mono

## License

Open source — use it, fork it, adapt it. If it sparks a build of your own, [I'd love to hear about it](https://www.linkedin.com/in/dianalyst).
