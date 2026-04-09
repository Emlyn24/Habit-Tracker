import { useMemo } from 'react'
import { format, getDay, subDays, startOfDay, parseISO, isBefore } from 'date-fns'
import { getHeatmapData } from '../hooks/useHabits'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function HeatmapCalendar({ habit, completions, today, weeks = 18 }) {
  const { cells, monthLabels } = useMemo(() => {
    const data = getHeatmapData(habit, completions, today, weeks)
    // Pad start so first day aligns to correct weekday
    const firstDay = parseISO(data[0].date)
    const startPad = getDay(firstDay) // 0=Sun
    const padded = [
      ...Array(startPad).fill(null),
      ...data,
    ]
    // Chunk into weeks (columns)
    const cols = []
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7))
    }
    // Month labels: find first cell in each month
    const seen = new Set()
    const labels = cols.map((col, ci) => {
      const firstReal = col.find(c => c !== null)
      if (!firstReal) return null
      const m = format(parseISO(firstReal.date), 'MMM')
      if (seen.has(m)) return null
      seen.add(m)
      return { col: ci, label: m }
    }).filter(Boolean)

    return { cells: cols, monthLabels: labels }
  }, [habit, completions, today, weeks])

  const good = habit.type === 'good'

  const cellColor = (cell) => {
    if (!cell) return 'transparent'
    if (cell.value === 0) return 'var(--cell-empty)'
    if (cell.value === 1) return good ? 'var(--cell-good)' : 'var(--cell-bad)'
    return 'var(--cell-miss)'
  }

  const cellTitle = (cell) => {
    if (!cell) return ''
    const d = format(parseISO(cell.date), 'MMM d')
    if (cell.value === 0) return d + ' (before tracking)'
    if (cell.value === 1) return d + (good ? ' ✅' : ' 🚫 slip-free')
    return d + (good ? ' missed' : ' 😓 slipped')
  }

  return (
    <div
      className="overflow-x-auto pb-1"
      style={{
        '--cell-empty': 'rgb(229 231 235)',
        '--cell-good': 'rgb(34 197 94)',
        '--cell-bad': 'rgb(239 68 68)',
        '--cell-miss': 'rgb(209 213 219)',
      } as React.CSSProperties}
    >
      <style>{`
        .dark .heatmap-wrap {
          --cell-empty: rgb(55 65 81);
          --cell-miss: rgb(75 85 99);
        }
      `}</style>
      <div className="heatmap-wrap inline-block">
        {/* Month labels */}
        <div className="flex mb-1 pl-5">
          {monthLabels.map(({ col, label }) => (
            <div
              key={label}
              className="text-xs text-gray-400 dark:text-gray-500 absolute"
              style={{ transform: `translateX(${col * 14}px)` }}
            >
              {label}
            </div>
          ))}
          <div className="opacity-0 text-xs">{'M'}</div>
        </div>

        <div className="flex gap-0.5 mt-4">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAYS.map((d, i) => (
              <div
                key={i}
                className="w-3 h-3 flex items-center justify-center text-[8px] text-gray-400 dark:text-gray-500"
              >
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>
          {/* Grid */}
          {cells.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-0.5">
              {col.map((cell, ri) => (
                <div
                  key={ri}
                  title={cellTitle(cell)}
                  className="w-3 h-3 rounded-sm transition-colors"
                  style={{ backgroundColor: cellColor(cell) }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-2 justify-end">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Less</span>
          {[0.15, 0.4, 0.65, 0.9].map((op, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: i === 0
                  ? 'var(--cell-empty)'
                  : good
                    ? `rgba(34,197,94,${op})`
                    : `rgba(239,68,68,${op})`,
              }}
            />
          ))}
          <span className="text-[10px] text-gray-400 dark:text-gray-500">More</span>
        </div>
      </div>
    </div>
  )
}
