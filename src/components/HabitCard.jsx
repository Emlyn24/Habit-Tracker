import { useState } from 'react'

export default function HabitCard({ habit, completed, streak, onToggle }) {
  const [popping, setPopping] = useState(false)
  const good = habit.type === 'good'

  // For good habits: completed = I did it (positive)
  // For bad habits: completed = I slipped (negative)
  const isWin = good ? completed : !completed

  const handleToggle = () => {
    setPopping(true)
    onToggle()
    setTimeout(() => setPopping(false), 350)
  }

  const cardBg = good
    ? completed
      ? 'bg-green-50 dark:bg-green-900/25 border-green-300 dark:border-green-700'
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    : completed
      ? 'bg-red-50 dark:bg-red-900/25 border-red-300 dark:border-red-700'
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'

  const btnStyle = good
    ? completed
      ? 'bg-green-500 border-green-500 text-white shadow-green-200 dark:shadow-green-900 shadow-md'
      : 'border-gray-300 dark:border-gray-500 text-gray-300 dark:text-gray-500 hover:border-green-400 hover:text-green-400'
    : completed
      ? 'bg-red-500 border-red-500 text-white shadow-red-200 dark:shadow-red-900 shadow-md'
      : 'border-red-200 dark:border-red-800 text-red-200 dark:text-red-800 hover:border-red-400 hover:text-red-400'

  const streakColor = good
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-500 dark:text-red-400'

  const statusText = good
    ? completed ? 'Done today!' : 'Not done yet'
    : completed ? 'Slipped today' : 'Staying clean'

  const statusColor = good
    ? completed ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
    : completed ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'

  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-3 transition-all duration-200 active:scale-[0.98] ${cardBg}`}>
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className={`relative w-11 h-11 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${btnStyle} ${popping ? 'animate-pop' : ''}`}
        aria-label={good ? (completed ? 'Unmark done' : 'Mark done') : (completed ? 'Undo slip' : 'Record slip')}
      >
        {good
          ? (completed ? <CheckIcon /> : <span className="text-lg opacity-30">○</span>)
          : (completed ? <XIcon /> : <span className="text-base">🚫</span>)
        }
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm leading-none">{good ? '✅' : '🚫'}</span>
          <span className="font-semibold text-gray-900 dark:text-white truncate">{habit.name}</span>
        </div>
        {habit.description ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{habit.description}</p>
        ) : (
          <p className={`text-xs mt-0.5 ${statusColor}`}>{statusText}</p>
        )}
        {habit.description && (
          <p className={`text-xs mt-0.5 ${statusColor}`}>{statusText}</p>
        )}
      </div>

      {/* Streak */}
      <div className={`text-right flex-shrink-0 ${streakColor}`}>
        {streak.current > 0 ? (
          <>
            <div className="font-bold text-xl leading-none">🔥 {streak.current}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">day streak</div>
          </>
        ) : (
          <>
            <div className="font-bold text-xl leading-none opacity-30">—</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">no streak</div>
          </>
        )}
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
