# Lumen Consistency Audit
**Date:** 2026-05-02  
**Scope:** All Lumen-generated output fields in `app/api/intelligent-brief/route.ts`  
**Method:** Each field evaluated for: (1) whether it has a primary signal anchor, (2) whether the same data could produce materially different verdicts/framing across regenerations.

---

## Summary Table

| Section | Previously anchored? | Inconsistency risk | Fix applied |
|---|---|---|---|
| Commitment Windows — Spot | No | High (GPU vs VIX/breadth flip) | ✅ Fixed prior session |
| Commitment Windows — 1-Year | No | High (guidance vs VIX ambiguity) | ✅ Fixed prior session |
| Commitment Windows — 3-Year | No | High (rates vs dollar emphasis) | ✅ Fixed prior session |
| FinOps Signals — Cloud Spend | No | **High** (any lens valid: expand/freeze/hold) | ✅ Fixed this session |
| FinOps Signals — SaaS Renewals | Partial ("credit/macro") | **High** (lock vs push based on framing) | ✅ Fixed this session |
| FinOps Signals — Infrastructure | No | **High** (GPU vs DC vs CapEx emphasis) | ✅ Fixed this session |
| Risk Alerts | No | **High** (variable count, variable triggers) | ✅ Fixed this session |
| Sector Insights | No | **Medium** (picks different emphasis sector each run) | ✅ Fixed this session |
| Morning Brief — Paragraph 2 | No | **Medium** (GPU-first vs SaaS-first ordering) | ✅ Fixed this session |
| Morning Brief — Paragraph 3 | Partial (example exists) | **Medium** (GPU exception not always surfaced) | ✅ Fixed this session |
| Hyperscaler CapEx detail | No | **Medium** (GPU vs CapEx vs DC as lead) | ✅ Fixed this session |
| Morning Brief — Headline | No | Low/Medium | ✅ Priority order added |
| Morning Brief — Paragraph 1 | Partial (example exists) | Low (market story, prose variation acceptable) | No change needed |
| Cloud Valuations | Yes (anchored to specific multiples) | Low | No change needed |
| AI Compute Commitments line | Yes (anchored to table data + $750B+) | Low | No change needed |

---

## Section Details

### FinOps Signals — Cloud Spend
**Was:** `"direct 1-sentence action — no jargon, start with a verb"`  
**Risk:** High. With Defensive guidance, Lumen could output either "Accelerate cloud migration" (risk-on frame) or "Freeze discretionary cloud spend" (defensive frame) — both are grammatically valid responses to the same data. No primary signal defined.  
**Fix:** Primary signal = **EXPOSURE GUIDANCE** (string: Risk-On/Neutral/Defensive). Defensive (<40) → freeze. Neutral (40-60) → hold and optimize. Risk-On (>60) → expand. Cite exposure level.

### FinOps Signals — SaaS Renewals
**Was:** `"direct 1-sentence action based on credit/macro conditions"`  
**Risk:** High. "Credit/macro conditions" is ambiguous — could mean "rates rising so lock pricing now" (rate-fear frame) or "SaaS multiples compressed so push hard" (buyer-opportunity frame). Same data, opposite action.  
**Fix:** Primary = **SaaS NTM multiple + HYG RS1M**. Below 7.5× AND HYG negative → push vendors. Above 8× OR HYG positive → lock pricing. Both signals must point the same direction to switch frames.

### FinOps Signals — Infrastructure
**Was:** `"direct 1-sentence action, reference specific supply constraints or timelines"`  
**Risk:** High. Could lead with GPU supply (shortage), DC build (supply gap), or CapEx trend (spending is up) — three valid angles that produce different actionable sentences.  
**Fix:** Primary = **GPU supply status** from CLOUD INFRASTRUCTURE CONTEXT. Sold-out/lead times >12 weeks → urgency. Otherwise → standard procurement.

