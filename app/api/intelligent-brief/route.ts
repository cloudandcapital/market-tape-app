import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import type { MarketContextData, BriefResponse } from '@/lib/intelligentTypes'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildPrompt(ctx: MarketContextData): string {
  const { marketData: m, sectorData, macroData: mac, leaderboard } = ctx

  const topSectors = sectorData.slice(0, 5).map(s => `${s.ticker} ${s.rs1m > 0 ? '+' : ''}${s.rs1m.toFixed(2)}`).join(' | ')
  const bottomSectors = sectorData.slice(-5).reverse().map(s => `${s.ticker} ${s.rs1m > 0 ? '+' : ''}${s.rs1m.toFixed(2)}`).join(' | ')
  const topStocks = leaderboard.leaders.slice(0, 5).map(s => `${s.ticker} (${s.rs1m.toFixed(1)}% RS, ${s.intra_pct > 0 ? '+' : ''}${s.intra_pct.toFixed(1)}% today)`).join(', ')

  return `MARKET DATA — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

EXPOSURE: ${m.guidance} (${m.exposureLevel}/100)
VIX: ${m.vix.toFixed(1)} (${m.vixD1 > 0 ? '+' : ''}${m.vixD1.toFixed(1)}% today)${m.vix > 30 ? ' — ELEVATED FEAR' : m.vix < 15 ? ' — COMPLACENT' : ''}
SPY: $${m.spy.toFixed(0)} (${m.spyD1 > 0 ? '+' : ''}${m.spyD1.toFixed(1)}% today)

TRENDS: Long-term ${m.trends.long} | Intermediate ${m.trends.intermediate} | Short-term ${m.trends.short}
BREADTH: ${m.breadth.label} — ${m.breadth.above20d.toFixed(0)}% above 20d MA, ${m.breadth.above50d.toFixed(0)}% above 50d MA
MOMENTUM: ${m.momentum.label} (score ${m.momentum.score}/100)
RISK: Volatility ${m.risk.volatility} | Sentiment ${m.risk.sentiment} | Momentum ${m.risk.momentum}

SECTOR LEADERS (1M RS vs SPY):
Strong: ${topSectors}
Weak: ${bottomSectors}

MOMENTUM LEADERS: ${topStocks}

MACRO:
Bonds (TLT): ${mac.tlt ? `${mac.tlt.rs1m > 0 ? '+' : ''}${mac.tlt.rs1m.toFixed(2)}% 1M RS, Grade ${mac.tlt.grade}` : 'N/A'} ${mac.tlt && mac.tlt.rs1m < -2 ? '— BONDS SELLING OFF (rates rising)' : ''}
Credit (HYG): ${mac.hyg ? `${mac.hyg.rs1m > 0 ? '+' : ''}${mac.hyg.rs1m.toFixed(2)}% 1M RS, Grade ${mac.hyg.grade}` : 'N/A'}
Dollar (DXY): ${mac.dxy ? `${mac.dxy.last.toFixed(1)} (${mac.dxy.rs1m > 0 ? '+' : ''}${mac.dxy.rs1m.toFixed(2)}% 1M)` : 'N/A'}
Gold (GLD): ${mac.gld ? `$${mac.gld.last.toFixed(0)} (${mac.gld.d1 > 0 ? '+' : ''}${mac.gld.d1.toFixed(1)}% today, ${mac.gld.rs1m > 0 ? '+' : ''}${mac.gld.rs1m.toFixed(2)}% 1M)` : 'N/A'}
Oil (USO): ${mac.uso ? `$${mac.uso.last.toFixed(1)} (${mac.uso.d1 > 0 ? '+' : ''}${mac.uso.d1.toFixed(1)}% today)` : 'N/A'}
Small/Large (IWM vs QQQ): ${mac.iwm && mac.qqq ? `IWM RS1M ${mac.iwm.rs1m.toFixed(2)} vs QQQ RS1M ${mac.qqq.rs1m.toFixed(2)} — small caps ${mac.iwm.rs1m > mac.qqq.rs1m ? 'outperforming' : 'underperforming'}` : 'N/A'}

CLOUD INFRASTRUCTURE CONTEXT (quarterly estimates):
- Public cloud SaaS NTM P/S: ~6-8x (compressed from 2021 peaks of 20x+)
- AI infrastructure / hyperscaler NTM P/S: ~10-15x (elevated on AI spending thesis)
- Hyperscaler CapEx: AWS, Azure, GCP all guiding toward record spend in 2025-2026
- GPU lead times: 12-16 weeks for H100/H200 class; B100 allocation-based
- Data center construction: +20-25% YoY, constrained by power availability

Based on ALL of the above, generate a comprehensive FinOps intelligence report. Return ONLY valid JSON with no markdown, no code blocks, no explanation text:

{
  "morningBrief": {
    "headline": "one sharp sentence connecting today's market signal to cloud/infrastructure implications",
    "paragraphs": [
      "paragraph 1: market overview — weave VIX level, sector leaders/laggards, exposure signal, breadth into a coherent market narrative",
      "paragraph 2: cloud and AI infrastructure implications — use the research context (P/S ratios, CapEx, GPU supply) and current sector rotation to explain what this means for tech spend",
      "paragraph 3: specific FinOps guidance for today — concrete actions a FinOps practitioner should take given this market environment"
    ]
  },
  "finopsSignals": {
    "cloudSpend": "specific 1-sentence action based on market signal",
    "saasRenewals": "specific 1-sentence action based on credit/macro conditions",
    "infrastructure": "specific 1-sentence action referencing GPU lead times or capacity"
  },
  "commitmentWindows": {
    "oneYear": { "status": "FAVORABLE or HOLD or CAUTION", "reason": "concise reason citing specific data" },
    "threeYear": { "status": "FAVORABLE or HOLD or CAUTION", "reason": "concise reason" },
    "spot": { "status": "SAFE or RISKY", "reason": "concise reason" }
  },
  "riskAlerts": [
    { "type": "warning or opportunity", "title": "3-5 word title", "message": "1-2 sentence explanation" }
  ],
  "sectorInsights": "one paragraph connecting today's sector rotation to infrastructure and cloud budget decisions",
  "cloudValuations": {
    "publicCloud": "X.Xx NTM Revenue — brief trend note",
    "saasAverage": "X.Xx NTM Revenue — brief trend note",
    "aiInfrastructure": "XX.Xx NTM Revenue — brief trend note"
  },
  "hyperscalerCapex": {
    "trend": "Expanding or Contracting or Stable",
    "gpuLeadTimes": "XX-XX weeks",
    "dataCenterGrowth": "+XX% YoY",
    "detail": "one sentence on current CapEx cycle and what it means"
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

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2500,
      system: 'You are a senior FinOps market analyst. You write sharp, data-driven intelligence briefings for cloud finance and infrastructure teams. You MUST respond with ONLY valid JSON — no markdown, no code blocks, no preamble, no explanation.',
      messages: [{ role: 'user', content: buildPrompt(context) }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const data = parseResponse(text)

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Intelligent brief error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
