/**
 * Keep request timestamps out of the shared model cache while retaining sources.
 * A TypeScript parameter annotation does not remove extra runtime properties.
 * @param {{ publicCloud: string, saas: string, aiInfra: string, source?: 'live' | 'fallback', baskets?: Record<string, { source: 'live' | 'fallback', dataAsOf?: string }> }} multiples
 */
export function briefMultiplesInput(multiples) {
  return {
    publicCloud: multiples.publicCloud,
    saas: multiples.saas,
    aiInfra: multiples.aiInfra,
    ...(multiples.source === undefined ? {} : { source: multiples.source }),
    ...(multiples.baskets === undefined ? {} : {
      baskets: Object.fromEntries(['publicCloud', 'saas', 'aiInfra'].flatMap((name) => {
        const basket = multiples.baskets?.[name]
        return basket ? [[name, { source: basket.source }]] : []
      })),
    }),
  }
}
