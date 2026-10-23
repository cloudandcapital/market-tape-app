# Market Tape tool review — October 23, 2026

## Scope and evidence

Reviewed frontend main `e90d0f6b5d401ca1f33f6c9fb6f2c5b58c173062` and pipeline main `4b7ff3d9c671c4683a9369f9c5e8f3c66f98a1c0`. The pipeline is read-only in this change. Its October 22 snapshot was published at 21:42:08 UTC; all 52 displayed rows carried the October 22 price date. The 48 unique instruments include four intentional repeats (XLV, XLP, XLU, USMV). Existing Python tests confirm unique-instrument calculations. One stale screened-universe candidate, QRVO, was excluded rather than silently presented as current.

## Corrections

- RS1M is `(20-session asset return − SPY return) / (population standard deviation of daily asset returns × sqrt(20))`. It is a dimensionless score, not a percent. The calculation is unchanged; labels, explanations, Lumen input units, macro interpretations, and regression coverage are corrected.
- TLT and DXY review flags use their actual 20-session percentage price changes. A low TLT relative score does not prove rates rose. HYG grades do not measure credit-spread widening. A SaaS basket multiple does not prove a vendor discount window.
- Cloud commitment verdicts based on VIX/breadth are replaced by fixed review questions about baseline usage, term risk, and interruption handling. They remain visible without Lumen.
- Price date and publication time are separate. Daily bars are explicitly allowed to change intraday. Publication date is never relabeled as a completed trading close.
- The frontend verifies matching file versions, current row status, consistent sessions, coverage counts, duplicate consistency, ranking uniqueness, and independent participation-metric reconciliation. Inconsistent feeds render an explicit unavailable state without invented fallback market values.
- A four-day publication-age backstop pauses new Lumen analysis. This is not a US exchange-calendar freshness calculation. The API verifies server data and rejects a changed client snapshot so analysis and displayed numbers cannot intentionally mix.
- Valuation numbers come from the source fetch even if cached/generated prose disagrees. Existing unavailable-basket and dated-archive behavior remains.
- Lumen output gets visible-field shape and explicit score-unit checks. These checks do not prove complete factual grounding or validate every causal assertion. The prompt no longer requests purchasing verdicts, credit-spread inferences, or automatic renewal leverage.
- Navigation points at the current main-site routes. Focus visibility, readable captions, and reduced-motion behavior are improved without changing the site palette.

## Source checks

- [AWS Spot interruptions](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-interruptions.html): interruptions depend on EC2 capacity and other operating conditions, not stock-market volatility.
- [Cboe VIX definition](https://www.cboe.com/us/indices/dashboard/vix/): expected 30-day equity-market volatility, not an infrastructure interruption forecast.
- [iShares HYG](https://www.ishares.com/us/products/239565/ishares-iboxx-high-yield-corporate-bond-etf): bond fund; its quoted price and separately reported option-adjusted spread are distinct measurements.
- [Invesco QQQ](https://www.invesco.com/qqq-etf/en/about.html): Nasdaq-100 exposure, not a seven-stock portfolio or a computed concentration ratio.
- [Thunder Compute H100 comparison](https://www.thundercompute.com/blog/nvidia-h100-pricing): the October 16 comparison lists the selected headline range already used in the tool. Provider, region, multi-GPU normalization, and purchase model matter; this is a vendor-authored comparison, not an independent real-time quote feed.
- [CBRE H1 2026](https://www.cbre.com/insights/books/north-america-data-center-trends-h1-2026): 1.4% primary-market vacancy, 24.8% construction growth, 11.7% absorption growth, and 80.4% preleasing match the stored benchmark.
- [NVIDIA Q2 FY2027](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027): stored $89B Data Center revenue and $108B total-revenue outlook match the issuer release. They are different metrics.

No review dates were rolled forward merely because code changed. The existing historical SaaS reference and hyperscaler benchmark are due for review November 1. This review does not independently revalidate every row of the manually maintained AI deal tracker or each provider GPU quote.

## Verification

- Existing pipeline suite: 19 tests passed.
- Frontend integrity, rendering, and unit regression suite: 9 tests passed.
- Existing benchmark/guardrail checks pass; two upcoming review warnings remain visible.
- TypeScript and production build pass.
- The managed preview cannot launch this Next.js app because its supervisor supplies Vite-only CLI flags. No product code or credentials were changed to work around that limitation. Production UI and Lumen verification follow the GitHub/Vercel release; their evidence will be recorded in a follow-up.

## Render-isolation follow-up

The first GitHub preview deployment passed, but production deployment `dpl_3jHpb9xmj4BctaSCpjjbZHB4dRup` failed. Its private build logs are inaccessible to this connection (team-scope 403); automatic approval review also rejected entering a new CLI authentication flow. The deployment failure's root cause is therefore unproven.

Source inspection identified a separate reliability issue: initial page rendering waited for a model call with a 65-second cutoff. The follow-up removes that dependency from the page build/render. The browser requests the same shared, snapshot-checked analysis after dated source data has rendered. The model request has a 45-second cutoff and SDK retries are disabled. This repairs a real render dependency; it is not represented as a log-confirmed explanation of the production failure.
