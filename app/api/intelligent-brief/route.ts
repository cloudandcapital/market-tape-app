import Anthropic from '@anthropic-ai/sdk'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import type { MarketContextData, BriefResponse } from '@/lib/intelligentTypes'
import { buildInfraContextBlock } from '@/lib/industryBenchmarks'
import { fetchLiveMultiples } from '@/lib/liveMultiples'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export const INTELLIGENT_BRIEF_MODEL = 'claude-sonnet-4-6'
const INTELLIGENT_BRIEF_SYSTEM_PROMPT = 'You are a senior FinOps market analyst writing for Bloomberg terminal users. Your style: lead with the story, support it with verifiable numbers, and keep each field concise. Write "Infrastructure is hot, software is not" not "SaaS cohort at 6-8x NTM P/S reflects compression." Be direct but distinguish measured data, sourced benchmarks, estimates, and your interpretation. Treat market and benchmark signals as strategic decision support. Do not present them as organization-specific operational mandates without workload, utilization, contractual, and business context. GROUNDING RULE: Use ONLY the data and estimates provided in the user message. Do not invent percentages, industry benchmarks, or statistics not present in that context. If a specific number is not in the data you were given, use qualitative language instead ("compressed," "elevated," "tightening"). Do not cite named industry reports, analysts, or vendor data sources unless explicitly provided in the context. VERIFIABILITY RULE: This applies to every output field. Every numeric value you cite must appear in the user-visible dashboard sections (Market Status, Market Internals, Macro Context, Sectors, Cloud Valuations, Hyperscaler CapEx, Tech Concentration, Momentum Universe Leaders/Laggards, AI Compute Commitments, FinOps Signals captions, Risk Alerts captions). If a value exists in your context but is annotated [internal] or [not user-visible], or is otherwise not displayed to users, use qualitative language instead ("the dollar is weakening," "gold is firming," "small caps lagging," "narrow conviction," "mixed signals"). Do not cite specific percentages, scores, or values that users cannot verify against the page. TEMPORAL ACCURACY RULE: The market data in the user message reflects the latest completed trading session, which may not be the same day this analysis is generated. Do not use the words "today" or "this morning" in any output field. Use "latest session" or "last session" instead. You MUST respond with ONLY valid JSON — no markdown, no code blocks, no preamble.'

