# Industry Benchmarks Maintenance Guide

## Architecture: two data layers, not one

Market Tape separates its external data into two distinct layers:

| Layer | File | Cadence | Who updates |
|-------|------|---------|-------------|
| **Live market data** | `lib/liveMultiples.ts` | Every 30 min (Yahoo Finance) | Automatic |
| **Static benchmarks** | `lib/industryBenchmarks.ts` | Quarterly / semi-annual | You, manually |

**What moved to the live layer (2026-05-01):** Cloud valuation multiples (Public Cloud, SaaS, AI Infrastructure NTM P/S) are now computed live from Yahoo Finance stock baskets. They auto-refresh every 30 minutes and no longer require manual maintenance.

**What stays in the static layer:** Supply chain data, construction statistics, qualitative trends — things that update with research reports and earnings calls, not with daily stock prices.

---

## Live multiples (lib/liveMultiples.ts)

These three baskets compute approximate NTM P/S automatically. No manual maintenance needed.

| Basket | Tickers | Source |
|--------|---------|--------|
| Public Cloud | AMZN, MSFT, GOOGL, ORCL | Yahoo Finance |
| SaaS Average | CRM, NOW, SNOW, DDOG, ZS, HUBS, WDAY, VEEV | Yahoo Finance |
| AI Infrastructure | NVDA, AVGO, AMD, MU, MRVL | Yahoo Finance |

Method: `TTM P/S ÷ (1 + trailing revenue growth)` = approx NTM P/S. Equal-weighted median per basket.
Labeled `~` on the dashboard to communicate approximation.

If Yahoo Finance is unavailable, the system falls back to the last known values defined in `lib/liveMultiples.ts` as `FALLBACKS`.

If basket composition changes (ticker renamed, delisted, better proxy found), update the `BASKETS` constant in `lib/liveMultiples.ts`.

---

## Static benchmarks (lib/industryBenchmarks.ts)

Four entries remain that require manual quarterly or semi-annual review:

| Benchmark | Current Value | Source | Review Cadence |
|-----------|---------------|--------|---------------|
| `gpuSupplyStatus` | H100/H200 sampled cloud price ranges · Blackwell supply-constrained | Thunder Compute (Jul 2026) + NVIDIA Q1 FY2027 | Quarterly |
| `dataCenterConstructionYoY` | Demand +38% / construction -5.6% YoY | CBRE H2 2025 | Semi-annual |
| `saas2021PeakMultiple` | 20x+ | Bessemer Cloud Index (historical) | Semi-annual |
| `hyperscalerCapexTrend` | Expanding | Q2 2026 company earnings disclosures | Quarterly |

### Where to find updated values

**GPU supply status** — Use NVIDIA earnings disclosures for supply commentary and a dated, transparent cloud-market survey for rental availability and pricing. Keep rental prices separate from hardware procurement and do not publish backlog or lead-time estimates unless the linked source states them directly. Refresh after each NVIDIA earnings call and quarterly pricing survey.

**DC supply/demand** — CBRE North America Data Center Trends (published semi-annually). Also: JLL Data Center Outlook, CBRE Data Center Trends. The key metrics: absorption (demand) and construction pipeline, both in MW. Update twice a year after CBRE publishes.

**Hyperscaler CapEx trend** — Amazon, Microsoft, Alphabet, and Meta earnings calls (quarterly). Use company investor-relations releases or transcripts. Distinguish accounting reclassification from a change in underlying investment plans. Current Q2 2026 guidance: Amazon approximately $220B; Microsoft approximately $175B with underlying expectations unchanged after operating-lease reclassification; Alphabet $195–205B; Meta $130–145B. Update after each earnings cycle.

**SaaS 2021 peak multiple** — Historical reference. Only review to confirm the narrative framing ("compressed from 2021 peaks") is still accurate context. Rarely needs updating.

---

## How to update a benchmark

1. Find the new value from the source above
2. Open `lib/industryBenchmarks.ts`
3. Update: `value`, `numeric`, `source`, `sourceUrl`, `lastUpdated`, `nextReviewDue`
   - Set `nextReviewDue` based on cadence: quarterly = +90 days, semi-annual = +180 days
4. Run `npm run check-benchmarks` — confirm the entry turns 🟢 green
5. Commit with a claim-specific message, for example: `Update GPU supply benchmark after NVIDIA earnings`
6. Push and deploy

---

## Freshness checker

```bash
npm run check-benchmarks
```

Shows 🔴 OVERDUE / 🟡 DUE SOON (within 14 days) / 🟢 FRESH for each benchmark.
Exits with code 1 if anything is overdue — wire into CI pre-deploy when ready.

**Server-side staleness logging:** `checkServerStaleness()` in `lib/industryBenchmarks.ts` runs on every ISR revalidation cycle (every 30 min). It logs a `console.warn` to deployment output if any benchmark is >6 months past its `nextReviewDue` date. This is internal-only — never shown to users.

---

## Quarterly review ritual (Sunday brain folder)

Run after each earnings season (mid-February, mid-May, mid-August, mid-November):

1. `npm run check-benchmarks` — note overdue and due-soon items
2. Check NVIDIA earnings transcript for GPU supply commentary → update `gpuSupplyStatus`
3. Check AWS/Azure/GCP earnings transcripts for CapEx guidance → update `hyperscalerCapexTrend`
4. If CBRE H2 or H1 report just published → update `dataCenterConstructionYoY`
5. Commit, push, deploy

The `/sources` page at `/sources` reflects the current state of all benchmarks automatically — no separate documentation update needed.
