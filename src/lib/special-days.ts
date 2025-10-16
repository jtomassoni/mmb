export interface SpecialDay {
  id: string
  date: string
  reason: string
  closed: boolean
  openTime?: string
  closeTime?: string
}

export function getTodaySpecialDay(specialDays: SpecialDay[]): SpecialDay | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayStr = today.toISOString().split('T')[0]
  
  return specialDays.find(day => {
    const dayDate = new Date(day.date)
    dayDate.setHours(0, 0, 0, 0)
    const dayStr = dayDate.toISOString().split('T')[0]
    return dayStr === todayStr
  }) || null
}

export function getUpcomingSpecialDays(specialDays: SpecialDay[], limit: number = 3): SpecialDay[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return specialDays
    .filter(day => {
      const dayDate = new Date(day.date)
      dayDate.setHours(0, 0, 0, 0)
      return dayDate > today
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit)
}

export function formatSpecialDayMessage(day: SpecialDay): string {
  const date = new Date(day.date)
  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric' 
  })
  
  if (day.closed) {
    return `Closed ${dateStr} - ${day.reason}`
  } else {
    return `${dateStr}: ${day.reason} (Open ${day.openTime} - ${day.closeTime})`
  }
}

