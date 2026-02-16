import { addDays, format } from 'date-fns'

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function getWeekDays(startDate: Date) {
  // DB & UI align on Monday start?
  // If `startDate` is the Monday of the week
  return Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(startDate, i)
    return {
      date: date,
      dayName: format(date, 'EEEE'),
      dateStr: format(date, 'yyyy-MM-dd'),
      display: format(date, 'MMM d')
    }
  })
}

// Convert "2023-10-10T10:00:00" -> "10:00"
export function extractTime(isoString: string) {
  if (!isoString) return ''
  return format(new Date(isoString), 'HH:mm')
}
