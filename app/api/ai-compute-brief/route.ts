import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { aiComputeData, getSignedDollarSummary, resolveAiComputeBrief } from '@/lib/aiCompute'
import { BENCHMARKS } from '@/lib/industryBenchmarks'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const SUCCESS_CACHE_CONTROL = 's-maxage=14400, stale-while-revalidate=86400'
const FALLBACK_CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=3600'

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

You may cite the supplied DISCLOSED COMPARABLE SIGNED TOTAL, derived only from structured numeric fields on Signed compute/cloud-service rows whose amount basis is company-disclosed. Never include reported, estimated, undisclosed, hardware/chip, infrastructure-target, or equity values. Never calculate from display strings. Never call unlike statuses a pipeline, aggregate gigawatts, or describe a reported arrangement as signed.

BENCHMARK SCOPE: This analysis covers AI compute deal commitments only. Do not cite GPU supply status, market multiples, construction growth rates, or other infrastructure benchmarks — they are outside the scope of this context.

Lead with the structural fact. End with the actionable implication for finance teams.

OUTPUT: just the sentence. No quotes, no preamble, no caveats.`

function buildUserMessage(): string {
  const signed = getSignedDollarSummary()
  return `Current benchmark reference (for your information only, do not include in output): GPU supply — ${BENCHMARKS.gpuSupplyStatus.value}; DC demand/supply — ${BENCHMARKS.dataCenterConstructionYoY.value}.

DISCLOSED COMPARABLE SIGNED TOTAL (derived from ${signed.count} company-disclosed Signed compute/cloud-service rows): ${signed.totalLabel}. ${signed.undisclosedOrReportedCount} additional Signed rows have undisclosed or reported-only values. All other statuses and bases must remain separate.

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
    const result = resolveAiComputeBrief(text)
    const completedAt = performance.now()
    console.info(`[ai-compute-brief:timing] claudeMs=${Math.round(completedAt - requestStartedAt)} totalMs=${Math.round(completedAt - requestStartedAt)}`)
    return NextResponse.json(
      result,
      { headers: { 'Cache-Control': result.fallback ? FALLBACK_CACHE_CONTROL : SUCCESS_CACHE_CONTROL } },
    )
  } catch (err) {
    console.info(`[ai-compute-brief:timing] claudeMs=${Math.round(performance.now() - requestStartedAt)} totalMs=${Math.round(performance.now() - requestStartedAt)} failed=true`)
    const errorStatus = typeof err === 'object' && err !== null && 'status' in err ? String(err.status) : 'unknown'
    const errorName = err instanceof Error ? err.name : 'UnknownError'
    console.warn(`[ai-compute-brief:fallback] name=${errorName} status=${errorStatus}`)
    return NextResponse.json(
      resolveAiComputeBrief(null),
      { headers: { 'Cache-Control': FALLBACK_CACHE_CONTROL } },
    )
  }
}
