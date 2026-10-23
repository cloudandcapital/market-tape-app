/** Questions to bring to a cost review, never market-derived purchasing verdicts. */
export const CLOUD_REVIEW = {
  oneYear: { status: 'REVIEW', reason: 'How much usage stays steady? Compare that baseline with the commitment, payment terms, and break-even point.' },
  threeYear: { status: 'REVIEW', reason: 'Will the workload still look like this in three years? Check migration plans, flexibility, and the cost of unused capacity.' },
  spot: { status: 'REVIEW', reason: 'Can the job stop and restart? Check interruption handling and fallback capacity. On-demand avoids a term commitment; it does not guarantee capacity.' },
}
