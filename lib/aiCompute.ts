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

export const AI_COMPUTE_DATA_VERSION = '20260504a'

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
    gw: 'Stargate: 10+ GW (exceeded)',
    term: '6 yrs (2025–2030)',
    announced: 'Stargate program (exceeded Apr 2026)',
    sourceUrl: 'https://openai.com/index/building-the-compute-infrastructure-for-the-intelligence-age/',
    notes: 'Original Stargate commitment (Jan 2025) was 10 GW over 6 years via Microsoft Azure. Per OpenAI announcement late April 2026, the 10 GW milestone was exceeded ahead of schedule, with 3+ GW added in the past 90 days alone. The ~$250B figure reflects OpenAI\'s incremental Azure purchase commitment under the Apr 27, 2026 restructured deal; total Stargate spend across all partners is reported at ~$400B+ over 3 years. As of Apr 27, 2026, Microsoft no longer holds right of first refusal as OpenAI\'s compute provider, and the prior exclusive IP license was converted to non-exclusive (through 2032). OpenAI is now free to multi-cloud. Source for restructuring: https://blogs.microsoft.com/blog/2026/04/27/the-next-phase-of-the-microsoft-openai-partnership/',
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
    sourceUrl: 'https://openai.com/index/aws-and-openai-partnership/',
  },
  {
    lab: 'OpenAI',
    provider: 'NVIDIA',
    amount: 'NVIDIA investing up to $100B in OpenAI',
    gw: '10 GW',
    term: 'Multi-year',
    announced: 'Apr 2026',
    sourceUrl: 'https://nvidianews.nvidia.com/news/openai-and-nvidia-announce-strategic-partnership-to-deploy-10gw-of-nvidia-systems',
    notes: 'Letter of intent (LOI). NVIDIA commits to deploy at least 10 GW of NVIDIA systems for OpenAI\'s next-gen AI infrastructure and intends to invest up to $100B in OpenAI as systems are deployed. This is a customer/investor relationship with no direct precedent in the chip industry.',
  },
  {
    lab: 'OpenAI',
    provider: 'AMD',
    amount: 'Undisclosed',
    gw: '6 GW (1 GW in H2 2026)',
    term: 'Multi-year',
    announced: 'Apr 2026',
    sourceUrl: 'https://openai.com/index/openai-amd-strategic-partnership/',
    notes: 'AMD Instinct MI450 GPUs. First 1 GW deployment begins H2 2026, scaling to 6 GW over the multi-year term.',
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
    lab: 'Meta',
    provider: 'NVIDIA',
    amount: 'Multi-billion (~$50B analyst est.)',
    gw: 'Multi-generation (Blackwell + Rubin)',
    term: 'Multi-year',
    announced: 'Jan 2026',
    sourceUrl: 'https://nvidianews.nvidia.com/news/meta-builds-ai-infrastructure-with-nvidia',
    notes: 'Commits Meta to deploying NVIDIA Blackwell and Rubin GPU generations, plus Grace/Vera CPUs and Spectrum-X Ethernet networking fabric. Analyst estimates put total value up to ~$50B over the life of the deal.',
  },
  {
    lab: 'Meta',
    provider: 'AMD',
    amount: 'Undisclosed',
    gw: 'Up to 6 GW',
    term: 'Multi-year',
    announced: 'Feb 2026',
    sourceUrl: 'https://about.fb.com/news/2026/02/meta-amd-partner-longterm-ai-infrastructure-agreement/',
    notes: 'Long-term agreement for AMD Instinct GPUs to power Meta\'s AI infrastructure.',
  },
  {
    lab: 'Meta',
    provider: 'Nebius',
    amount: '$27B ($12B dedicated + up to $15B additional)',
    gw: 'N/A',
    term: '5 years',
    announced: 'Mar 16, 2026',
    sourceUrl: 'https://www.cnbc.com/2026/03/16/meta-nebius-ai-infrastructure.html',
    notes: 'Nebius is a Dutch AI cloud infrastructure company (spun out of Yandex). $12B of dedicated capacity guaranteed; up to $15B of additional available compute capacity over the 5-year term.',
  },
  {
    lab: 'xAI',
    provider: 'Self-built (Colossus, Memphis)',
    amount: '~$18B in GPUs',
    gw: '2 GW (target larger)',
    term: 'Ongoing',
    announced: 'Jan 2026',
    sourceUrl: 'https://siliconangle.com/2025/12/30/elon-musk-reveals-plan-expand-xais-colossus-data-center-2-gigawatts/',
  },
]
