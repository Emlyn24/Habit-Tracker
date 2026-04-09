import { useState, useCallback, useMemo } from 'react'
import {
  format, subDays, parseISO, isBefore, eachDayOfInterval, startOfDay,
} from 'date-fns'

const STORAGE_KEY = 'habit_tracker_v1'

function loadData() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return { habits: [], completions: {} }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

// For good habits: completed[date][id] = true means "did the habit"
// For bad habits:  completed[date][id] = true means "slipped"

export function calcCurrentStreak(habit, completions, today) {
  const created = startOfDay(parseISO(habit.createdAt))
  let streak = 0
  let d = startOfDay(today)
  while (!isBefore(d, created)) {
    const key = format(d, 'yyyy-MM-dd')
    const isWin = habit.type === 'good'
      ? !!completions[key]?.[habit.id]
      : !completions[key]?.[habit.id]
    if (isWin) { streak++; d = subDays(d, 1) }
    else break
  }
  return streak
}

export function calcLongestStreak(habit, completions, today) {
  const created = startOfDay(parseISO(habit.createdAt))
  const days = eachDayOfInterval({ start: created, end: today })
  let longest = 0, current = 0
  for (const day of days) {
    const key = format(day, 'yyyy-MM-dd')
    const isWin = habit.type === 'good'
      ? !!completions[key]?.[habit.id]
      : !completions[key]?.[habit.id]
    if (isWin) { current++; if (current > longest) longest = current }
    else current = 0
  }
  return longest
}

export function calcCompletionRate(habit, completions, today, windowDays = 30) {
  const windowStart = subDays(today, windowDays - 1)
  const created = startOfDay(parseISO(habit.createdAt))
  const start = isBefore(created, windowStart) ? windowStart : created
  const days = eachDayOfInterval({ start, end: today })
  if (!days.length) return 0
  let wins = 0
  for (const day of days) {
    const key = format(day, 'yyyy-MM-dd')
    if (habit.type === 'good') { if (completions[key]?.[habit.id]) wins++ }
    else { if (!completions[key]?.[habit.id]) wins++ }
  }
  return Math.round((wins / days.length) * 100)
}

// Returns array of { date, value } for heatmap (value: 1=win, -1=loss, 0=no data)
export function getHeatmapData(habit, completions, today, weeks = 18) {
  const end = startOfDay(today)
  const start = subDays(end, weeks * 7 - 1)
  const created = startOfDay(parseISO(habit.createdAt))
  const days = eachDayOfInterval({ start, end })
  return days.map(day => {
    const key = format(day, 'yyyy-MM-dd')
    if (isBefore(day, created)) return { date: key, value: 0 }
    if (habit.type === 'good') return { date: key, value: completions[key]?.[habit.id] ? 1 : -1 }
    return { date: key, value: completions[key]?.[habit.id] ? -1 : 1 }
  })
}

export function useHabits() {
  const [data, setData] = useState(loadData)
  const today = useMemo(() => startOfDay(new Date()), [])
  const todayStr = format(today, 'yyyy-MM-dd')

  const persist = useCallback((newData) => {
    setData(newData)
    saveData(newData)
  }, [])

  const addHabit = useCallback((fields) => {
    const habit = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: fields.name.trim(),
      description: fields.description?.trim() || '',
      type: fields.type,
      reminderTime: fields.reminderTime || null,
      createdAt: todayStr,
    }
    persist({ ...data, habits: [...data.habits, habit] })
    return habit
  }, [data, persist, todayStr])

  const updateHabit = useCallback((id, fields) => {
    persist({
      ...data,
      habits: data.habits.map(h => h.id === id ? { ...h, ...fields } : h),
    })
  }, [data, persist])

  const deleteHabit = useCallback((id) => {
    const completions = { ...data.completions }
    Object.keys(completions).forEach(date => {
      if (completions[date]?.[id]) {
        completions[date] = { ...completions[date] }
        delete completions[date][id]
      }
    })
    persist({ habits: data.habits.filter(h => h.id !== id), completions })
  }, [data, persist])

  const toggleCompletion = useCallback((habitId, dateStr) => {
    const d = dateStr || todayStr
    const cur = !!data.completions[d]?.[habitId]
    persist({
      ...data,
      completions: {
        ...data.completions,
        [d]: { ...data.completions[d], [habitId]: !cur },
      },
    })
  }, [data, persist, todayStr])

  const isCompleted = useCallback((habitId, dateStr) => {
    return !!data.completions[dateStr || todayStr]?.[habitId]
  }, [data.completions, todayStr])

  const streaks = useMemo(() => {
    return data.habits.reduce((acc, h) => {
      acc[h.id] = {
        current: calcCurrentStreak(h, data.completions, today),
        longest: calcLongestStreak(h, data.completions, today),
        rate: calcCompletionRate(h, data.completions, today),
      }
      return acc
    }, {})
  }, [data.habits, data.completions, today])

  return {
    habits: data.habits,
    completions: data.completions,
    streaks,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    today,
    todayStr,
  }
}
