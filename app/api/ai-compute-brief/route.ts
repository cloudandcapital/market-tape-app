import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { aiComputeData } from '@/lib/aiCompute'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FALLBACK = "AI labs have moved from optionality to commitment. Spot pricing is tightening, reservation discount windows are narrowing. For finance teams, 'wait for cheaper' is no longer a defensible posture."

const PROMPT = `You are Lumen, an AI analyst for Market Tape. Market Tape connects market signals to FinOps decisions.

Below is the current state of major announced AI compute commitments. Write ONE sentence (max 35 words) summarizing what the total picture means for finance teams making cloud/AI cost decisions in the next 6 months. Use plain English. Be specific. Don't say "in today's landscape" or use marketing language.

Lead with the structural fact, end with the actionable implication for finance teams. Use the rounded headline figure of $750B+ if you reference a total — do not compute a different sum.

Data:
${JSON.stringify(aiComputeData, null, 2)}

Output: just the sentence. No quotes, no preamble.`

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
