import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import type { MarketContextData, BriefResponse } from '@/lib/intelligentTypes'
import { buildInfraContextBlock } from '@/lib/industryBenchmarks'
import { fetchLiveMultiples } from '@/lib/liveMultiples'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildPrompt(ctx: MarketContextData, multiples: { publicCloud: string; saas: string; aiInfra: string; source?: 'live' | 'fallback' }): string {
  const { marketData: m, sectorData, macroData: mac, leaderboard } = ctx

  const topSectors = sectorData.slice(0, 5).map(s => `${s.ticker} ${s.rs1m > 0 ? '+' : ''}${s.rs1m.toFixed(2)}`).join(' | ')
  const bottomSectors = sectorData.slice(-5).reverse().map(s => `${s.ticker} ${s.rs1m > 0 ? '+' : ''}${s.rs1m.toFixed(2)}`).join(' | ')
  const topStocks = leaderboard.leaders.slice(0, 5).map(s => `${s.ticker} (${s.rs1m.toFixed(1)}% RS, ${s.intra_pct > 0 ? '+' : ''}${s.intra_pct.toFixed(1)}% today)`).join(', ')

  // liveMultiples is fetched by the POST handler and threaded in here
  // so Lumen receives genuine market-derived values, never training-data guesses
  return `MARKET DATA — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

EXPOSURE: ${m.guidance} (${m.exposureLevel}/100)
VIX: ${m.vix.toFixed(1)} (${m.vixD1 > 0 ? '+' : ''}${m.vixD1.toFixed(1)}% today)${m.vix > 30 ? ' — ELEVATED FEAR' : m.vix < 15 ? ' — COMPLACENT' : ''}
SPY: $${m.spy.toFixed(0)} (${m.spyD1 > 0 ? '+' : ''}${m.spyD1.toFixed(1)}% today)

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
Gold (GLD): ${mac.gld ? `$${mac.gld.last.toFixed(0)} (${mac.gld.d1 > 0 ? '+' : ''}${mac.gld.d1.toFixed(1)}% today) [1M RS: ${mac.gld.rs1m > 0 ? '+' : ''}${mac.gld.rs1m.toFixed(2)}% — internal, not user-visible, do not cite]` : 'N/A'}
Oil (USO): ${mac.uso ? `$${mac.uso.last.toFixed(1)} (${mac.uso.d1 > 0 ? '+' : ''}${mac.uso.d1.toFixed(1)}% today)` : 'N/A'}
Small/Large (IWM vs QQQ): ${mac.iwm && mac.qqq ? `small caps ${mac.iwm.rs1m > mac.qqq.rs1m ? 'outperforming' : 'underperforming'} [individual RS1M — IWM: ${mac.iwm.rs1m.toFixed(2)}, QQQ: ${mac.qqq.rs1m.toFixed(2)} — internal, only direction and spread are user-visible, do not cite individual RS values]` : 'N/A'}

${buildInfraContextBlock(multiples)}

Based on ALL of the above, generate a comprehensive FinOps intelligence report. Return ONLY valid JSON with no markdown, no code blocks, no explanation text:

{
  "morningBrief": {
    "headline": "one sharp declarative sentence — the single market story today (10-12 words max, no jargon)",
    "paragraphs": [
      "paragraph 1 (market story): What is the market doing right now and why does it matter? Lead with the narrative, use 1-2 specific numbers to support it. Example style: 'Tech is carrying the market while everything else retreats — VIX at 19 signals controlled anxiety, not panic.' NOT: 'VIX is 19 which is below the 20 threshold indicating moderate volatility with breadth at 64%.'",
      "paragraph 2 (infrastructure angle): What does this mean for cloud and AI infrastructure? Lead with the business implication, add data as evidence. Example style: 'Hyperscalers are still building at full speed — GPU queues at 14 weeks and data center construction up 23% tell the story. SaaS multiples have compressed to 6-8x, meaning software vendors are negotiable.' NOT: 'SaaS cohort NTM P/S of 6-8x reflects multiple compression while AI infrastructure trades at 10-15x reflecting elevated growth expectations.'",
      "paragraph 3 (FinOps action): What should a FinOps practitioner do today? Make it specific and direct. Example style: 'With Defensive signal and elevated uncertainty, hold new 1-year commits unless business-critical. GPU capacity is the one exception — secure it now before lead times extend further.' Keep under 40 words."
    ]
  },
  "finopsSignals": {
    "cloudSpend": "direct 1-sentence action — no jargon, start with a verb",
    "saasRenewals": "direct 1-sentence action based on credit/macro conditions, start with a verb",
    "infrastructure": "direct 1-sentence action, reference specific supply constraints or timelines"
  },
  "commitmentWindows": {
    "oneYear": {
      "status": "Use EXPOSURE GUIDANCE as the primary signal — if guidance is Risk-On: FAVORABLE; if Neutral: HOLD; if Defensive: HOLD. Upgrade to CAUTION only if VIX is above 28 AND breadth is below 40%. Cite exposure guidance level and VIX.",
      "reason": "1-2 sentences citing exposure guidance, VIX, and breadth. Example: 'Defensive signal at 21/100 with VIX at 17 — market is not in panic but conditions do not support locking new 1-year spend. Wait for Risk-On signal before committing.'"
    },
    "threeYear": {
      "status": "Use TLT 1M RS direction as the primary signal — if TLT is negative (rates rising, bonds selling off): CAUTION; if TLT is modestly negative and DXY is also negative by more than 5%: CAUTION; if TLT is rising and macro stable: FAVORABLE; otherwise HOLD. Cite TLT RS1M and DXY RS1M.",
      "reason": "1-2 sentences citing bond direction and dollar trend. Example: 'TLT down 6.23% in a month with the dollar falling 9.47% — too much macro movement to lock long duration at current pricing. Wait for rate stabilization.'"
    },
    "spot": {
      "status": "Evaluate general cloud workloads ONLY (compute, storage, network, batch jobs) — NOT GPU or accelerated compute. GPU supply is covered in riskAlerts, do not let it influence this verdict. Use VIX and breadth as the sole signals: VIX below 20 AND breadth above 55% = SAFE; VIX above 28 OR breadth below 40% = RISKY; in between use judgment but lean SAFE if VIX is below 22. Cite VIX and breadth only.",
      "reason": "1 sentence citing VIX and breadth for general cloud workloads only. Example: 'VIX at 17 and 73% of names above their 50-day MA mean general spot pricing is stable — safe for tactical workloads and batch jobs.'"
    }
  },
  "riskAlerts": [
    { "type": "warning or opportunity", "title": "3-5 word title", "message": "1-2 sentence explanation" }
  ],
  "sectorInsights": "one paragraph connecting today's sector rotation to infrastructure and cloud budget decisions",
  "cloudValuations": {
    "publicCloud": "Use the Public Cloud NTM multiple from CLOUD INFRASTRUCTURE CONTEXT above — add a brief trend note",
    "saasAverage": "Use the SaaS Average NTM multiple from CLOUD INFRASTRUCTURE CONTEXT above — add a brief trend note",
    "aiInfrastructure": "Use the AI Infrastructure NTM multiple from CLOUD INFRASTRUCTURE CONTEXT above — add a brief trend note"
  },
  "hyperscalerCapex": {
    "trend": "Use the Hyperscaler CapEx Trend from CLOUD INFRASTRUCTURE CONTEXT above",
    "gpuLeadTimes": "Use the GPU Lead Times value from CLOUD INFRASTRUCTURE CONTEXT above",
    "dataCenterGrowth": "Use the Data Center Construction value from CLOUD INFRASTRUCTURE CONTEXT above",
    "detail": "one sentence on current CapEx cycle and what it means based on the context provided"
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

export async function POST(req: Request) {
  try {
    const { context }: { context: MarketContextData } = await req.json()

    // Fetch live multiples in parallel with no extra latency — Next.js cache
    // serves subsequent calls within the 30-min window from memory.
    const multiples = await fetchLiveMultiples()

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2500,
      system: 'You are a senior FinOps market analyst writing for Bloomberg terminal users. Your style: lead with the story, support with numbers. One clear takeaway per paragraph. Write "Infrastructure is hot, software is not" not "SaaS cohort at 6-8x NTM P/S reflects compression." Be direct, confident, and specific. GROUNDING RULE: Use ONLY the data and estimates provided in the user message. Do not invent percentages, industry benchmarks, or statistics not present in that context. If a specific number is not in the data you were given, use qualitative language instead ("compressed," "elevated," "tightening"). Do not cite named industry reports, analysts, or vendor data sources unless explicitly provided in the context. VERIFIABILITY RULE: This applies to every output field — morningBrief paragraphs, finopsSignals, commitmentWindows reasons, riskAlerts, sectorInsights, and all captions. Every numeric value you cite must appear in the user-visible dashboard sections (Market Status, Market Internals, Macro Context, Sectors, Cloud Valuations, Hyperscaler CapEx, Tech Concentration, Momentum Universe Leaders/Laggards, AI Compute Commitments, FinOps Signals captions, Risk Alerts captions). If a value exists in your context but is annotated [internal] or [not user-visible], or is otherwise not displayed to users, use qualitative language instead ("the dollar is weakening," "gold is firming," "small caps lagging," "narrow conviction," "mixed signals"). Do not cite specific percentages, scores, or values that users cannot verify against the page. You MUST respond with ONLY valid JSON — no markdown, no code blocks, no preamble.',
      messages: [{ role: 'user', content: buildPrompt(context, multiples) }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const data = parseResponse(text)

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Intelligent brief error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
