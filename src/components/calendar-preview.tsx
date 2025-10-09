'use client'

import { useState, useEffect } from 'react'
import { broncosSchedule2025 } from '../lib/broncos-schedule'

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

export function CalendarPreview() {
  const [currentWeek, setCurrentWeek] = useState<DayEvent[]>([])
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

  useEffect(() => {
    const generateWeekEvents = async () => {
      setIsLoading(true)
      
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
                {
                  title: "Happy Hour",
                  time: "3:00 PM - 7:00 PM",
                  description: "BOGO first round of wine, wells, or drafts",
                  type: "drink"
                },
                {
                  title: "Friday Night Vibes",
                  time: "All Day",
                  description: "Weekend starts here! Open until 2 AM",
                  type: "entertainment"
                }
              ]
              break
            case 6: // Saturday
              events = [
                {
                  title: "Happy Hour",
                  time: "3:00 PM - 7:00 PM",
                  description: "BOGO first round of wine, wells, or drafts",
                  type: "drink"
                },
                {
                  title: "Saturday Night",
                  time: "All Day",
                  description: "Full weekend energy! Open until 2 AM",
                  type: "entertainment"
                },
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading calendar...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">This Week's Events</h3>
        <p className="text-sm text-gray-600">Preview of what customers see</p>
      </div>
      
      {/* Weekly Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
        {currentWeek.map((day, index) => {
          const today = new Date()
          const dayDate = new Date(today)
          dayDate.setDate(today.getDate() - 1 + index) // Start from yesterday
          const isToday = dayDate.toDateString() === today.toDateString()
          const isPastDay = index === 0 // Only the first day (yesterday) is past
          
          return (
            <div 
              key={index} 
              className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                isToday ? 'ring-2 ring-purple-500 ring-opacity-50 shadow-lg' : ''
              } ${isPastDay ? 'opacity-60' : ''}`}
            >
              <div className={`${isToday ? 'bg-purple-700' : isPastDay ? 'bg-gray-500' : 'bg-purple-600'} text-white p-3 text-center`}>
                <h4 className="font-bold text-sm">{day.day}</h4>
                <p className="text-purple-100 text-xs">{day.date.split(',')[1]}</p>
              </div>
            
              <div className="p-2 space-y-2">
                {day.events.slice(0, 2).map((event, eventIndex) => (
                  <div key={eventIndex} className={`border-l-2 pl-2 ${isPastDay ? 'border-gray-200' : 'border-purple-200'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className={`text-xs px-1 py-0.5 rounded-full ${isPastDay ? 'bg-gray-100 text-gray-600' : getTypeColor(event.type)}`}>
                        {getTypeIcon(event.type)}
                      </span>
                    </div>
                    <h5 className={`font-semibold text-xs ${isPastDay ? 'text-gray-500' : 'text-gray-900'}`}>{event.title}</h5>
                    <p className={`text-xs mb-1 ${isPastDay ? 'text-gray-400' : 'text-gray-600'}`}>{event.time}</p>
                    <p className={`text-xs ${isPastDay ? 'text-gray-400' : 'text-gray-700'}`}>{event.description}</p>
                    {event.price && (
                      <p className={`font-semibold text-xs mt-1 ${isPastDay ? 'text-gray-400' : 'text-green-600'}`}>{event.price}</p>
                    )}
                  </div>
                ))}
                {day.events.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{day.events.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Happy Hour Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <h4 className="text-sm font-semibold text-green-800 mb-1">Daily Happy Hour</h4>
        <p className="text-green-700 text-xs mb-1">10:00 AM - 12:00 PM & 3:00 PM - 7:00 PM</p>
        <p className="text-xs text-green-600">Buy One Get One on first round of wine, wells, or drafts</p>
      </div>
    </div>
  )
}
