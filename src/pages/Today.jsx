import { format } from 'date-fns'
import HabitCard from '../components/HabitCard'
import { useNavigate } from 'react-router-dom'

export default function Today({ habits, streaks, toggleCompletion, isCompleted, today, requestPermission }) {
  const navigate = useNavigate()
  const goodHabits = habits.filter(h => h.type === 'good')
  const badHabits = habits.filter(h => h.type === 'bad')

  const totalWins = habits.filter(h => {
    const done = isCompleted(h.id)
    return h.type === 'good' ? done : !done
  }).length
  const pct = habits.length ? Math.round((totalWins / habits.length) * 100) : 0

  const handleNotif = async () => {
    const granted = await requestPermission()
    if (!granted) alert('Notifications blocked. Enable them in your browser settings.')
  }

  return (
    <div className="py-4 space-y-5">
      {/* Date header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {format(today, 'EEEE')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(today, 'MMMM d, yyyy')}
          </p>
        </div>
        <button
          onClick={handleNotif}
          title="Enable reminders"
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
        >
          🔔
        </button>
      </div>

      {/* Progress bar */}
      {habits.length > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{totalWins} / {habits.length} habits on track</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Good habits */}
      {goodHabits.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            ✅ Building
          </h3>
          <div className="space-y-2">
            {goodHabits.map(h => (
              <HabitCard
                key={h.id}
                habit={h}
                completed={isCompleted(h.id)}
                streak={streaks[h.id] || { current: 0, longest: 0 }}
                onToggle={() => toggleCompletion(h.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Bad habits */}
      {badHabits.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            🚫 Breaking
          </h3>
          <div className="space-y-2">
            {badHabits.map(h => (
              <HabitCard
                key={h.id}
                habit={h}
                completed={isCompleted(h.id)}
                streak={streaks[h.id] || { current: 0, longest: 0 }}
                onToggle={() => toggleCompletion(h.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No habits yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-6">
            Track good habits to build, and bad ones to break.
          </p>
          <button
            onClick={() => navigate('/manage')}
            className="px-5 py-2.5 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors"
          >
            Add your first habit
          </button>
        </div>
      )}
    </div>
  )
}
