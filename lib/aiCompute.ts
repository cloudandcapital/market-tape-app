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

export const AI_COMPUTE_DATA_VERSION = '20260502a'

export const aiComputeData: AiComputeRow[] = [
  {
    lab: 'Anthropic',
    provider: 'AWS (Trainium 2/3/4)',
    amount: '$100B+',
    gw: '5 GW',
    term: '10 years',
    announced: 'Apr 20, 2026',
    sourceUrl: 'https://www.anthropic.com/news/anthropic-amazon-compute',
  },
  {
    lab: 'Anthropic',
    provider: 'Google (TPU)',
    amount: 'Up to $40B',
    gw: '5 GW',
    term: '5 years',
    announced: 'Apr 24, 2026',
    sourceUrl: 'https://techcrunch.com/2026/04/24/google-to-invest-up-to-40b-in-anthropic-in-cash-and-compute/',
  },
  {
    lab: 'OpenAI',
    provider: 'Microsoft Azure',
    amount: '~$250B',
    gw: 'Stargate: 10+ GW (original 10 GW goal exceeded)',
    term: '6 yrs (2025–2030)',
    announced: 'Stargate program · 10 GW goal exceeded Apr 2026',
    sourceUrl: 'https://openai.com/index/building-the-compute-infrastructure-for-the-intelligence-age/',
    notes: 'Original Stargate commitment (Jan 2025) was 10 GW over 6 years via Microsoft Azure. Per OpenAI announcement late April 2026, the 10 GW milestone was exceeded ahead of schedule, with 3+ GW added in the past 90 days alone. The ~$250B figure reflects the Microsoft Azure partnership share; total Stargate spend across all partners is reported at ~$400B+ over 3 years. Dollar figure retained as-is pending a primary source for the updated total.',
  },
  {
    lab: 'OpenAI',
    provider: 'Oracle',
    amount: '~$300B ($30B/yr)',
    gw: '4.5 GW',
    term: '5 years',
    announced: 'Sept 2025',
    sourceUrl: 'https://www.datacenterdynamics.com/en/news/openai-signs-300bn-cloud-deal-with-oracle-report/',
  },
  {
    lab: 'OpenAI',
    provider: 'AWS',
    amount: '$38B',
    gw: 'NVIDIA GB200/GB300 GPUs',
    term: '7 years',
    announced: 'Nov 2025',
    sourceUrl: 'https://tech-insider.org/openai-amazon-bedrock-38-billion-azure-exclusivity-end-2026/',
  },
  {
    lab: 'Meta',
    provider: 'AWS (Graviton5)',
    amount: 'Multi-billion (undisclosed)',
    gw: 'Tens of millions of CPU cores',
    term: 'Multi-year',
    announced: 'Apr 24, 2026',
    sourceUrl: 'https://techcrunch.com/2026/04/24/in-another-wild-turn-for-ai-chips-meta-signs-deal-for-millions-of-amazon-ai-cpus/',
  },
  {
    lab: 'xAI',
    provider: 'Self-built (Colossus, Memphis)',
    amount: '~$18B in GPUs',
    gw: '2 GW (target larger)',
    term: 'Ongoing',
    announced: 'Jan 2026',
    sourceUrl: 'https://introl.com/blog/xai-colossus-2-gigawatt-expansion-555k-gpus-january-2026',
  },
]
