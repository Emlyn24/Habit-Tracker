import { useState } from 'react'
import AddEditHabitModal from '../components/AddEditHabitModal'

export default function Manage({ habits, streaks, addHabit, updateHabit, deleteHabit }) {
  const [modal, setModal] = useState(null) // null | 'new' | habit object
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleSave = (fields) => {
    if (modal === 'new') addHabit(fields)
    else updateHabit(modal.id, fields)
    setModal(null)
  }

  const handleDelete = (id) => {
    deleteHabit(id)
    setConfirmDelete(null)
  }

  const goodHabits = habits.filter(h => h.type === 'good')
  const badHabits = habits.filter(h => h.type === 'bad')

  return (
    <div className="py-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Habits</h2>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          <span className="text-base leading-none">+</span> New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-medium">No habits yet</p>
          <p className="text-sm mt-1">Tap "New Habit" to get started.</p>
        </div>
      ) : (
        <>
          {goodHabits.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                ✅ Good habits — building
              </h3>
              <div className="space-y-2">
                {goodHabits.map(h => (
                  <HabitRow
                    key={h.id}
                    habit={h}
                    streak={streaks[h.id]}
                    onEdit={() => setModal(h)}
                    onDelete={() => setConfirmDelete(h)}
                  />
                ))}
              </div>
            </section>
          )}

          {badHabits.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                🚫 Bad habits — breaking
              </h3>
              <div className="space-y-2">
                {badHabits.map(h => (
                  <HabitRow
                    key={h.id}
                    habit={h}
                    streak={streaks[h.id]}
                    onEdit={() => setModal(h)}
                    onDelete={() => setConfirmDelete(h)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Add/Edit modal */}
      {modal && (
        <AddEditHabitModal
          habit={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete habit?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deleting <strong>{confirmDelete.name}</strong> will also remove all its history. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HabitRow({ habit, streak, onEdit, onDelete }) {
  const good = habit.type === 'good'
  const s = streak || { current: 0, longest: 0, rate: 0 }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
      <span className="text-xl flex-shrink-0">{good ? '✅' : '🚫'}</span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white truncate">{habit.name}</p>
        {habit.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{habit.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-xs font-medium ${good ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            🔥 {s.current}d streak
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">Best: {s.longest}d</span>
          {habit.reminderTime && (
            <span className="text-xs text-gray-400 dark:text-gray-500">🔔 {habit.reminderTime}</span>
          )}
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
