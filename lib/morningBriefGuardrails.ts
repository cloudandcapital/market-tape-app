export const MORNING_BRIEF_DECISION_CONTEXT =
  'Any organization-specific decision still depends on workload demand, utilization, contract terms, budget, and business priorities.'

export const MORNING_BRIEF_SAFE_FALLBACK = [
  'The latest dated snapshot shows mixed market participation. Confirm the dashboard\'s price date and source-built measures before drawing conclusions from any one signal.',
  `Market conditions are context, not an instruction to change technology commitments. ${MORNING_BRIEF_DECISION_CONTEXT}`,
  'Watch the next dated snapshot for changes in tracked equity ETF breadth and sector score gaps, then compare those observations with operating and contract evidence.',
].join('\n\n')

const DIRECTIVE_LANGUAGE = [
  /\bexposure guidance\b/i,
  /\bcautious hold\b/i,
  /\brisk[- ]on\b|\brisk[- ]off\b/i,
  /\baggressi(?:on|ve)\b/i,
  /\bstay(?:ing)? (?:put|exactly where)\b/i,
  /\bdefensive positioning\b/i,
  /\b(?:buy|sell|trade)\b/i,
  /\b(?:pause|expand|reduce|increase)\b[^.]{0,80}\b(?:cloud |technology |infrastructure )?commitments?\b/i,
]

const DECISION_CONTEXT_TERMS = [
  /\bworkload/i,
  /\butilization/i,
  /\bcontract/i,
  /\bbudget/i,
  /\bbusiness priorit/i,
]

export function enforceMorningBriefGuardrails(text: string): string {
  const paragraphs = text.trim().split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean)
  if (paragraphs.length !== 3 || DIRECTIVE_LANGUAGE.some(pattern => pattern.test(text))) {
    return MORNING_BRIEF_SAFE_FALLBACK
  }

  if (!DECISION_CONTEXT_TERMS.every(pattern => pattern.test(text))) {
    paragraphs[1] = `${paragraphs[1]} ${MORNING_BRIEF_DECISION_CONTEXT}`
  }

  return paragraphs.join('\n\n')
}