### Risk Alerts
**Was:** One placeholder entry `{ "type": "warning or opportunity", "title": "3-5 word title", "message": "..." }` with no trigger logic or count constraints.  
**Risk:** High. Lumen could produce 2 alerts or 8 alerts on identical data depending on which signals it focuses on. "GPU Capacity Tightening" might appear in one run, be absent in the next.  
**Fix:** Five named alert types with explicit trigger thresholds:
- `"GPU Capacity Tightening"` (warning): GPU sold-out or lead times > 12 weeks
- `"Rates Rising"` (warning): TLT RS1M < −2%
- `"SaaS Discount Window"` (opportunity): SaaS NTM multiple < 7.5×
- `"Data Center Supply Gap"` (warning): DC demand > new construction
- `"Dollar Weakening"` (warning): DXY RS1M < −5%

Only these alert types are permitted. Each fires if and only if its condition is true.

### Sector Insights
**Was:** `"one paragraph connecting today's sector rotation to infrastructure and cloud budget decisions"`  
**Risk:** Medium. Could lead with any of 11 sectors. Lumen might emphasize Healthcare one run and Energy the next depending on which it finds most "interesting" rather than most extreme.  
**Fix:** Lead with the **#1 RS1M sector** from SECTOR LEADERS (the objective top-ranked name). Acknowledge the **bottom-ranked sector**. The structural story is always top-vs-bottom.

### Morning Brief — Paragraph 2 (Infrastructure Angle)
**Was:** Example style given but no required ordering.  
**Risk:** Medium. Could lead with SaaS multiples (software is cheap) or GPU scarcity (hardware is scarce) — opposite economic conditions, both valid on the same data.  
**Fix:** Required order — **GPU supply status FIRST**, then SaaS multiples, then CapEx direction. The scarcity story leads because it's time-sensitive and directly actionable.

### Morning Brief — Paragraph 3 (Action)
**Was:** Example style is good but primary signal not explicit.  
**Risk:** Medium. GPU exception might appear in some runs but not others.  
**Fix:** **EXPOSURE GUIDANCE** leads the recommendation. GPU exception is always surfaced if supply is tight — it's the one action that overrides the guidance directive.

### Hyperscaler CapEx — Detail
**Was:** `"one sentence on current CapEx cycle and what it means based on the context provided"`  
**Risk:** Medium. Could frame as "hyperscalers are spending record amounts" (scale story) vs "all that spend is chasing sold-out GPU supply" (scarcity story) vs "DC construction is declining despite demand" (constraint story).  
**Fix:** **CapEx trend direction** (Expanding/Stable/Contracting) leads. GPU supply implication follows. Consistent two-part structure.

### Morning Brief — Headline
**Was:** No priority order for which story leads.  
**Risk:** Low/Medium. Acceptable that the headline varies in wording, but the ANGLE (macro vs risk-off vs sector rotation) was previously arbitrary.  
**Fix:** Priority order: (1) Defensive + VIX > 20 → risk-off framing; (2) TLT < −3% AND DXY < −5% → macro dislocation; (3) else → sector rotation story. Within each frame the exact wording can vary.

---

## Architecture Going Forward

The architecture after this audit: a `SIGNAL ANCHORS` block sits between the data context and the JSON schema in the prompt. It defines:
- Primary signal → determines direction/verdict
- Secondary signal → tie-breaker when primary is ambiguous
- Permitted alert types (exhaustive list, no others allowed)
- Required prose ordering for paragraphs with multiple valid angles

The JSON field descriptions reference the anchors (`"apply cloudSpend anchor above"`) rather than embedding verbose logic inline. This keeps the schema readable and the anchor logic maintainable in one place.

**Rule for adding new data fields to the prompt:**
> Every new data field must either (a) be displayed on the user-visible dashboard, or (b) have an explicit signal anchor in the SIGNAL ANCHORS block specifying when and how Lumen may reference it. A field with no anchor and no display is a future hallucination vector.
