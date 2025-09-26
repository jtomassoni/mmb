// Utility functions for DailySnapshot component testing

export const parseTimeForTesting = (timeStr: string): Date => {
  const now = new Date()
  const [time, period] = timeStr.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  
  const date = new Date(now)
  date.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours, minutes, 0, 0)
  
  return date
}

export const getStatusForTesting = (now: Date, start: Date): "Upcoming" | "Live" | "Done" => {
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000) // 3 hours duration
  
  if (now < start) return "Upcoming"
  if (now >= start && now <= end) return "Live"
  return "Done"
}
