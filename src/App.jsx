import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Today from './pages/Today'
import Analytics from './pages/Analytics'
import Manage from './pages/Manage'
import { useHabits } from './hooks/useHabits'
import { useNotifications } from './hooks/useNotifications'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('habit_dark_mode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('habit_dark_mode', darkMode)
  }, [darkMode])

  const habitsData = useHabits()
  const { requestPermission } = useNotifications(habitsData.habits)

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-bold text-gray-900 dark:text-white">Habits</span>
          </div>
          <button
            onClick={() => setDarkMode(d => !d)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg"
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Page content */}
        <main className="max-w-xl mx-auto px-4 pb-24">
          <Routes>
            <Route
              path="/"
              element={<Today {...habitsData} requestPermission={requestPermission} />}
            />
            <Route
              path="/analytics"
              element={<Analytics {...habitsData} />}
            />
            <Route
              path="/manage"
              element={<Manage {...habitsData} />}
            />
          </Routes>
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex safe-bottom">
          <TabLink to="/" icon="📋" label="Today" />
          <TabLink to="/analytics" icon="📊" label="Analytics" />
          <TabLink to="/manage" icon="⚙️" label="Manage" />
        </nav>
      </div>
    </BrowserRouter>
  )
}

function TabLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors ${
          isActive
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-400 dark:text-gray-500'
        }`
      }
    >
      <span className="text-xl leading-none">{icon}</span>
      {label}
    </NavLink>
  )
}
