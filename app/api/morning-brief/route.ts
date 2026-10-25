import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { buildInfraContextBlock } from '@/lib/industryBenchmarks'
import { fetchLiveMultiples } from '@/lib/liveMultiples'
import { fetchMarketData } from '@/lib/data'
import { buildContextData } from '@/lib/marketContext'
import { enforceMorningBriefGuardrails } from '@/lib/morningBriefGuardrails'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET() {
  try {
    const [{ meta, snapshot }, multiples] = await Promise.all([
      fetchMarketData(),
      fetchLiveMultiples(),
    ])
    const context = buildContextData(meta, snapshot)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: [
        {
          type: 'text',
          text: `You are a market analyst writing a morning brief for FinOps and cloud finance teams.

Write a 3-paragraph brief (~150 words):
1. What the market is doing right now (status, trend, breadth in plain terms)
2. What technology-finance teams should verify in their own workload, utilization, contract, budget, and business-priority evidence (use the benchmark figures above — do not invent others)
3. One specific thing to watch today

Tone: Sharp, concise, operator-level. No fluff. No disclaimers. Start with a strong first sentence.
Format: Plain prose only. No markdown. No headers. No bullet points. No asterisks. Just three paragraphs of clean text separated by blank lines.

Treat market and benchmark signals as context only. Never write exposure guidance, trading or portfolio advice, risk-on/risk-off positioning, or language suggesting that cloud or technology commitments should be expanded, paused, held, reduced, or accelerated. Organization-specific decisions require workload demand, utilization, contract terms, budget, and business priorities.

GROUNDING RULE: Use only the data provided above. Do not cite specific valuation multiples, GPU lead times, CapEx percentages, or industry benchmarks that are not present in this data. For the infrastructure paragraph, use qualitative language only ("hyperscalers are still expanding," "software budgets face pressure") — never a specific number you have not been given. VERIFIABILITY RULE: Every numeric value you cite must appear in the user-visible dashboard sections (Market Status, Market Internals, Macro Context, Sectors, Cloud Valuations, Hyperscaler CapEx, Tech Concentration, Momentum Universe Leaders/Laggards, AI Compute Commitments). If a value exists in your context but is annotated [internal] or [not user-visible], or is otherwise not displayed to users, use qualitative language instead ("the dollar is weakening," "gold is firming," "small caps lagging," "narrow conviction," "mixed signals"). Do not cite specific percentages, scores, or values that users cannot verify against the page.`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Here's the validated dashboard context for ${context.marketSessionLabel}:
${JSON.stringify({ marketData: context.marketData, sectorData: context.sectorData, macroData: context.macroData }, null, 2)}

${buildInfraContextBlock(multiples)}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const brief = enforceMorningBriefGuardrails(text)

    return NextResponse.json(
      { brief, generated_at: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=14400, stale-while-revalidate=86400' } },
    )
  } catch (err) {
    console.error('Morning brief error:', err)
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 })
  }
}
