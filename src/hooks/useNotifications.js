import { useEffect, useCallback } from 'react'

export function useNotifications(habits) {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const timers = []

    habits.forEach(habit => {
      if (!habit.reminderTime) return
      const [hh, mm] = habit.reminderTime.split(':').map(Number)
      const now = new Date()
      const target = new Date()
      target.setHours(hh, mm, 0, 0)
      if (target <= now) target.setDate(target.getDate() + 1)

      const delay = target.getTime() - now.getTime()
      const icon = habit.type === 'good' ? '✅' : '🚫'
      const body = habit.type === 'good'
        ? `Time to ${habit.name}!`
        : `Stay strong — avoid ${habit.name} today!`

      timers.push(
        setTimeout(() => {
          new Notification(`${icon} ${habit.name}`, { body, tag: habit.id })
        }, delay)
      )
    })

    return () => timers.forEach(clearTimeout)
  }, [habits])

  return { requestPermission }
}