function buildPrompt(ctx: MarketContextData, multiples: { publicCloud: string; saas: string; aiInfra: string; source?: 'live' | 'fallback' }): string {
  const { marketSessionLabel, marketData: m, sectorData, macroData: mac, leaderboard } = ctx

  const topSectors = sectorData.slice(0, 5).map(s => `${s.ticker} ${s.rs1m > 0 ? '+' : ''}${s.rs1m.toFixed(2)}`).join(' | ')
  const bottomSectors = sectorData.slice(-5).reverse().map(s => `${s.ticker} ${s.rs1m > 0 ? '+' : ''}${s.rs1m.toFixed(2)}`).join(' | ')
  const topStocks = leaderboard.leaders.slice(0, 5).map(s => `${s.ticker} (${s.rs1m.toFixed(1)}% RS, ${s.intra_pct > 0 ? '+' : ''}${s.intra_pct.toFixed(1)}% latest session)`).join(', ')

  // liveMultiples is fetched by the POST handler and threaded in here
  // so Lumen receives genuine market-derived values, never training-data guesses
  return `MARKET DATA — ${marketSessionLabel}

EXPOSURE: ${m.guidance} (${m.exposureLevel}/100)
VIX: ${m.vix.toFixed(1)} (${m.vixD1 > 0 ? '+' : ''}${m.vixD1.toFixed(1)}% session)${m.vix > 30 ? ' — ELEVATED FEAR' : m.vix < 15 ? ' — COMPLACENT' : ''}
SPY: $${m.spy.toFixed(0)} (${m.spyD1 > 0 ? '+' : ''}${m.spyD1.toFixed(1)}% session)

TRENDS: Long-term ${m.trends.long} | Intermediate ${m.trends.intermediate} | Short-term ${m.trends.short}
BREADTH: ${m.breadth.label} — ${m.breadth.above20d.toFixed(0)}% above 20d MA, ${m.breadth.above50d.toFixed(0)}% above 50d MA
MOMENTUM: ${m.momentum.label} [internal score ${m.momentum.score}/100 — not user-visible, do not cite this number]
RISK: Volatility ${m.risk.volatility} | Sentiment ${m.risk.sentiment} | Momentum ${m.risk.momentum}

SECTOR LEADERS (1M RS vs SPY):
Strong: ${topSectors}
Weak: ${bottomSectors}

MOMENTUM LEADERS: ${topStocks}

MACRO:
Bonds (TLT): ${mac.tlt ? `${mac.tlt.rs1m > 0 ? '+' : ''}${mac.tlt.rs1m.toFixed(2)}% 1M RS, Grade ${mac.tlt.grade}` : 'N/A'} ${mac.tlt && mac.tlt.rs1m < -2 ? '— BONDS SELLING OFF (rates rising)' : ''}
Credit (HYG): ${mac.hyg ? `${mac.hyg.rs1m > 0 ? '+' : ''}${mac.hyg.rs1m.toFixed(2)}% 1M RS, Grade ${mac.hyg.grade}` : 'N/A'}
Dollar (DXY): ${mac.dxy ? `${mac.dxy.last.toFixed(1)} (${mac.dxy.rs1m > 0 ? '+' : ''}${mac.dxy.rs1m.toFixed(2)}% 1M RS)` : 'N/A'}
Gold (GLD): ${mac.gld ? `$${mac.gld.last.toFixed(0)} (${mac.gld.d1 > 0 ? '+' : ''}${mac.gld.d1.toFixed(1)}% latest session) [1M RS: ${mac.gld.rs1m > 0 ? '+' : ''}${mac.gld.rs1m.toFixed(2)}% — internal, not user-visible, do not cite]` : 'N/A'}
Oil (USO): ${mac.uso ? `$${mac.uso.last.toFixed(1)} (${mac.uso.d1 > 0 ? '+' : ''}${mac.uso.d1.toFixed(1)}% latest session)` : 'N/A'}
Small/Large (IWM vs QQQ): ${mac.iwm && mac.qqq ? `small caps ${mac.iwm.rs1m > mac.qqq.rs1m ? 'outperforming' : 'underperforming'} [individual RS1M — IWM: ${mac.iwm.rs1m.toFixed(2)}, QQQ: ${mac.qqq.rs1m.toFixed(2)} — internal, only direction and spread are user-visible, do not cite individual RS values]` : 'N/A'}

${buildInfraContextBlock(multiples)}

Based on ALL of the above, generate a comprehensive FinOps intelligence report.

SIGNAL ANCHORS — apply these rules to produce deterministic verdicts on consistent data:

FINOPS SIGNALS:
• cloudSpend → primary: EXPOSURE GUIDANCE. Defensive (<40): review or defer non-critical expansion and raise the approval threshold for discretionary expansion. Neutral (40-60): review utilization and optimize existing capacity. Risk-On (>60): review planned expansion against workload and business needs. Cite exposure level.
• saasRenewals → primary: SaaS NTM multiple + HYG RS1M. If SaaS is materially compressed from peak and HYG is negative, benchmark renewal pricing and test for concessions. If SaaS is recovering or HYG is positive, monitor pricing before extending commitment duration. Cite the actual visible multiple and HYG grade; do not reference any specific threshold number.
• infrastructure → primary: GPU supply status from CLOUD INFRASTRUCTURE CONTEXT. Describe the constraint as: "Blackwell availability remains constrained relative to demand in the current benchmark." If the source says demand is supply-constrained, protect existing Blackwell access when workloads depend on it while treating broadly available models as standard procurement. Cite only the supplied status and price ranges; do not infer urgency or a booking horizon.

RISK ALERTS — generate one entry per condition that is TRUE in the current data. These are the only permitted alert types; do not generate others:
• "GPU Capacity Tightening" (warning): if the GPU benchmark explicitly describes any current product generation as supply-constrained
• "Rates Rising" (warning): if TLT RS1M is below −2%
• "SaaS Discount Window" (opportunity): if SaaS average NTM multiple is materially compressed from peak (well below 2021 highs, indicating buyer leverage on renewals)
• "Data Center Supply Gap" (warning): if DC demand is outpacing new construction
• "Dollar Weakening" (warning): if DXY RS1M is below −5%

PROSE ANCHORS:
• morningBrief headline: priority — (1) if Defensive AND VIX > 20 → risk-off framing; (2) if TLT RS1M below −3% AND DXY RS1M below −5% → macro dislocation framing; (3) else → lead with the dominant sector rotation (strongest sector vs weakest)
• morningBrief is interpretation and synthesis only: target 180–220 words and never exceed 230 words across all its fields. Keep marketRead under 75 words, each bullet under 18 words, and action under 25 words. Do not repeat whole Market Status, FinOps Signals, Risk Alerts, Sector Insights, Commitment Windows, valuation, CapEx, or AI-deal sections.
• distinguish measured market data from benchmark claims and interpretation; use cautious language for estimates, targets, and reported claims
• action: lead with an EXPOSURE GUIDANCE review priority; mention protecting GPU access only when the supplied benchmark supports it and workload dependence would justify it
• sectorInsights: lead with the highest RS1M sector from SECTOR LEADERS, acknowledge the lowest, connect to cloud budget implications

Return ONLY valid JSON with no markdown, no code blocks, no explanation text:

{
  "morningBrief": {
    "headline": "single market story, 10-12 words",
    "marketRead": "2-3 concise sentences synthesizing the dominant measured market signal without listing the dashboard",
    "whatChanged": ["up to three short bullets; measured changes only"],
    "cloudFinanceImplications": ["one or two short bullets; interpretation, not repeated raw panels"],
    "action": "one clear action or decision to monitor"
  },
  "finopsSignals": {
    "cloudSpend": "one strategic decision-support sentence; do not repeat Lumen",
    "saasRenewals": "one strategic decision-support sentence; do not repeat Lumen",
    "infrastructure": "one strategic decision-support sentence; do not repeat Lumen"
  },
  "commitmentWindows": {
    "oneYear": {
      "status": "Use EXPOSURE GUIDANCE as the primary signal — if guidance is Risk-On: FAVORABLE; if Neutral: HOLD; if Defensive: HOLD. Upgrade to CAUTION only if VIX is above 28 AND breadth is below 40%. Cite exposure guidance level and VIX.",
      "reason": "1-2 sentences citing exposure guidance, VIX, and breadth. Example: 'Defensive signal at 21/100 with VIX at 17 — market is not in panic, but review or defer non-critical expansion and monitor before extending commitment duration.'"
    },
    "threeYear": {
      "status": "Use TLT 1M RS direction as the primary signal — if TLT is negative (rates rising, bonds selling off): CAUTION; if TLT is modestly negative and DXY is also negative by more than 5%: CAUTION; if TLT is rising and macro stable: FAVORABLE; otherwise HOLD. Cite TLT RS1M and DXY RS1M.",
      "reason": "1-2 sentences citing bond direction and dollar trend. Example: 'TLT down 6.23% in a month with the dollar falling 9.47% — monitor for rate stabilization before extending commitment duration.'"
    },
    "spot": {
      "status": "Evaluate general cloud workloads ONLY (compute, storage, network, batch jobs) — NOT GPU or accelerated compute. GPU supply is covered in riskAlerts, do not let it influence this verdict. Use VIX and breadth as the sole signals: VIX below 20 AND breadth above 55% = SAFE; VIX above 28 OR breadth below 40% = RISKY; in between use judgment but lean SAFE if VIX is below 22. Cite VIX and breadth only.",
      "reason": "1 sentence citing VIX and breadth for general cloud workloads only. Example: 'VIX at 17 and 73% of names above their 50-day MA support reviewing spot use for tactical workloads and batch jobs.'"
    }
  },
  "riskAlerts": [
    { "type": "warning or opportunity", "title": "3-5 word title", "message": "1-2 sentences citing the specific data value that triggered this alert" }
  ],
  "sectorInsights": "maximum two short sentences: strongest rotation, weakest rotation, and only the direct budget implication",
  "cloudValuations": {
    "publicCloud": "Use the Public Cloud NTM multiple from CLOUD INFRASTRUCTURE CONTEXT above — add a brief trend note",
    "saasAverage": "Use the SaaS Average NTM multiple from CLOUD INFRASTRUCTURE CONTEXT above — add a brief trend note",
    "aiInfrastructure": "Use the AI Infrastructure NTM multiple from CLOUD INFRASTRUCTURE CONTEXT above — add a brief trend note"
  },
  "hyperscalerCapex": {
    "trend": "Use the Hyperscaler CapEx Trend from CLOUD INFRASTRUCTURE CONTEXT above",
    "gpuSupplyStatus": "Use the GPU Supply Status value from CLOUD INFRASTRUCTURE CONTEXT above",
    "dataCenterGrowth": "Use the Data Center Construction value from CLOUD INFRASTRUCTURE CONTEXT above"
  },
  "generatedAt": "${new Date().toISOString()}"
}`
}

