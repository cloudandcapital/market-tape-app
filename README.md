# Market Tape

Live market dashboard for FinOps and cloud infrastructure teams. Translates market signals into infrastructure decisions — reservation timing, commitment windows, SaaS renewal leverage, GPU capacity guidance.

Live at [market-tape.cloudandcapital.com](https://market-tape.cloudandcapital.com).

## What it does

52 instruments across 7 groups. Refreshed every 30 minutes during market hours. Lumen — an AI analyst layer powered by Claude — reads the tape and translates moves into plain-English FinOps actions.

There's no shortage of market data. There's a shortage of translation between markets and infrastructure decisions. That's the gap Market Tape fills.

## Sections

| Section | What it shows |
|---|---|
| **Lumen Analysis** | Three-paragraph market read with FinOps Signals (cloud spend / SaaS renewals / infrastructure), Risk Alerts, and Sector Insights — all anchored to specific signals to prevent flip-flopping verdicts across regenerations |
| **AI Compute Commitments** | Every major AI lab × hyperscaler deal in one tracker. $750B+ committed across the past 18 months, ~25 GW locked capacity. The structural shift behind every other AI cost signal on the dashboard |
| **Market Status** | Exposure guidance (Risk-On / Neutral / Defensive), trend, breadth, momentum |
| **Commitment Windows** | Spot / 1-Year / 3-Year guidance, each anchored to specific market signals |
| **Macro Context** | Rates (TLT), gold (GLD), small caps (IWM), Nasdaq (QQQ), dollar (DXY) — relative strength readings tied to commitment math |
| **Cloud Valuations** | Live SaaS, AI infrastructure, and Public Cloud P/S multiples (BVP Cloud Index basket) via yFinance |
| **Hyperscaler CapEx** | AWS / Azure / Google Cloud / Meta / Oracle quarterly CapEx trend |
| **Tech Concentration** | SMH, SOXX, IGV, SKYY, AIQ, PAVE — prices, % change, sparklines |
| **Sector Rotation & Leaders** | Top performers by 1-month relative strength across sectors and countries |
| **Momentum Leaderboard** | Top 10 leaders + top 5 laggards with trend grades |

## Stack

- **Framework:** Next.js 16.2.4 (App Router) + React 19.2.4
- **Styling:** Tailwind CSS v4
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk` 0.91.0) — Haiku for AI Compute analysis line, Sonnet for the heavier intelligent brief
- **Live multiples:** yFinance via API route (BVP Cloud Index basket + AI infra + public cloud baskets)
- **Static market data:** Refreshed every 30 minutes by the Python pipeline at [cloudandcapital/market-tape](https://github.com/cloudandcapital/market-tape), fetched via GitHub raw URLs with ISR revalidation
- **Hosting:** Vercel

## Verification discipline

Market Tape ships under a "trust first, real receipts" rule. Every numeric claim on the dashboard either:
1. Is a live market value pulled at request time
2. Has a primary source citation visible via tooltip + listed on the [/sources](https://market-tape.cloudandcapital.com/sources) page
3. Is a Lumen interpretation explicitly framed as such

Hardcoded industry benchmarks live in a single source of truth (`lib/industryBenchmarks.ts`) with `lastUpdated`, `nextReviewDue`, `source`, and `reviewCadence` metadata. Before each deployment:

```bash
npm run check-benchmarks
```

This flags any benchmark that's overdue for review against its source's publication cadence. See [`BENCHMARKS-MAINTENANCE.md`](./BENCHMARKS-MAINTENANCE.md) for the full update protocol and [`LUMEN-AUDIT.md`](./LUMEN-AUDIT.md) + [`LUMEN-CONSISTENCY-AUDIT.md`](./LUMEN-CONSISTENCY-AUDIT.md) for the pre-launch verification work that established the architecture.

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
