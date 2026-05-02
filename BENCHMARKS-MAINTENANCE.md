# Industry Benchmarks Maintenance Guide

## What this is

`lib/industryBenchmarks.ts` is the single source of truth for every hardcoded industry statistic in Market Tape. Before this file existed, the same numbers were scattered across three separate places in the codebase — often with inconsistent values (e.g., DC construction growth appeared as +22%, +23%, and +20–25% simultaneously).

Every component and every Lumen prompt imports from this file. Updating one entry updates everything: the UI display, the briefing prompts, and the context Lumen uses for analysis.

---

## Benchmarks and their update cadence

| Benchmark | Current Value | Source | Review Cadence |
|-----------|---------------|--------|---------------|
| `gpuLeadTimesH100H200` | 12–16 weeks | Needs verification | Monthly |
| `dataCenterConstructionYoY` | +22% YoY | Needs verification | Quarterly |
| `publicCloudNTMMultiple` | 8.2× | Needs verification | Quarterly |
| `saasNTMMultiple` | 6.5× | Needs verification | Quarterly |
| `aiInfraNTMMultiple` | 12.3× | Needs verification | Quarterly |
| `saas2021PeakMultiple` | 20x+ | Bessemer Cloud Index (historical) | Semi-annual |
| `hyperscalerCapexTrend` | Expanding | Q1 2026 earnings guidance | Quarterly |

### Where to find updated values

**GPU lead times** — Call a reseller (CDW, Dell, SuperMicro) or check their B2B portal for current H100/H200 availability. Lead times tighten when demand spikes and improve when new supply comes online. Update monthly.

**DC construction growth** — Check Dodge Data & Analytics quarterly report, JLL Data Center Outlook, or CBRE Data Center Trends. Also pull from hyperscaler earnings calls (AWS re:Invent, Azure Ignite, Google Cloud Next).

**Cloud valuation multiples** — Bessemer Venture Partners Cloud Index at [cloudindex.bvp.com](https://cloudindex.bvp.com/). Also Bloomberg or FactSet comp tables. Update after each earnings season (February, May, August, November).

**AI infrastructure multiple** — Bloomberg or FactSet comp table for NVDA, AMD, SMCI, DELL AI infrastructure basket. Same quarterly cadence.

**Hyperscaler CapEx trend** — Earnings call transcripts and guidance slides from AWS, Azure, GCP. Updated quarterly.

---

## How to update a benchmark

1. Find the new value from the appropriate source above
2. Open `lib/industryBenchmarks.ts`
3. Update the entry:
   - `value` — the new human-readable string
   - `numeric` — the machine-readable form (number or `{ min, max }`)
   - `source` — the specific report, date, and publisher (replace "Industry consensus — needs verification")
   - `sourceUrl` — direct link if available
   - `lastUpdated` — today's date in `YYYY-MM-DD` format
   - `nextReviewDue` — set based on `reviewCadence`:
     - monthly → 30 days from today
     - quarterly → 90 days from today
     - semi-annual → 180 days from today
4. Run `npm run check-benchmarks` to confirm the entry turns green
5. Commit with a message like: `Update GPU lead times to 14-18 weeks (CDW portal, 2026-05-10)`
6. Push and deploy

---

## How to run the freshness check

```bash
npm run check-benchmarks
```

Output shows 🔴 OVERDUE, 🟡 DUE SOON (within 14 days), or 🟢 FRESH for each benchmark. Exits with code 1 if anything is overdue — this can be wired into a pre-deploy check in CI.

---

## Quarterly review ritual

Review this file as part of the Sunday brain folder planning ritual, every quarter after earnings season ends (typically mid-February, mid-May, mid-August, mid-November).

Steps:
1. `npm run check-benchmarks` — note anything overdue or due soon
2. For each item flagged, look up the current value from the source listed above
3. Update the file, run the check again to confirm all green
4. Commit, push, deploy

---

## Notes on values that "need verification"

Several benchmarks are currently marked `source: 'Industry consensus — needs verification'`. These values were added at launch without a primary source citation. They are plausible consensus estimates but should be replaced with cited sources as soon as possible.

The `nextReviewDue` for these is set to 2026-05-08 (7 days from the audit date). Do not let them stay unverified beyond that date if Market Tape is being used in brand-facing publications.
