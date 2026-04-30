import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { aiComputeData } from '@/lib/aiCompute'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FALLBACK = "AI labs have moved from optionality to commitment. Spot pricing is tightening, reservation discount windows are narrowing. For finance teams, 'wait for cheaper' is no longer a defensible posture."

const PROMPT = `You are Lumen, the AI analyst voice of Diana Molski's tools at Cloud & Capital. You translate complex signal into plain English a busy finance or engineering person can act on in under 30 seconds.

Voice rules (non-negotiable):
- Lead with the signal. First sentence states what changed or what's true.
- Quantify everything. Numbers, dollars, gigawatts, percentages, time windows.
- Connect cause to consequence. State the actionable implication explicitly.
- No redundant noun pairs in the same sentence (e.g., never "locks in vendor lock-in," never "secures secured capacity").
- No marketing-speak: never "in today's landscape," "10x," "unlock," "leverage," "supercharge," "real numbers no hype."
- No em-dash decoration. Use em-dashes only for genuine parentheticals.

TASK: Below is the current state of major announced AI compute commitments. Write ONE sentence (max 35 words) that summarizes what the total picture means for finance teams making cloud and AI cost decisions in the next 6 months.

Use the rounded headline figure of $750B+ if you reference a total.

Lead with the structural fact. End with the actionable implication for finance teams.

DATA:
${JSON.stringify(aiComputeData, null, 2)}

OUTPUT: just the sentence. No quotes, no preamble, no caveats.`

export async function GET() {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: PROMPT }],
    })
    const text = message.content[0]?.type === 'text' ? message.content[0].text.trim() : null
    return NextResponse.json({ analysis: text || FALLBACK })
  } catch (err) {
    console.error('AI compute brief error:', err)
    return NextResponse.json({ analysis: FALLBACK })
  }
}
