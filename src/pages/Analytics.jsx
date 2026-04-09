import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'
import HeatmapCalendar from '../components/HeatmapCalendar'
import { calcCompletionRate } from '../hooks/useHabits'

export default function Analytics({ habits, completions, streaks, today }) {
  // Bar chart: completion rate per habit
  const barData = useMemo(() =>
    habits.map(h => ({
      name: h.name.length > 12 ? h.name.slice(0, 12) + '…' : h.name,
      fullName: h.name,
      rate: streaks[h.id]?.rate ?? 0,
      type: h.type,
    })),
  [habits, streaks])

  // Line chart: daily completion rate last 30 days
  const lineData = useMemo(() => {
    if (!habits.length) return []
    const days = eachDayOfInterval({ start: subDays(today, 29), end: today })
    return days.map(day => {
      const key = format(day, 'yyyy-MM-dd')
      let wins = 0
      habits.forEach(h => {
        const done = !!completions[key]?.[h.id]
        if (h.type === 'good' ? done : !done) wins++
      })
      return {
        date: format(day, 'MMM d'),
        rate: Math.round((wins / habits.length) * 100),
      }
    })
  }, [habits, completions, today])

  const totalHabits = habits.length
  const avgRate = totalHabits
    ? Math.round(habits.reduce((s, h) => s + (streaks[h.id]?.rate ?? 0), 0) / totalHabits)
    : 0
  const bestStreak = totalHabits
    ? Math.max(...habits.map(h => streaks[h.id]?.longest ?? 0))
    : 0

  const CustomBar = (props) => {
    const { x, y, width, height, type } = props
    const color = type === 'good' ? '#22c55e' : '#ef4444'
    return <rect x={x} y={y} width={width} height={height} fill={color} rx={4} />
  }

  const CustomBarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
        <p className="font-medium text-gray-900 dark:text-white">{d.fullName}</p>
        <p className={d.type === 'good' ? 'text-green-600' : 'text-red-500'}>
          {d.rate}% completion
        </p>
      </div>
    )
  }

  return (
    <div className="py-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h2>

      {habits.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium">No data yet</p>
          <p className="text-sm">Add habits and start tracking to see analytics.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Habits" value={totalHabits} color="text-blue-500" />
            <StatCard label="Avg Rate" value={`${avgRate}%`} color="text-green-500" />
            <StatCard label="Best Streak" value={`🔥 ${bestStreak}`} color="text-orange-500" />
          </div>

          {/* Daily rate line chart */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Daily Success Rate (30 days)
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={lineData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    interval={6}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tw-bg, #fff)',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v}%`, 'Success']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Bar chart */}
          {habits.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Habit Completion (30 days)
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <ResponsiveContainer width="100%" height={Math.max(100, habits.length * 40)}>
                  <BarChart
                    data={barData}
                    layout="vertical"
                    margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
                  >
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={v => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                    <Bar dataKey="rate" shape={<CustomBar />} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Per-habit heatmaps */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Habit Heatmaps
            </h3>
            <div className="space-y-4">
              {habits.map(h => {
                const s = streaks[h.id] || { current: 0, longest: 0, rate: 0 }
                return (
                  <div
                    key={h.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span>{h.type === 'good' ? '✅' : '🚫'}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{h.name}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className={h.type === 'good' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-500 dark:text-red-400 font-medium'}>
                          🔥 {s.current}d
                        </span>
                        <span>Best: {s.longest}d</span>
                        <span>{s.rate}%</span>
                      </div>
                    </div>
                    <HeatmapCalendar habit={h} completions={completions} today={today} weeks={18} />
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}
