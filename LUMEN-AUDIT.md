# Lumen Hallucination Audit
**Audited:** 2026-05-01  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Branch:** lumen-grounding-audit  
**Scope:** All Anthropic API call sites in this repo

---

## Section 1: Lumen Call Site Inventory

| # | File | Model | Powers | Max Tokens | Grounding Score |
|---|------|-------|--------|-----------|----------------|
| 1 | `app/api/intelligent-brief/route.ts` | claude-opus-4-7 | Main Lumen analysis block (Morning Brief headline+3 paragraphs, FinOps Signals, Commitment Windows, Risk Alerts, Sector Insights, Cloud Valuations, Hyperscaler CapEx) | 2,500 | **Partially Grounded** |
| 2 | `app/api/morning-brief/route.ts` | claude-sonnet-4-6 | Legacy morning brief (no longer surfaced as primary, may be vestigial or backup) | 400 | **Hallucination Risk** |
| 3 | `app/api/ai-compute-brief/route.ts` | claude-haiku-4-5-20251001 | AI Compute Commitments — Lumen analysis line beneath the $750B+ headline | 100 | **Grounded** (with one voice rule concern) |

### Grounding Score Definitions
- **Grounded** — all numbers Lumen might cite are present in the context passed to it
- **Partially Grounded** — live market data is passed in, but some infrastructure benchmarks are hardcoded strings embedded in the prompt with no prohibition on Lumen augmenting them
- **Hallucination Risk** — Lumen is asked to make domain-specific claims (infrastructure, cloud spend) without relevant supporting data in the context

---

## Section 2: Prompt Issues Found

### Call Site 1 — `intelligent-brief/route.ts` (Partially Grounded)

**Issue A — Hardcoded benchmarks in prompt body, no constraint against augmenting them**

Lines 39–44 of `buildPrompt()` embed five benchmark strings directly into the user prompt:

```
CLOUD INFRASTRUCTURE CONTEXT (quarterly estimates):
- Public cloud SaaS NTM P/S: ~6-8x (compressed from 2021 peaks of 20x+)
- AI infrastructure / hyperscaler NTM P/S: ~10-15x (elevated on AI spending thesis)
- Hyperscaler CapEx: AWS, Azure, GCP all guiding toward record spend in 2025-2026
- GPU lead times: 12-16 weeks for H100/H200 class; B100 allocation-based
- Data center construction: +20-25% YoY, constrained by power availability
```

