import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { buildInfraContextBlock } from '@/lib/industryBenchmarks'
import { fetchLiveMultiples } from '@/lib/liveMultiples'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET() {
  try {
    const [metaRes, multiples] = await Promise.all([
      fetch('https://raw.githubusercontent.com/cloudandcapital/market-tape/main/data/meta.json', {
        next: { revalidate: 1800 },
      }),
      fetchLiveMultiples(),
    ])
    if (!metaRes.ok) throw new Error('Failed to fetch meta.json')
    const meta = await metaRes.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `You are a market analyst writing a morning brief for FinOps and cloud finance teams.

Here's today's market data:
${JSON.stringify(meta.status, null, 2)}

Top sector leaders (RS1M): ${meta.leaders.sectors.map((s: { ticker: string; rs1m: number }) => `${s.ticker} (${s.rs1m.toFixed(2)})`).join(', ')}

Momentum env: ${meta.status.momentum_env.label} [internal score: ${meta.status.momentum_env.score}/100 — not user-visible, do not cite this number]
Breadth: ${meta.status.breadth.above_50d_pct.toFixed(0)}% above 50d MA — ${meta.status.breadth.breadth_label}
Exposure guidance: ${meta.status.exposure.guidance} (${meta.status.exposure.level}/100)

${buildInfraContextBlock(multiples)}

Write a 3-paragraph brief (~150 words):
1. What the market is doing right now (status, trend, breadth in plain terms)
2. What this means for tech infrastructure and cloud spend decisions (use the benchmark figures above — do not invent others)
3. One specific thing to watch today

Tone: Sharp, concise, operator-level. No fluff. No disclaimers. Start with a strong first sentence.
Format: Plain prose only. No markdown. No headers. No bullet points. No asterisks. Just three paragraphs of clean text separated by blank lines.

GROUNDING RULE: Use only the data provided above. Do not cite specific valuation multiples, GPU lead times, CapEx percentages, or industry benchmarks that are not present in this data. For the infrastructure paragraph, use qualitative language only ("hyperscalers are still expanding," "software budgets face pressure") — never a specific number you have not been given. VERIFIABILITY RULE: Only cite numeric values that are user-visible on the dashboard (VIX, breadth %, exposure level, sector RS values, price levels, TLT/HYG RS1M). Any field annotated [internal] or [not user-visible] must not be quoted as a number. Specifically: do not cite 1-month RS percentages for DXY, GLD, USO, IWM, or QQQ individually — only their price or daily change is shown on the dashboard. Use qualitative language: "the dollar is weakening," "gold is rising" — never a specific monthly percentage for those instruments.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ brief: text, generated_at: new Date().toISOString() })
  } catch (err) {
    console.error('Morning brief error:', err)
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 })
  }
}
