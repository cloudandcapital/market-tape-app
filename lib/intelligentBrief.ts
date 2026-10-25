import { unstable_cache } from 'next/cache'
import Anthropic from '@anthropic-ai/sdk'
import type { MarketContextData, BriefResponse } from '@/lib/intelligentTypes'
import { BENCHMARKS, buildInfraContextBlock } from '@/lib/industryBenchmarks'
import { enforceInterpretationGuardrails } from '@/lib/intelligentGuardrails'
import { assertBriefResponse } from '@/lib/briefValidation'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0 })
export const INTELLIGENT_BRIEF_MODEL = 'claude-sonnet-4-6'
export const INTELLIGENT_BRIEF_SYSTEM_PROMPT = "Explain markets to a curious reader and a technology-finance team. Use plain English and only supplied data. Separate measurements, source-dated benchmarks, and interpretation. RS1M is a dimensionless volatility-adjusted score: (20-session asset return minus SPY return) divided by the asset’s 20-session realized volatility. Never append % to a score or infer absolute price direction, interest-rate direction, credit spreads, or vendor discounts from it. Daily and 20-session percentage price changes are labeled separately. VIX d1 is a percentage price change, never a point change; only the supplied Treasury yield movement uses basis points. Market prices do not establish cloud commitment duration, Spot safety, capacity availability, or vendor willingness to discount. Do not issue purchasing verdicts or imply a tested causal relationship. COMMODITY ETF PROXY RULE: GLD and USO are ETF share prices, not commodity spot quotes; never attach dollars-per-ounce or dollars-per-barrel meaning. Use the supplied price date, not today or this morning. Daily bars may still change during a session. Use 20-session language for score rankings. Missing values stay Unavailable. Use tracked equity ETFs for breadth, never stocks or all equities. Cite only numbers visible in the dashboard, expanded instrument table, or source tooltips. Round percentages to two decimals and yield changes to whole basis points. Never invent forecasts, savings, quotes, benchmarks, or sources. Return only JSON."
export const BRIEF_INSTRUCTIONS = [
  "RS1M rankings use score units, not percent. A higher score does not establish a higher raw return across assets with different volatility.",
  "cloudSpend: ask what usage, budget, or contract data is needed; breadth does not justify expanding or pausing a workload.",
  "saasRenewals: a valuation or HYG score cannot establish a discount window. Ask about the quote, seats used, notice deadline, or alternatives.",
  "infrastructure: summarize the source-dated GPU comparison without urgency or a booking horizon.",
  "Never claim Blackwell or B200 supply cannot be resolved through standard procurement channels.",
  "The action must be a market research question about a named ticker or source, not cloud utilization or a procurement decision.",
  "Use the supplied Treasury yield move and semiconductor ETF price moves when relevant; do not confuse a yield change in basis points with a price return.",
  "Copy valuations exactly. Do not infer trends from a single snapshot or revive archived fallbacks.",
  "Only permitted alerts: Bond ETF Weakness if TLT d20 < -2%; Dollar Weakening if DXY d20 < -5%; GPU Capacity Tightening if a source explicitly calls a named generation supply-constrained; Data Center Capacity Tightness if vacancy <=2% and construction preleased >=80%. These are review flags, not calibrated forecasts.",
  "Do not generate Rates Rising from a TLT score or SaaS Discount Window from a multiple.",
  "Keep morningBrief below 180 words. whatChanged describes measured session movements, not differences between stored snapshots. cloudFinanceImplications asks questions, without inventing corporate budget behavior.",
  "Do not repeat a long qualification in every field. Frame decisions as questions to check against actual usage and terms.",
  "Breadth and trends describe the explicitly classified equity ETF basket, excluding SPY and all macro instruments. Say tracked equity ETFs, never stocks. HYG price is not a credit spread.",
  "All commitmentWindows statuses must be REVIEW. Reasons identify missing workload and contract evidence. Never call Spot safe based on markets."
]
const RESPONSE_SHAPE = {
  "morningBrief": {
    "headline": "8–12 word market story",
    "marketRead": "two short grounded sentences",
    "whatChanged": [
      "up to three measured session observations"
    ],
    "cloudFinanceImplications": [
      "one or two questions for a technology cost review"
    ],
    "action": "one research question or source to check"
  },
  "finopsSignals": {
    "cloudSpend": "one review question",
    "saasRenewals": "one review question",
    "infrastructure": "one source-dated observation"
  },
  "commitmentWindows": {
    "oneYear": {
      "status": "REVIEW",
      "reason": "Needs usage and terms"
    },
    "threeYear": {
      "status": "REVIEW",
      "reason": "Needs long-term usage and terms"
    },
    "spot": {
      "status": "REVIEW",
      "reason": "Needs interruption tolerance and fallback capacity"
    }
  },
  "riskAlerts": [
    {
      "type": "warning",
      "title": "one permitted title",
      "message": "one source-backed observation with actual units"
    }
  ],
  "sectorInsights": "one sentence on highest and lowest 20-session scores; no inferred corporate budget behavior",
  "cloudValuations": {
    "publicCloud": "copy value",
    "saasAverage": "copy value",
    "aiInfrastructure": "copy value"
  },
  "hyperscalerCapex": {
    "trend": "copy benchmark",
    "gpuSupplyStatus": "copy benchmark",
    "dataCenterGrowth": "copy benchmark"
  },
  "generatedAt": "use generationTime"
}

export function buildPrompt(ctx: MarketContextData, multiples: { publicCloud: string; saas: string; aiInfra: string; source?: 'live' | 'fallback' }): string {
  return JSON.stringify({
    marketSessionLabel: ctx.marketSessionLabel, marketData: ctx.marketData, sectorData: ctx.sectorData,
    leaderboard: { leaders: ctx.leaderboard.leaders.slice(0, 5), laggards: ctx.leaderboard.laggards.slice(0, 5) },
    macroData: ctx.macroData, infrastructureData: ctx.infrastructureData,
    units: { rs1m: 'dimensionless volatility-adjusted score', d1: 'daily percentage price change', d20: '20-session percentage price change' },
    infrastructure: buildInfraContextBlock(multiples), instructions: BRIEF_INSTRUCTIONS, responseShape: RESPONSE_SHAPE, generationTime: new Date().toISOString(),
  })
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
  }, { signal: AbortSignal.timeout(45_000) })

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  const parsed = parseResponse(text)
  assertBriefResponse(parsed)
  const result = enforceInterpretationGuardrails(parsed, { market: context, multiples, benchmarks: BENCHMARKS })
  // Source values and generation time are server-controlled.
  result.cloudValuations = { publicCloud: multiples.publicCloud, saasAverage: multiples.saas, aiInfrastructure: multiples.aiInfra }
  result.generatedAt = new Date().toISOString()
  return result
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
  ['intelligent-brief-v25', INTELLIGENT_BRIEF_MODEL],
  { revalidate: 1800, tags: ['intelligent-brief'] },
)