These are provided as "estimates" but the system prompt instructs the model to "Be direct, confident, and specific" with no caveat. Claude will treat these as true, but it may also interpolate or invent related figures (e.g., citing a specific analyst's report, narrowing "20-25%" to "22%", or adding a GPU stat not in this list) since there is no explicit prohibition.

**Issue B — JSON schema fields ask Lumen to fill in numbers with no grounding constraint**

The `cloudValuations` and `hyperscalerCapex` schema fields explicitly request numeric values:

```json
"cloudValuations": {
  "publicCloud": "X.Xx NTM Revenue — brief trend note",
  "saasAverage": "X.Xx NTM Revenue — brief trend note",
  "aiInfrastructure": "XX.Xx NTM Revenue — brief trend note"
},
"hyperscalerCapex": {
  "gpuLeadTimes": "XX-XX weeks",
  "dataCenterGrowth": "+XX% YoY"
}
```

The prompt instructs Lumen to fill these placeholders. The only constraint is the hardcoded "CLOUD INFRASTRUCTURE CONTEXT" block above, but that block uses ranges (~6-8x, ~10-15x, +20-25%), not specific values. Lumen will invent a specific value to satisfy the schema pattern — producing outputs like "8.2× NTM Revenue" without any data source to verify it. This is the mechanism that generated the currently-displayed `CloudValuations.tsx` values (8.2×, 6.5×, 12.3×).

**Issue C — System prompt instructs confidence with no grounding guard**

```
"Be direct, confident, and specific."
```

No grounding constraint exists in the system prompt. This actively encourages fabricated specificity.

**Recommended fix (exact):**

Add to system prompt (after "Be direct, confident, and specific."):

```
GROUNDING RULE: Use ONLY the data and estimates provided in the user message. Do not invent percentages, industry benchmarks, or statistics not present in that context. If a specific number is not in the data, use qualitative language instead ("compressed," "elevated," "tightening"). Do not cite named industry reports, analysts, or vendor data sources unless explicitly provided.
```

---

### Call Site 2 — `morning-brief/route.ts` (Hallucination Risk)

**Issue A — Paragraph 2 asks for infrastructure claims with no infrastructure data**

The prompt asks:

```
2. What this means for tech infrastructure and cloud spend decisions
```

But the only context provided is market internals (VIX, breadth, momentum score, exposure guidance, sector RS rankings). There are no valuation multiples, GPU data, CapEx figures, or cloud-specific signals in the data payload. Claude must draw on training-data knowledge to write about "cloud spend decisions" — which is exactly the definition of hallucination risk. Any specific number it cites (SaaS multiples, lead times, CapEx growth) in this paragraph is fabricated.

**Issue B — No system prompt, no grounding instruction, no persona constraints**

The entire prompt is a single user message with no system role. There is no instruction prohibiting invented statistics.

**Recommended fix:**

Add to the end of the prompt, before the closing backtick:

```
GROUNDING RULE: Use only the data provided above. Do not cite specific valuation multiples, GPU lead times, CapEx percentages, or industry benchmarks that are not present in this data. For the infrastructure paragraph, use qualitative language only ("hyperscalers are still expanding," "software budgets face pressure") — never a specific number you have not been given.
```

---

### Call Site 3 — `ai-compute-brief/route.ts` (Grounded, one concern)

This is the most responsibly constructed of the three prompts. The AI compute commitment data (with specific dollar amounts, GW figures, terms, and source URLs) is passed in full as JSON context. Lumen is told to reference "$750B+" only if citing a total.

**Issue A — "Quantify everything" voice rule without a data scope limit**

The voice rule states:

```
- Quantify everything. Numbers, dollars, gigawatts, percentages, time windows.
```

Without an explicit constraint, this encourages Lumen to introduce numbers from training data if the provided data doesn't satisfy the quantification impulse. In a 35-word sentence this is unlikely to cause severe harm, but it should be bounded.

**Recommended fix:**

Change the voice rule to:

```
- Quantify using the data provided. Only cite numbers, dollars, gigawatts, percentages, and time windows that appear in the DATA section below.
```

---

## Section 3: Hardcoded Industry Values Inventory

| File | Line | Value | Type | Should Be Sourced From | Last Git Update | Staleness |
|------|------|-------|------|----------------------|----------------|-----------|
| `app/api/intelligent-brief/route.ts` | 40 | `~6-8x` (Public cloud SaaS NTM P/S) | Valuation multiple | Quarterly earnings data (Bessemer Venture Partners, Bloomberg, or internal comp) | 2026-04-24 | Medium — Q1 2026 earnings season just ended, may be accurate |
| `app/api/intelligent-brief/route.ts` | 40 | `20x+` (2021 peak SaaS multiple) | Historical benchmark | Public record, stable | 2026-04-24 | Low — historical fact, not time-sensitive |
| `app/api/intelligent-brief/route.ts` | 41 | `~10-15x` (AI infra/hyperscaler NTM P/S) | Valuation multiple | Quarterly earnings data | 2026-04-24 | Medium |
| `app/api/intelligent-brief/route.ts` | 43 | `12-16 weeks` (GPU H100/H200 lead times) | Supply chain stat | Dell, SuperMicro, or reseller channel checks | 2026-04-24 | **High** — lead times change monthly; this is the figure Lumen repeats publicly |
| `app/api/intelligent-brief/route.ts` | 44 | `+20-25% YoY` (DC construction growth) | Industry aggregate | Dodge Data, JLL, or hyperscaler earnings commentary | 2026-04-24 | **High** — quarterly refresh needed |
| `components/HyperscalerCapEx.tsx` | 3 | `12–16 weeks` (GPU Lead Times) | Supply chain stat | Same as above | 2026-04-24 | **High** |
| `components/HyperscalerCapEx.tsx` | 4 | `+23% YoY` (DC Build) | Industry aggregate | Dodge Data / JLL / earnings | 2026-04-24 | **High** — note: prompt says "+20-25%" but UI displays "+23%" — values are out of sync |
| `components/CloudValuations.tsx` | 2 | `8.2×` (Public Cloud NTM Revenue) | Valuation multiple | Quarterly earnings comps | 2026-04-24 | Medium |
| `components/CloudValuations.tsx` | 3 | `6.5×` (SaaS Average NTM Revenue) | Valuation multiple | Quarterly earnings comps | 2026-04-24 | Medium |
| `components/CloudValuations.tsx` | 4 | `12.3×` (AI Infrastructure NTM Revenue) | Valuation multiple | Quarterly earnings comps | 2026-04-24 | Medium |
| `components/AIComputeCommitments.tsx` | 146 | `$750B+` | Aggregate of table data | `lib/aiCompute.ts` rows (verified — see Section 5) | 2026-04-29 | Low — derived from table |
| `components/AIComputeCommitments.tsx` | 149 | `~25 GW` | Aggregate of table data | `lib/aiCompute.ts` rows (verified — see Section 5) | 2026-04-29 | Low — derived from table |
| `app/api/ai-compute-brief/route.ts` | 7 | Fallback paragraph text | Qualitative assertion | N/A — editorial | 2026-04-29 | Low — qualitative, no specific numbers |

### Prompt vs. UI Discrepancy (Flag)
`intelligent-brief/route.ts:44` tells Lumen the DC construction rate is `+20-25% YoY`, but `HyperscalerCapEx.tsx:4` displays `+23% YoY`. These two values are maintained separately and are already out of sync. When Lumen's live output gets displayed in `hyperscalerCapex.dataCenterGrowth`, it will produce a value based on the `+20-25%` range, while the static component shows `+23%`. Users see both on the same screen.

---

## Section 4: Recommended Changes (Prioritized)

### P0 — Add grounding constraints to all Lumen system prompts *(must fix before next brand-facing publication)*

**Status: IMPLEMENTED in this branch.** See diff for exact changes.

1. `app/api/intelligent-brief/route.ts` — Added GROUNDING RULE to system prompt  
2. `app/api/morning-brief/route.ts` — Added GROUNDING RULE to user prompt  
3. `app/api/ai-compute-brief/route.ts` — Replaced "Quantify everything" with data-scoped quantification rule, added explicit GROUNDING RULE

---

### P1 — Move stale hardcoded industry values to a dated config file *(fix this week)*

Create `lib/industryBenchmarks.ts`:

```typescript
// Source: [attribution] | Updated: YYYY-MM-DD | Refresh: quarterly
export const INDUSTRY_BENCHMARKS = {
  // GPU supply chain — source: channel checks (Dell, CDW, SuperMicro resellers)
  gpuLeadTimesH100H200: '12-16 weeks',    // last updated: 2026-04-24
  gpuB200AllocationBased: true,

  // Data center construction — source: Dodge Data & Analytics / JLL
  dataCenterConstructionYoY: '+20-25%',   // last updated: 2026-04-24

  // Cloud valuation multiples — source: quarterly earnings comps
  publicCloudNTMMultiple: '~6-8x',        // last updated: 2026-04-24
  aiInfrastructureNTMMultiple: '~10-15x', // last updated: 2026-04-24
  saasNTMMultiple: '~6-8x',               // last updated: 2026-04-24
  saas2021PeakMultiple: '20x+',           // historical, stable
} as const

// Displayed values — update in sync with benchmarks above
export const DISPLAY_BENCHMARKS = {
  gpuLeadTimes: '12–16 weeks',            // last updated: 2026-04-24
  dataCenterGrowth: '+23% YoY',           // last updated: 2026-04-24
  publicCloudMultiple: '8.2×',            // last updated: 2026-04-24
  saasMultiple: '6.5×',                   // last updated: 2026-04-24
  aiInfraMultiple: '12.3×',               // last updated: 2026-04-24
} as const
```

Both `intelligent-brief/route.ts` (prompt context block) and the display components (`HyperscalerCapEx.tsx`, `CloudValuations.tsx`) should import from this single source of truth. This eliminates the prompt/UI sync problem and creates one place to update quarterly.

---

### P2 — Improve data context passed to Lumen *(nice to have)*

1. **Morning brief** — either pass the same infrastructure context block that `intelligent-brief` uses, or remove the instruction to comment on cloud infrastructure (it has no data to ground that claim)
2. **Cloud valuations JSON fields** — instead of asking Lumen to invent `"X.Xx NTM Revenue"`, pass the actual current multiples as data and ask Lumen to annotate trend direction only
3. **Hyperscaler CapEx JSON fields** — same: pass `gpuLeadTimes` and `dataCenterGrowth` as data inputs, not output targets

---

## Section 5: Specific Post Claims Verification

### Claim: "$750B+ committed across the past 18 months"

**Source: `lib/aiCompute.ts`** — verified by summing the `amount` field:

| Row | Amount |
|-----|--------|
| Anthropic / AWS | $100B+ |
| Anthropic / Google | $40B |
| OpenAI / Microsoft Azure | ~$250B |
| OpenAI / Oracle | ~$300B |
| OpenAI / AWS | $38B |
| Meta / AWS | Multi-billion (undisclosed) |
| xAI / Self-built | ~$18B |
| **Disclosed total** | **~$746B+ (excl. Meta)** |

**Verdict: CONFIRMED.** $750B+ is a conservative rounding of the disclosed figures; the undisclosed Meta deal makes the true total higher. The figure is directly derivable from the table.

---

### Claim: "~25 GW of locked capacity"

**Source: `lib/aiCompute.ts`** — summing the `gw` field for rows with specific figures:

| Row | GW |
|-----|----|
| Anthropic / AWS | 5 GW |
| Anthropic / Google | 5 GW |
| OpenAI / Microsoft (Stargate) | 10 GW |
| OpenAI / Oracle | 4.5 GW |
| OpenAI / AWS | GPU units, no GW stated |
| Meta / AWS | CPU cores, no GW stated |
| xAI / Colossus | 2 GW |
| **Sum of stated GW** | **26.5 GW** |

**Verdict: CONFIRMED.** 26.5 GW rounds conservatively to ~25 GW, and two rows (OpenAI/AWS, Meta/AWS) have no GW equivalent disclosed, so ~25 GW is a defensible floor.

---

### Claim: "GPU lead times 12-16 weeks"

**Source: `app/api/intelligent-brief/route.ts`, line 43** — hardcoded string in the prompt:
```
- GPU lead times: 12-16 weeks for H100/H200 class; B100 allocation-based
```

Also hardcoded in `components/HyperscalerCapEx.tsx`, line 3.

**Verdict: HARDCODED.** This figure is not sourced from a live API or a dated external source in the codebase. It was added 2026-04-24 and has not been updated since. The value is plausible as of Q1 2026 but has no citation in the code. **Should be attributed to a specific source (e.g., CDW/Dell reseller channel data) and updated quarterly.**

---

### Claim: "Data center construction +22% YoY"

**Note:** The LinkedIn post cites `+22% YoY` but the codebase shows two different values:
- `intelligent-brief/route.ts:44`: `+20-25% YoY`  
- `HyperscalerCapEx.tsx:4`: `+23% YoY`

Neither matches the `+22%` in the post. The post figure appears to be a rounded midpoint of the `+20-25%` range, chosen editorially.

**Source: `app/api/intelligent-brief/route.ts`, line 44** — hardcoded string.

**Verdict: HARDCODED, NO SOURCE, THREE VERSIONS OF THE SAME STAT.** The post used `+22%`, the component displays `+23%`, the prompt says `+20-25%`. These are out of sync. The underlying number has no citation in the codebase. **Flag for P1 consolidation.**

---

### Claim: The actionable Lumen quote ("Hold new 1-year commits... lock GPU capacity now... push hard on SaaS renewals")

**Source: `app/api/intelligent-brief/route.ts`** — generated live by claude-opus-4-7 from the dynamic `buildPrompt()` function.

The quote is constructed from:
1. Live market data passed in (VIX, SPY, breadth, exposure guidance, sector leaders, macro signals)
2. The hardcoded infrastructure context block (lines 39–44): SaaS multiples, GPU lead times, DC growth
3. Paragraph 3 instruction: *"What should a FinOps practitioner do today? Make it specific and direct."*
4. The example in the schema: *"With Defensive signal and elevated uncertainty, hold new 1-year commits unless business-critical. GPU capacity is the one exception — secure it now before lead times extend further."*

**Verdict: PARTIALLY GROUNDED.** The directional call ("Hold," "lock," "push hard") is grounded in live market signals (exposure guidance, VIX, breadth). The specific action items are plausible but the supporting numbers (GPU lead times, SaaS multiples) come from hardcoded context, not a live source. The example embedded in the schema also primes the model toward this type of language — meaning the quote's structure is partially template-driven. The schema example (`"GPU capacity is the one exception — secure it now"`) is so close to the published quote that it likely directly shaped the output.

---

## Appendix: Risk Summary

| Risk | Severity | Status |
|------|----------|--------|
| No grounding constraint in intelligent-brief system prompt | HIGH | **Fixed (P0)** |
| No grounding constraint in morning-brief prompt | HIGH | **Fixed (P0)** |
| "Quantify everything" rule unbounded in ai-compute-brief | MEDIUM | **Fixed (P0)** |
| Prompt vs. UI value sync (DC growth: ~20-25% vs +23%) | MEDIUM | P1 — not fixed in this branch |
| Hardcoded GPU lead times with no source citation | MEDIUM | P1 — not fixed in this branch |
| Hardcoded DC growth with no source citation | MEDIUM | P1 — not fixed in this branch |
| Cloud valuation multiples hardcoded with no source | MEDIUM | P1 — not fixed in this branch |
| Schema example in intelligent-brief shapes Lumen output voice | LOW | By design — acceptable |
| Fallback text in ai-compute-brief not labeled as non-AI | LOW | Informational — no specific numbers in fallback |
