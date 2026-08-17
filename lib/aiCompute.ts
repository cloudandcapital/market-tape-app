export type ProvenanceBasis = 'company-disclosed' | 'reported' | 'estimated' | 'undisclosed'
export type AgreementType = 'compute/cloud service' | 'hardware/chip partnership' | 'infrastructure target' | 'equity investment'

export interface AiComputeSource {
  label: string
  url: string
  kind: 'primary' | 'supplemental reported' | 'supplemental research'
}

export interface AiComputeRow {
  buyer: string
  provider: string
  amount: string
  amountBillions?: number
  amountIsLowerBound?: boolean
  amountBasis: ProvenanceBasis
  capacity: string
  capacityBasis: ProvenanceBasis
  term: string
  announced: string
  status: 'Signed' | 'Announced' | 'Target' | 'Reported / in talks'
  agreementType: AgreementType
  sources: AiComputeSource[]
  equityInvestment?: string
  equityInvestmentBasis?: 'company-disclosed' | 'reported' | 'estimated'
  notes?: string
}

export const AI_COMPUTE_DATA_VERSION = '20260816a'
export const AI_COMPUTE_LAST_UPDATED = 'August 16, 2026'

export const aiComputeData: AiComputeRow[] = [
  { buyer: 'Anthropic', provider: 'AWS (Trainium / Inferentia)', amount: '$100B+', amountBillions: 100, amountIsLowerBound: true, amountBasis: 'company-disclosed', capacity: 'Up to 5 GW', capacityBasis: 'company-disclosed', term: '10 years', announced: 'Apr 2026', status: 'Signed', agreementType: 'compute/cloud service', sources: [{ label: 'Anthropic', url: 'https://www.anthropic.com/news/anthropic-amazon-compute', kind: 'primary' }] },
  { buyer: 'Anthropic', provider: 'Google Cloud / TPU (Broadcom)', amount: 'Undisclosed', amountBasis: 'undisclosed', capacity: 'Multiple gigawatts', capacityBasis: 'company-disclosed', term: 'Deployment starts 2027', announced: 'Apr 2026', status: 'Signed', agreementType: 'compute/cloud service', sources: [{ label: 'Anthropic', url: 'https://www.anthropic.com/news/google-broadcom-partnership-compute', kind: 'primary' }], notes: 'The primary does not disclose the previously shown $200B, 3.5 GW, or five-year term, so those figures have been removed.' },
  { buyer: 'Anthropic', provider: 'xAI / SpaceX (Colossus 1)', amount: '~$40B reported', amountBillions: 40, amountBasis: 'reported', capacity: '300 MW / 220K+ GPUs reported', capacityBasis: 'reported', term: '3 years reported', announced: 'May 20, 2026', status: 'Reported / in talks', agreementType: 'compute/cloud service', sources: [{ label: 'TechCrunch', url: 'https://techcrunch.com/2026/05/20/anthropic-will-pay-xai-1-25-billion-per-month-for-compute/', kind: 'supplemental reported' }] },
  { buyer: 'Anthropic', provider: 'AMD (Instinct MI450 / Helios)', amount: 'Undisclosed', amountBasis: 'undisclosed', capacity: 'Up to 2 GW', capacityBasis: 'company-disclosed', term: 'Starts H1 2027', announced: 'Jul 22, 2026', status: 'Announced', agreementType: 'hardware/chip partnership', equityInvestment: 'AMD may invest up to $5B in Anthropic', equityInvestmentBasis: 'company-disclosed', sources: [{ label: 'AMD', url: 'https://ir.amd.com/news-events/press-releases/detail/1292/amd-and-anthropic-announce-strategic-partnership-to-deploy-up-to-2-gigawatts-of-amd-instinct-mi450-series-gpus', kind: 'primary' }], notes: 'The potential $5B equity investment is displayed separately and is not compute procurement.' },
  { buyer: 'Anthropic', provider: 'Volta (Norway project)', amount: '~$10B reported', amountBillions: 10, amountBasis: 'reported', capacity: '~133 MW reported', capacityBasis: 'reported', term: '6 years reported', announced: 'Aug 4, 2026', status: 'Reported / in talks', agreementType: 'compute/cloud service', sources: [{ label: 'TechCrunch', url: 'https://techcrunch.com/2026/08/04/anthropic-signs-10-billion-deal-with-ai-cloud-startup-volta/', kind: 'supplemental reported' }], notes: 'No first-party source publicly naming Anthropic was found; every figure is reported.' },
  { buyer: 'OpenAI', provider: 'Stargate (Oracle, SoftBank, partners)', amount: 'Undisclosed current value', amountBasis: 'undisclosed', capacity: 'Original 10 GW goal surpassed', capacityBasis: 'company-disclosed', term: 'Ongoing', announced: 'Jan 2025 (current update 2026)', status: 'Target', agreementType: 'infrastructure target', sources: [{ label: 'OpenAI', url: 'https://openai.com/index/building-the-compute-infrastructure-for-the-intelligence-age/', kind: 'primary' }], notes: 'The 10 GW figure is retained only as the surpassed historical goal, not current capacity.' },
  { buyer: 'OpenAI', provider: 'NVIDIA (Vera Rubin)', amount: 'Undisclosed', amountBasis: 'undisclosed', capacity: '3 GW dedicated inference + 2 GW training', capacityBasis: 'company-disclosed', term: '—', announced: 'Feb 27, 2026', status: 'Signed', agreementType: 'hardware/chip partnership', equityInvestment: '$30B (NVIDIA equity stake in OpenAI, separate from compute)', equityInvestmentBasis: 'company-disclosed', sources: [{ label: 'OpenAI — Scaling AI for everyone (Feb 2026)', url: 'https://openai.com/index/scaling-ai-for-everyone/', kind: 'primary' }, { label: 'OpenAI & NVIDIA — original partnership announcement (Sept 2025)', url: 'https://openai.com/index/openai-nvidia-systems-partnership/', kind: 'supplemental research' }], notes: 'OpenAI directly reports securing 3 GW of dedicated inference capacity and 2 GW of training capacity on NVIDIA Vera Rubin systems; compute dollar value is undisclosed. NVIDIA\'s $30B equity stake in OpenAI (part of the $110B Feb 2026 funding round) is classified separately and does not enter the compute total.' },
  { buyer: 'Meta', provider: 'NVIDIA (Blackwell + Vera Rubin + Grace)', amount: 'Undisclosed', amountBasis: 'undisclosed', capacity: 'Millions of Blackwell and Rubin GPUs', capacityBasis: 'company-disclosed', term: 'Multiyear', announced: 'Feb 2026', status: 'Announced', agreementType: 'hardware/chip partnership', sources: [{ label: 'NVIDIA', url: 'https://nvidianews.nvidia.com/news/meta-builds-ai-infrastructure-with-nvidia', kind: 'primary' }], notes: 'This hardware supply layer is distinct from Meta cloud-service contracts; the infrastructure descriptions are not additive.' },
  { buyer: 'Meta', provider: 'AMD (Instinct MI450+)', amount: 'Undisclosed', amountBasis: 'undisclosed', capacity: 'Up to 6 GW', capacityBasis: 'company-disclosed', term: 'Multiyear', announced: 'Feb 24, 2026', status: 'Signed', agreementType: 'hardware/chip partnership', sources: [{ label: 'Meta', url: 'https://about.fb.com/news/2026/02/meta-amd-partner-longterm-ai-infrastructure-agreement/', kind: 'primary' }] },
  { buyer: 'Meta', provider: 'Amazon (Graviton)', amount: 'Undisclosed', amountBasis: 'undisclosed', capacity: 'Tens of millions of Graviton cores', capacityBasis: 'company-disclosed', term: 'Multiyear', announced: '2026', status: 'Signed', agreementType: 'compute/cloud service', sources: [{ label: 'Amazon', url: 'https://www.aboutamazon.com/news/aws/meta-aws-graviton-ai-partnership', kind: 'primary' }] },
  { buyer: 'Meta', provider: 'CoreWeave (Vera Rubin)', amount: '~$21B', amountBillions: 21, amountBasis: 'company-disclosed', capacity: 'AI cloud capacity; no comparable GW disclosed', capacityBasis: 'undisclosed', term: 'Through Dec 2032', announced: 'Apr 9, 2026', status: 'Signed', agreementType: 'compute/cloud service', sources: [{ label: 'CoreWeave', url: 'https://www.coreweave.com/news/coreweave-and-meta-announce-21-billion-expanded-ai-infrastructure-agreement', kind: 'primary' }], notes: 'Cloud-service contract using NVIDIA systems; distinct from Meta–NVIDIA’s hardware partnership and not additive at the infrastructure layer.' },
  { buyer: 'Jane Street', provider: 'CoreWeave', amount: '~$6B', amountBillions: 6, amountBasis: 'company-disclosed', capacity: 'Undisclosed', capacityBasis: 'undisclosed', term: 'Undisclosed', announced: 'Apr 15, 2026', status: 'Signed', agreementType: 'compute/cloud service', sources: [{ label: 'CoreWeave', url: 'https://investors.coreweave.com/news/news-details/2026/Jane-Street-Signs-6-Billion-AI-Cloud-Agreement-With-CoreWeave/default.aspx', kind: 'primary' }] },
  { buyer: 'OpenAI', provider: 'Cerebras Systems', amount: 'Undisclosed', amountBasis: 'undisclosed', capacity: '750 MW', capacityBasis: 'company-disclosed', term: 'Through 2028', announced: 'Jan 14, 2026', status: 'Announced', agreementType: 'compute/cloud service', sources: [{ label: 'OpenAI', url: 'https://openai.com/index/cerebras-partnership/', kind: 'primary' }] },
  { buyer: 'Google', provider: 'SpaceX / xAI', amount: '~$30B reported', amountBillions: 30, amountBasis: 'reported', capacity: 'Undisclosed', capacityBasis: 'undisclosed', term: '32 months reported', announced: 'Jun 5, 2026', status: 'Reported / in talks', agreementType: 'compute/cloud service', sources: [{ label: 'TechCrunch', url: 'https://techcrunch.com/2026/06/05/google-will-pay-spacex-920m-per-month-for-compute/', kind: 'supplemental reported' }] },
]

