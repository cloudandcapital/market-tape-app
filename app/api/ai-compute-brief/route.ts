import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { aiComputeData } from '@/lib/aiCompute'
import { BENCHMARKS } from '@/lib/industryBenchmarks'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FALLBACK = 'Major AI compute deals span signed agreements, announced partnerships, infrastructure targets, and reported negotiations. Finance teams should evaluate each row by status rather than treating the tracker as a single committed total.'

const SYSTEM_PROMPT = `You are Lumen, the AI analyst voice of Diana Molski's tools at Cloud & Capital. You translate complex signal into plain English a busy finance or engineering person can act on in under 30 seconds.

Voice rules (non-negotiable):
- Lead with the signal. First sentence states what changed or what's true.
- Quantify using the data provided. Only cite numbers, dollars, gigawatts, percentages, and time windows that appear in the DATA section below.
- Connect cause to consequence. State the actionable implication explicitly.
- No redundant noun pairs in the same sentence (e.g., never "locks in vendor lock-in," never "secures secured capacity").
- No marketing-speak: never "in today's landscape," "10x," "unlock," "leverage," "supercharge," "real numbers no hype."
- No em-dash decoration. Use em-dashes only for genuine parentheticals.
- Grounding rule: Do not invent industry benchmarks, pricing statistics, or figures not present in the DATA section. Use qualitative language if the data doesn't supply a specific number.

TASK: Below is the current state of major AI compute deals. Write ONE sentence, targeting 25–30 words and never exceeding 30 words, that summarizes what the status mix means for finance teams making cloud and AI cost decisions in the next 6 months.

Do not calculate or cite an aggregate dollar or gigawatt total. The rows mix signed agreements, announcements, targets, equity investments, planned capacity, and reported negotiations. Treat each row's status as authoritative and do not describe non-signed rows as commitments.

BENCHMARK SCOPE: This analysis covers AI compute deal commitments only. Do not cite GPU supply status, market multiples, construction growth rates, or other infrastructure benchmarks — they are outside the scope of this context.

Lead with the structural fact. End with the actionable implication for finance teams.

OUTPUT: just the sentence. No quotes, no preamble, no caveats.`

function buildUserMessage(): string {
  return `Current benchmark reference (for your information only, do not include in output): GPU supply — ${BENCHMARKS.gpuSupplyStatus.value}; DC demand/supply — ${BENCHMARKS.dataCenterConstructionYoY.value}.

DATA:
${JSON.stringify(aiComputeData, null, 2)}`
}

export async function GET() {
  const requestStartedAt = performance.now()
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: buildUserMessage() }],
    }, { signal: AbortSignal.timeout(12_000) })
    const text = message.content[0]?.type === 'text' ? message.content[0].text.trim() : null
    const completedAt = performance.now()
    console.info(`[ai-compute-brief:timing] claudeMs=${Math.round(completedAt - requestStartedAt)} totalMs=${Math.round(completedAt - requestStartedAt)}`)
    return NextResponse.json(
      { analysis: text || FALLBACK },
      { headers: { 'Cache-Control': 's-maxage=14400, stale-while-revalidate=86400' } },
    )
  } catch (err) {
    console.info(`[ai-compute-brief:timing] claudeMs=${Math.round(performance.now() - requestStartedAt)} totalMs=${Math.round(performance.now() - requestStartedAt)} failed=true`)
    const errorStatus = typeof err === 'object' && err !== null && 'status' in err ? String(err.status) : 'unknown'
    const errorName = err instanceof Error ? err.name : 'UnknownError'
    console.error(`[ai-compute-brief:error] name=${errorName} status=${errorStatus}`)
    return NextResponse.json({ analysis: null }, { status: 503 })
  }
}
