# Market Tape: Claude review resolutions — October 23, 2026

Independent review supplied by Diana; checked against app main 9afae81 and published pipeline snapshot dated October 22. This is a focused correctness and readability pass. Homepage positioning and unrelated tools remain unchanged.

| Finding | Resolution |
| --- | --- |
| IWM vs QQQ mislabeled Small vs Large | Compare IWM with SPY, explicitly labeled Small caps vs S&P 500. A score gap is not a raw-return spread. |
| AI compute prose invents budget impact and six-month horizon | Remove generated summary, browser cache, and request entirely. One source-derived statement at all widths. The legacy API also returns fixed text. |
| Mixed assets distort equity breadth | Independently derive equity breadth, trends, sentiment and momentum from 34 explicitly classified equity ETFs. Exclude SPY (zero by definition), bonds, commodity funds, currency/yield/volatility indices. Show numerator and denominator. Validate upstream legacy metadata separately; do not silently change its contract. |
| 52 displayed rows claim, hidden infrastructure | Correct metadata and methodology. Add expandable deduplicated table of all 48 instruments with 1D, 5D, 20D price changes, score, grade and research links. |
| Lumen calls basket stocks | Explicit equity ETF context, prompt and visible-prose rejection. Add Treasury yield/basis-point change and infrastructure ETF returns to context. |
| Hold sounds like a trading instruction | Lower / Middle / Upper band describes the equity score. Methodology and guide explain boundaries. |
| GPU pricing scope | Selected published rental list rates from Thunder Compute, one vendor compilation, not a market-wide floor. H200 GCP endpoint reservation-only; B200 GCP on-demand-equivalent. Link Silicon Data as a separate benchmark, without ingesting/comparing unlike index values. |
| Internal trigger appears in alerts | Source-build supported alert text after testing trigger. CBRE vacancy held steady, not a newly reached record low. |
| Signed/green negative zero | Shared formatting makes rounded zero neutral and unsigned. |
| XLK grade implies relative trend | Split XLK own trend grade and RS1M versus SPY. |
| Accessibility | Dark sage text, stronger neutral text, larger small labels, padded research/source links, keyboard-focusable overflow region. Retain sage fills and canonical beige. |
| Guide images | Companion site update: actual captures, 2x mobile renders, narrow image display cap, correct alt text and separate phone cloud-question capture. |
| Garbled renewal prompt / implied market causality | Fixed business questions, separately labeled; source-built market research question. |
| Navigation/category mismatch | All six tools in app menu; Market Tape in both money/investing and tech spending in companion catalog. |
| All-unavailable valuations | Hide section when all current baskets unavailable. Partial availability preserves explicit unavailable/archived labeling. Fetch reliability remains a separate issue. |
| Refresh appears inert | Live status distinguishes checking, updated, same cached reading, changed snapshot and failure. Refresh checks existing snapshot, does not claim new live quotes. |
| Anthropic–SpaceX primary filing / exit clause | Read May 20 SEC S-1 directly. Cite filing; disclose May 2029 term and bilateral 90-day exit; keep firm total undisclosed. Do not annualize monthly fee into signed total. |

## Evidence

- Fixed snapshot: 16/34 positive = 47/100; 18/34 above 20-session average = 53%; 14/34 above 50-session average = 41%. Duplicated tickers count once. VIX/bond score changes cannot improve equity breadth.
- Thunder Compute October 16 H100/H200/B200 pages: https://www.thundercompute.com/blog/nvidia-h100-pricing , https://www.thundercompute.com/blog/nvidia-h200-pricing , https://www.thundercompute.com/blog/nvidia-b200-pricing . Reviewed October 23. H100 endpoints use selected regional rates; H200/B200 have explicitly labeled access exceptions.
- CBRE September 8 release: https://www.cbre.com/press-releases/north-american-data-center-demand-continues-to-outpace-supply-despite-record-construction . Vacancy unchanged at 1.4% versus year-end 2025.
- SpaceX S-1: https://www.sec.gov/Archives/edgar/data/1181412/000162828026036936/spaceexplorationtechnologi.htm . Filing discloses $1.25B monthly after ramp-up, through May 2029, terminable by either party on 90 days’ notice. No guaranteed aggregate amount inferred.

## Checks and limits

18 regression tests, benchmark/guardrail checks, TypeScript, production build. Companion guide and catalog tests/build are recorded with its release. Public browser verification follows deployment. No physical-device test or independent verification of every quote/deal. AI shape/terminology checks do not prove every generated claim.

## Next improvements (not bundled into corrections)

- Stored 5–20-session history with defined dates and reliable chart assets; current table compares return windows, not historical snapshots.
- Commitment payment comparison using actual contract cash flows and a user-chosen financing/discount assumption. A Treasury yield is a reference, not automatically the business’s borrowing or discount rate.
- Restore a reliable current valuation source before promoting that section.
- Review November 1 benchmark deadlines on their actual sources; do not roll dates forward without checking.