export function isDisclosedComparableSignedCompute(row: AiComputeRow): boolean {
  return row.status === 'Signed' && row.amountBasis === 'company-disclosed' && row.agreementType === 'compute/cloud service' && typeof row.amountBillions === 'number'
}

export function getSignedDollarSummary(rows: AiComputeRow[] = aiComputeData): { count: number; totalBillions: number; totalLabel: string; undisclosedOrReportedCount: number } {
  const included = rows.filter(isDisclosedComparableSignedCompute)
  const totalBillions = included.reduce((total, row) => total + (row.amountBillions ?? 0), 0)
  return {
    count: included.length,
    totalBillions,
    totalLabel: `$${totalBillions.toLocaleString('en-US', { maximumFractionDigits: 1 })}B${included.some(row => row.amountIsLowerBound) ? '+' : ''}`,
    undisclosedOrReportedCount: rows.filter(row => row.status === 'Signed' && !isDisclosedComparableSignedCompute(row)).length,
  }
}

export function validateAiComputeProvenance(rows: AiComputeRow[] = aiComputeData): string[] {
  const errors: string[] = []
  for (const row of rows) {
    const id = `${row.buyer}–${row.provider}`
    if (row.amountBasis === 'undisclosed' && row.amountBillions !== undefined) errors.push(`${id}: undisclosed amount has a numeric value`)
    if (row.amountBasis === 'company-disclosed' && row.amountBillions === undefined) errors.push(`${id}: disclosed amount lacks a numeric field`)
    if (row.sources.length === 0) errors.push(`${id}: missing source`)
    if (new Set(row.sources.map(source => source.url)).size !== row.sources.length) errors.push(`${id}: duplicate source URL`)
    if ((row.amountBasis === 'reported' || row.capacityBasis === 'reported') && !row.sources.some(source => source.kind === 'supplemental reported')) errors.push(`${id}: reported figure lacks a reported source`)
    if (row.agreementType === 'equity investment' && isDisclosedComparableSignedCompute(row)) errors.push(`${id}: equity included in compute total`)
    if (row.equityInvestment && !row.equityInvestmentBasis) errors.push(`${id}: equityInvestment is set but equityInvestmentBasis is missing`)
    if (row.equityInvestmentBasis && !row.equityInvestment) errors.push(`${id}: equityInvestmentBasis is set but equityInvestment is missing`)
  }
  return errors
}

