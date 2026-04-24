import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET() {
  try {
    const metaRes = await fetch(
      'https://raw.githubusercontent.com/cloudandcapital/market-tape/main/data/meta.json',
      { next: { revalidate: 1800 } }
    )
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

Momentum env: ${meta.status.momentum_env.label} (score: ${meta.status.momentum_env.score}/100)
Breadth: ${meta.status.breadth.above_50d_pct.toFixed(0)}% above 50d MA — ${meta.status.breadth.breadth_label}
Exposure guidance: ${meta.status.exposure.guidance} (${meta.status.exposure.level}/100)

Write a 3-paragraph brief (~150 words):
1. What the market is doing right now (status, trend, breadth in plain terms)
2. What this means for tech infrastructure and cloud spend decisions
3. One specific thing to watch today

Tone: Sharp, concise, operator-level. No fluff. No disclaimers. Start with a strong first sentence.
Format: Plain prose only. No markdown. No headers. No bullet points. No asterisks. Just three paragraphs of clean text separated by blank lines.`,
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
