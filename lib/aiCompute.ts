export interface AiComputeRow {
  buyer: string
  provider: string
  amount: string
  gw: string
  term: string
  announced: string
  sourceUrl: string
  notes?: string  // editorial context; shown on /sources, not in the main table
}

export const AI_COMPUTE_DATA_VERSION = '20260629a'

export const aiComputeData: AiComputeRow[] = [
  {
    buyer: 'Anthropic',
    provider: 'AWS (Trainium / Inferentia)',
    amount: '$100B+',
    gw: '5 GW',
    term: '10 years',
    announced: 'Apr 2026',
    sourceUrl: 'https://www.anthropic.com/news/anthropic-amazon-compute',
    notes: 'Anthropic blog, Apr 2026',
  },
  {
    buyer: 'Anthropic',
    provider: 'Google Cloud / TPU (Broadcom)',
    amount: '$200B',
    gw: '3.5 GW TPU',
    term: '5 years (starts 2027)',
    announced: 'Apr 2026',
    sourceUrl: 'https://www.anthropic.com/news/google-broadcom-partnership-compute',
    notes: 'Financing closed June 2026: Apollo Global Management + Blackstone closed private credit package via SPV that purchases Google TPUs and leases back to Anthropic. Infrastructure online starting 2027. Anthropic run-rate revenue ~$30B as of Jun 2026.',
  },
  {
    buyer: 'Anthropic',
    provider: 'xAI / SpaceX (Colossus 1)',
    amount: '~$40B ($1.25B/mo thru May 2029)',
    gw: '300 MW / 220K+ NVIDIA GPUs',
    term: '3 years',
    announced: 'May 20, 2026',
    sourceUrl: 'https://techcrunch.com/2026/05/20/anthropic-will-pay-xai-1-25-billion-per-month-for-compute/',
    notes: 'TechCrunch + xAI blog, May 20 2026',
  },
  {
    buyer: 'OpenAI',
    provider: 'Stargate (Oracle, SoftBank, partners)',
    amount: '$500B total / $400B+ committed',
    gw: '10 GW target / 7 GW planned',
    term: '2025–2029',
    announced: 'Jan 2025 (updated May 2026)',
    sourceUrl: 'https://openai.com/index/building-the-compute-infrastructure-for-the-intelligence-age/',
    notes: 'OpenAI blog, May 2026',
  },
  {
    buyer: 'OpenAI',
    provider: 'Microsoft Azure',
    amount: 'ongoing (overflow + existing traffic)',
    gw: '—',
    term: 'ongoing',
    announced: '2024+',
    sourceUrl: 'https://blogs.microsoft.com/blog/2026/04/27/the-next-phase-of-the-microsoft-openai-partnership/',
    notes: 'OpenAI / Microsoft partnership',
  },
  {
    buyer: 'OpenAI',
    provider: 'NVIDIA (equity + Vera Rubin compute)',
    amount: '$30B equity + compute commitment',
    gw: '5 GW (3 inference + 2 training)',
    term: '—',
    announced: 'Feb 2026',
    sourceUrl: 'https://www.cnbc.com/2026/02/19/nvidia-is-in-talks-to-invest-up-to-30-billion-in-openai-source-says.html',
    notes: 'Restructured from the Sept 2025 $100B infrastructure LOI (10 GW target) into a direct $30B equity stake in OpenAI\'s Feb 2026 funding round. CNBC Feb 19, 2026.',
  },
  {
    buyer: 'Meta',
    provider: 'NVIDIA (Blackwell + Vera Rubin + Grace)',
    amount: '~$50B',
    gw: '—',
    term: 'multi-year',
    announced: 'Feb 2026',
    sourceUrl: 'https://nvidianews.nvidia.com/news/meta-builds-ai-infrastructure-with-nvidia',
    notes: "Tom's Hardware, Feb 2026",
  },
  {
    buyer: 'Meta',
    provider: 'AMD (Instinct MI450+)',
    amount: '~$60B',
    gw: '6 GW',
    term: '5 years',
    announced: 'Feb 24, 2026',
    sourceUrl: 'https://about.fb.com/news/2026/02/meta-amd-partner-longterm-ai-infrastructure-agreement/',
    notes: "TECHi / Tom's Hardware, Feb 24 2026",
  },
  {
    buyer: 'Meta',
    provider: 'Amazon (Graviton5 chips)',
    amount: 'multi-billion',
    gw: '—',
    term: '—',
    announced: '2026',
    sourceUrl: 'https://techcrunch.com/2026/04/24/in-another-wild-turn-for-ai-chips-meta-signs-deal-for-millions-of-amazon-ai-cpus/',
    notes: 'The Next Web, 2026',
  },
  {
    buyer: 'Jane Street',
    provider: 'CoreWeave',
    amount: '$6B',
    gw: '—',
    term: '—',
    announced: 'Apr 15, 2026',
    sourceUrl: 'https://investors.coreweave.com/news/news-details/2026/Jane-Street-Signs-6-Billion-AI-Cloud-Agreement-With-CoreWeave/default.aspx',
    notes: 'Financial trading firm as major AI cloud buyer — signals enterprise/financial sector emerging as serious compute demand category alongside AI labs. CoreWeave IR, Apr 2026.',
  },
  {
    buyer: 'OpenAI',
    provider: 'Cerebras Systems',
    amount: '>$20B',
    gw: '750 MW',
    term: 'Multi-year',
    announced: 'Jun 23, 2026',
    sourceUrl: 'https://openai.com/index/cerebras-partnership/',
    notes: 'First non-GPU deal at Market Tape scale — Cerebras WSE (wafer-scale engine) chips optimized for inference throughput, not GPU clusters. Inference-optimized architecture at hyperscale is a new market category. Cerebras Q1 FY2026 revenue $193M+. Sources: OpenAI blog, GlobeNewswire Q1 results, Reuters.',
  },
  {
    buyer: 'Google',
    provider: 'SpaceX / xAI',
    amount: '$920M/month (~$30B total)',
    gw: '—',
    term: 'Oct 2026 – Jun 2029 (32 months)',
    announced: 'Jun 5, 2026',
    sourceUrl: 'https://techcrunch.com/2026/06/05/google-will-pay-spacex-920m-per-month-for-compute/',
    notes: '~110,000 NVIDIA GPUs hosted at xAI data centers. Bridge capacity for unexpected Gemini Enterprise demand surge while Google builds its own infrastructure. Terminable with 90 days notice after Dec 31, 2026. Notable inversion: a hyperscaler (Google) as the compute buyer, not the supplier — complicates the standard "AI lab rents from hyperscaler" framing.',
  },
]
