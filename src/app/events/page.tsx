'use client'

import { useState, useEffect } from 'react'
import { broncosSchedule2025 } from '../../lib/broncos-schedule'

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  startTime?: string
  endTime?: string
  type: 'food' | 'drink' | 'entertainment' | 'broncos' | 'special'
  isRecurring: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  recurringDays?: number[]
  price?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface DayEvent {
  day: string
  date: string
  events: {
    title: string
    time: string
    description: string
    type: 'food' | 'drink' | 'entertainment' | 'sports'
    price?: string
  }[]
}

interface SpecialDay {
  id: string
  date: string
  reason: string
  closed: boolean
  openTime?: string
  closeTime?: string
}

interface ClosureEvent {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  startTime: string | null
  endTime: string | null
  eventType: { name: string; color: string | null } | null
}

export default function EventsPage() {
  const [currentWeek, setCurrentWeek] = useState<DayEvent[]>([])
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([])
  const [closureEvents, setClosureEvents] = useState<ClosureEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCalendarEvents = async () => {
    try {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay()) // Start from Sunday
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // End on Saturday
      
      const startDate = startOfWeek.toISOString().split('T')[0]
      const endDate = endOfWeek.toISOString().split('T')[0]
      
      const response = await fetch(`/api/public/calendar?startDate=${startDate}&endDate=${endDate}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          return data.events as CalendarEvent[]
        }
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error)
    }
    
    return []
  }

  const fetchSpecialDays = async () => {
    try {
      const response = await fetch('/api/public/special-days')
      if (response.ok) {
        const data = await response.json()
        setSpecialDays(data.specialDays || [])
      }
    } catch (error) {
      console.error('Failed to fetch special days:', error)
    }
  }

  useEffect(() => {
    const generateWeekEvents = async () => {
      setIsLoading(true)
      
      // Fetch special days
      await fetchSpecialDays()
      
      // Fetch events from calendar API
      const calendarEvents = await fetchCalendarEvents()
      
      const today = new Date()
      // Start from yesterday (one day in the past)
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - 1)
      
      const weekEvents: DayEvent[] = []
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
        const dayNumber = date.getDate()
        const dateString = date.toISOString().split('T')[0]
        
        let events: DayEvent['events'] = []
        
        // Get events from calendar API for this day
        const dayEvents = calendarEvents.filter(event => event.date === dateString)
        
        // Get Broncos games for this day
        const broncosGames = broncosSchedule2025.filter(game => game.date === dateString)
        
        // Combine calendar events and Broncos games
        const allEvents = [
          ...dayEvents.map(event => ({
            title: event.title,
            time: event.startTime ? 
              new Date(`2000-01-01T${event.startTime}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }) : 'All Day',
            description: event.description,
            type: event.type === 'broncos' ? 'sports' as const : 
                  event.type === 'special' ? 'entertainment' as const :
                  (event.type === 'food' || event.type === 'drink' || event.type === 'entertainment') ? event.type as 'food' | 'drink' | 'entertainment' : 'entertainment' as const,
            price: event.price
          })),
          ...broncosGames.map(game => ({
            title: `Broncos vs ${game.opponent}`,
            time: new Date(`2000-01-01T${game.time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            description: `${game.potluckFood} - ${game.description}`,
            type: 'sports' as const,
            price: 'Potluck Event'
          }))
        ]
        
        // Sort events by type priority: food → drink → entertainment → sports
        const typePriority: Record<string, number> = { food: 1, drink: 2, entertainment: 3, sports: 4 }
        allEvents.sort((a, b) => {
          const aPriority = typePriority[a.type] || 5
          const bPriority = typePriority[b.type] || 5
          return aPriority - bPriority
        })
        
        if (allEvents.length > 0) {
          events = allEvents
        } else {
          // Fallback to hardcoded events if no calendar events
          // Map days based on position: 0=yesterday, 1=today, 2=tomorrow, etc.
          const dayOfWeek = date.getDay()
          switch (dayOfWeek) {
            case 0: // Sunday
              events = []
              break
            case 1: // Monday
              events = [
                {
                  title: "Chimichanga Special",
                  time: "All Day",
                  description: "Crispy chimichangas with rice and beans",
                  type: "food",
                  price: "$9.99"
                },
                {
                  title: "Monday Night Poker",
                  time: "7:00 PM",
                  description: "Weekly poker tournament with cash prizes",
                  type: "entertainment"
                }
              ]
              break
            case 2: // Tuesday
              events = [
                {
                  title: "Taco Tuesday",
                  time: "All Day",
                  description: "Beef tacos $1.50, chicken/carnitas $2, fish $3",
                  type: "food"
                },
                {
                  title: "Mexican Beer Specials",
                  time: "All Day",
                  description: "Dos Equis, Modelo, Pacifico, Corona - $4",
                  type: "drink"
                }
              ]
              break
            case 3: // Wednesday
              events = [
                {
                  title: "Southwest Eggrolls",
                  time: "All Day",
                  description: "Crispy eggrolls with rice and beans",
                  type: "food",
                  price: "$8.99"
                },
                {
                  title: "Whiskey Wednesday",
                  time: "All Day",
                  description: "$1 off all whiskey drinks",
                  type: "drink"
                }
              ]
              break
            case 4: // Thursday
              events = [
                {
                  title: "Philly Cheesesteak",
                  time: "All Day",
                  description: "Classic Philly with peppers and onions",
                  type: "food",
                  price: "$11.99"
                },
                {
                  title: "Thirsty Thursday",
                  time: "All Day",
                  description: "$1 off all tequila drinks",
                  type: "drink"
                },
                {
                  title: "Music Bingo",
                  time: "8:00 PM",
                  description: "Cash prizes and great music",
                  type: "entertainment"
                }
              ]
              break
            case 5: // Friday
              events = [
                // Happy Hour removed from calendar events
              ]
              break
            case 6: // Saturday
              events = [
                {
                  title: "Karaoke Night",
                  time: "9:00 PM",
                  description: "Sing your heart out with our karaoke setup",
                  type: "entertainment"
                }
              ]
              break
          }
        }
        
        weekEvents.push({
          day: dayName,
          date: `${dayName}, ${dayNumber}`,
          events
        })
      }
      
      setCurrentWeek(weekEvents)
      setIsLoading(false)
    }
    
    generateWeekEvents()
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'bg-orange-100 text-orange-800'
      case 'drink': return 'bg-green-100 text-green-800'
      case 'entertainment': return 'bg-purple-100 text-purple-800'
      case 'sports': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food': return 'Food'
      case 'drink': return 'Drink'
      case 'entertainment': return 'Entertainment'
      case 'sports': return 'Sports'
      default: return 'Event'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading this week's events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">What's Happening This Week</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every day brings something special at Monaghan's. From daily specials to weekly events, 
            there's always a reason to stop by! Join us for our daily happy hour from 10:00 AM - 12:00 PM & 3:00 PM - 7:00 PM with BOGO first round of wine, wells, or drafts.
          </p>
        </div>

        {/* Weekly Calendar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-12">
          {currentWeek.map((day, index) => {
            const today = new Date()
            const dayDate = new Date(today)
            dayDate.setDate(today.getDate() - 1 + index) // Start from yesterday
            const isToday = dayDate.toDateString() === today.toDateString()
            const isPastDay = index === 0 // Only the first day (yesterday) is past
            
            // Check if this day is a special day - use local date string for comparison
            const year = dayDate.getFullYear()
            const month = String(dayDate.getMonth() + 1).padStart(2, '0')
            const dayNum = String(dayDate.getDate()).padStart(2, '0')
            const dateString = `${year}-${month}-${dayNum}`
            
            const specialDay = specialDays.find(sd => {
              const sdDateString = sd.date.split('T')[0]
              return sdDateString === dateString
            })
            const isClosed = specialDay?.closed || false
            const hasSpecialHours = specialDay && !specialDay.closed
            
            return (
              <div 
                key={index} 
                className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                  isToday ? 'ring-2 ring-green-500 ring-opacity-50 shadow-lg' : ''
                } ${isPastDay ? 'opacity-60' : ''} ${isClosed ? 'ring-2 ring-red-500' : ''} ${hasSpecialHours ? 'ring-2 ring-amber-500' : ''}`}
              >
                {/* Special Hours Banner */}
                {hasSpecialHours && (
                  <div className="bg-amber-500 text-white px-3 py-2 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide">Special Hours</p>
                    <p className="text-sm font-medium">{specialDay.openTime} - {specialDay.closeTime}</p>
                  </div>
                )}
                
                <div className={`${
                  isClosed ? 'bg-red-600' :
                  isToday ? 'bg-green-700' : 
                  isPastDay ? 'bg-gray-500' : 
                  'bg-green-600'
                } text-white p-4 text-center`}>
                  <h3 className="font-bold text-lg">{day.day}</h3>
                  <p className={`${isClosed ? 'text-red-100' : 'text-green-100'} text-sm`}>{day.date.split(',')[1]}</p>
                  {hasSpecialHours && (
                    <p className="text-xs text-green-100 mt-1">{specialDay.reason}</p>
                  )}
                </div>
              
              <div className="p-4 space-y-3">
                {isClosed ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <p className="font-bold text-red-900 text-lg mb-2">CLOSED</p>
                    <p className="text-sm text-red-700">{specialDay?.reason}</p>
                  </div>
                ) : day.events.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No events scheduled</p>
                ) : (
                  day.events.map((event, eventIndex) => (
                  <div key={eventIndex} className={`border-l-4 pl-3 ${isPastDay ? 'border-gray-200' : 'border-green-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${isPastDay ? 'bg-gray-100 text-gray-600' : getTypeColor(event.type)}`}>
                        {getTypeIcon(event.type)}
                      </span>
                    </div>
                    <h4 className={`font-semibold text-sm ${isPastDay ? 'text-gray-500' : 'text-gray-900'}`}>{event.title}</h4>
                    <p className={`text-xs mb-1 ${isPastDay ? 'text-gray-400' : 'text-gray-600'}`}>{event.time}</p>
                    <p className={`text-xs ${isPastDay ? 'text-gray-400' : 'text-gray-700'}`}>{event.description}</p>
                    {event.price && (
                      <p className={`font-semibold text-xs mt-1 ${isPastDay ? 'text-gray-400' : 'text-green-600'}`}>{event.price}</p>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
