export interface AiComputeRow {
  lab: string
  provider: string
  amount: string
  gw: string
  term: string
  announced: string
  sourceUrl: string
  notes?: string  // editorial context; shown on /sources, not in the main table
}

export const AI_COMPUTE_DATA_VERSION = '20260521a'

export const aiComputeData: AiComputeRow[] = [
  {
    lab: 'Anthropic',
    provider: 'AWS (Trainium / Inferentia)',
    amount: '$100B+',
    gw: '5 GW',
    term: '10 years',
    announced: 'Apr 2026',
    sourceUrl: 'https://www.anthropic.com/news/anthropic-amazon-compute',
    notes: 'Anthropic blog, Apr 2026',
  },
  {
    lab: 'Anthropic',
    provider: 'Google Cloud / TPU (Broadcom)',
    amount: '$200B',
    gw: '5 GW TPU',
    term: '5 years (starts 2027)',
    announced: 'May 5, 2026',
    sourceUrl: 'https://www.engadget.com/2165585/anthropic-reportedly-agrees-to-pay-google-200-billion-for-chips-and-cloud-access/',
    notes: 'The Information, May 5 2026',
  },
  {
    lab: 'Anthropic',
    provider: 'xAI / SpaceX (Colossus 1)',
    amount: '~$40B ($1.25B/mo thru May 2029)',
    gw: '300 MW / 220K+ NVIDIA GPUs',
    term: '3 years',
    announced: 'May 20, 2026',
    sourceUrl: 'https://techcrunch.com/2026/05/20/anthropic-will-pay-xai-1-25-billion-per-month-for-compute/',
    notes: 'TechCrunch + xAI blog, May 20 2026',
  },
  {
    lab: 'OpenAI',
    provider: 'Stargate (Oracle, SoftBank, partners)',
    amount: '$500B total / $400B+ committed',
    gw: '10 GW target / 7 GW planned',
    term: '2025–2029',
    announced: 'Jan 2025 (updated May 2026)',
    sourceUrl: 'https://openai.com/index/building-the-compute-infrastructure-for-the-intelligence-age/',
    notes: 'OpenAI blog, May 2026',
  },
  {
    lab: 'OpenAI',
    provider: 'Microsoft Azure',
    amount: 'ongoing (overflow + existing traffic)',
    gw: '—',
    term: 'ongoing',
    announced: '2024+',
    sourceUrl: 'https://blogs.microsoft.com/blog/2026/04/27/the-next-phase-of-the-microsoft-openai-partnership/',
    notes: 'OpenAI / Microsoft partnership',
  },
  {
    lab: 'OpenAI',
    provider: 'NVIDIA (equity + Vera Rubin compute)',
    amount: '$30B equity + compute commitment',
    gw: '5 GW (3 inference + 2 training)',
    term: '—',
    announced: 'Feb 2026',
    sourceUrl: 'https://nvidianews.nvidia.com/news/openai-and-nvidia-announce-strategic-partnership-to-deploy-10gw-of-nvidia-systems',
    notes: 'Yahoo Finance, Feb 2026',
  },
  {
    lab: 'Meta',
    provider: 'NVIDIA (Blackwell + Vera Rubin + Grace)',
    amount: '~$50B',
    gw: '—',
    term: 'multi-year',
    announced: 'Feb 2026',
    sourceUrl: 'https://nvidianews.nvidia.com/news/meta-builds-ai-infrastructure-with-nvidia',
    notes: "Tom's Hardware, Feb 2026",
  },
  {
    lab: 'Meta',
    provider: 'AMD (Instinct MI450+)',
    amount: '~$60B',
    gw: '6 GW',
    term: '5 years',
    announced: 'Feb 24, 2026',
    sourceUrl: 'https://about.fb.com/news/2026/02/meta-amd-partner-longterm-ai-infrastructure-agreement/',
    notes: "TECHi / Tom's Hardware, Feb 24 2026",
  },
  {
    lab: 'Meta',
    provider: 'Amazon (Graviton5 chips)',
    amount: 'multi-billion',
    gw: '—',
    term: '—',
    announced: '2026',
    sourceUrl: 'https://techcrunch.com/2026/04/24/in-another-wild-turn-for-ai-chips-meta-signs-deal-for-millions-of-amazon-ai-cpus/',
    notes: 'The Next Web, 2026',
  },
]
