import Image from 'next/image'
import type { Snapshot } from '@/lib/types'
import { sparklineUrl, pctColor, pctLabel, gradeColor } from '@/lib/data'

const AI_TICKERS = ['SMH', 'SOXX', 'IGV', 'SKYY', 'AIQ', 'PAVE']

export default function AIInfraCard({ snapshot }: { snapshot: Snapshot }) {
  const rows = snapshot.groups
    .flatMap(g => g.rows)
    .filter(r => AI_TICKERS.includes(r.ticker))
    .sort((a, b) => AI_TICKERS.indexOf(a.ticker) - AI_TICKERS.indexOf(b.ticker))

  return (
    <div>
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-charcoal/40 mb-4">
        AI &amp; Infrastructure
      </h2>

      <div className="space-y-0 divide-y divide-charcoal/8">
        {rows.map(row => (
          <div key={row.ticker} className="flex items-center gap-3 py-3">
            {/* Sparkline */}
            <div className="w-14 h-7 flex-shrink-0 opacity-80">
              <Image
                src={sparklineUrl(row.ticker)}
                alt={`${row.ticker} RS chart`}
                width={56}
                height={28}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>

            {/* Ticker + name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-semibold text-charcoal">{row.ticker}</span>
                <span className={`text-[9px] font-mono px-1 py-0.5 rounded-sm bg-charcoal/6 ${gradeColor(row.trend_grade)}`}>
                  {row.trend_grade}
                </span>
              </div>
              <p className="text-[10px] font-mono text-charcoal/40 truncate">{row.short_name}</p>
            </div>

            {/* Price & change */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-mono font-medium text-charcoal">
                ${row.last.toFixed(2)}
              </p>
              <p className={`text-xs font-mono ${pctColor(row.d1_pct)}`}>
                {pctLabel(row.d1_pct)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