function parseResponse(text: string): BriefResponse {
  // Try direct parse first
  try { return JSON.parse(text) } catch {}

  // Try extracting from markdown code block
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1]) } catch {}
  }

  // Try extracting the outermost JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]) } catch {}
  }

  throw new Error('Could not parse JSON from response')
}

export async function generateIntelligentBrief(
  context: MarketContextData,
  multiples: { publicCloud: string; saas: string; aiInfra: string; source?: 'live' | 'fallback' },
  model = INTELLIGENT_BRIEF_MODEL,
): Promise<BriefResponse> {
  const message = await client.messages.create({
    model,
    max_tokens: 1800,
    system: [{ type: 'text', text: INTELLIGENT_BRIEF_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: buildPrompt(context, multiples) }],
  }, { signal: AbortSignal.timeout(65_000) })

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  return parseResponse(text)
}

// Shared Data Cache entry: one generation per unique 30-minute market snapshot.
// Bump the version whenever the response schema or prompt contract changes.
export const getCachedIntelligentBrief = unstable_cache(
  async (
    context: MarketContextData,
    multiples: { publicCloud: string; saas: string; aiInfra: string; source?: 'live' | 'fallback' },
  ) => ({
    data: await generateIntelligentBrief(context, multiples),
    cachedAt: Date.now(),
  }),
  ['intelligent-brief-v16', INTELLIGENT_BRIEF_MODEL],
  { revalidate: 1800, tags: ['intelligent-brief'] },
)