export function getStatusSafeAiComputeFallback(rows: AiComputeRow[] = aiComputeData): string {
  const { totalLabel } = getSignedDollarSummary(rows)
  return `Company-disclosed signed compute and cloud-service contracts total ${totalLabel}; additional signed agreements have undisclosed or reported-only values, so finance teams should compare provenance and contract structure before planning.`
}

export function isStatusSafeAiComputeBrief(text: string, rows: AiComputeRow[] = aiComputeData): boolean {
  const { totalLabel } = getSignedDollarSummary(rows)
  const dollarClaims = text.match(/\$[\d,.]+(?:\.\d+)?[BMT](?:\+)?/gi) ?? []
  if (/\bpipeline\b/i.test(text)) return false
  if (/\b(?:aggregate|combined|total)\b.{0,24}\d+(?:\.\d+)?\s*GW/i.test(text)) return false
  if (/\d+(?:\.\d+)?\s*GW.{0,24}\b(?:aggregate|combined|total)\b/i.test(text)) return false
  if (/reported.{0,30}\bsigned (?:deal|agreement|commitment)/i.test(text)) return false
  if (dollarClaims.some(claim => claim.toUpperCase() !== totalLabel.toUpperCase())) return false
  if (dollarClaims.length > 0 && !/company-disclosed.{0,35}\bsigned\b|\bsigned\b.{0,35}company-disclosed/i.test(text)) return false
  return true
}

export function isCacheableAiComputeResponse(
  response: { analysis?: unknown; fallback?: unknown },
  rows: AiComputeRow[] = aiComputeData,
): response is { analysis: string; fallback?: false } {
  return response.fallback !== true && typeof response.analysis === 'string' && isStatusSafeAiComputeBrief(response.analysis, rows)
}

export function resolveAiComputeBrief(text: string | null, rows: AiComputeRow[] = aiComputeData): { analysis: string; fallback?: true } {
  if (text && isStatusSafeAiComputeBrief(text, rows)) return { analysis: text }
  return { analysis: getStatusSafeAiComputeFallback(rows), fallback: true }
}