export async function POST(req: Request) {
  const requestStartedAt = performance.now()
  let marketDataCompletedAt = requestStartedAt
  let claudeStartedAt = requestStartedAt
  try {
    const { context }: { context: MarketContextData } = await req.json()

    // Fetch live multiples in parallel with no extra latency — Next.js cache
    // serves subsequent calls within the 30-min window from memory.
    const multiples = await fetchLiveMultiples()
    marketDataCompletedAt = performance.now()
    claudeStartedAt = marketDataCompletedAt

    const cachedResult = await getCachedIntelligentBrief(context, multiples)
    const data = cachedResult.data
    const completedAt = performance.now()
    const cacheAgeMs = Math.max(0, Date.now() - cachedResult.cachedAt)
    console.info(
      `[intelligent-brief:timing] marketDataMs=${Math.round(marketDataCompletedAt - requestStartedAt)} ` +
      `claudeMs=${Math.round(completedAt - claudeStartedAt)} totalMs=${Math.round(completedAt - requestStartedAt)} ` +
      `cacheAgeMs=${cacheAgeMs}`,
    )

    return NextResponse.json({ success: true, data }, {
      headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=86400' },
    })
  } catch (err) {
    const failedAt = performance.now()
    const marketDataFailed = claudeStartedAt === requestStartedAt
    console.info(
      `[intelligent-brief:timing] marketDataMs=${Math.round((marketDataFailed ? failedAt : marketDataCompletedAt) - requestStartedAt)} ` +
      `claudeMs=${marketDataFailed ? 0 : Math.round(failedAt - claudeStartedAt)} totalMs=${Math.round(failedAt - requestStartedAt)} failed=true`,
    )
    const errorStatus = typeof err === 'object' && err !== null && 'status' in err ? String(err.status) : 'unknown'
    const errorName = err instanceof Error ? err.name : 'UnknownError'
    console.error(`[intelligent-brief:error] name=${errorName} status=${errorStatus}`)
    return NextResponse.json({ success: false, error: 'Analysis is temporarily unavailable.' }, { status: 500 })
  }
}
