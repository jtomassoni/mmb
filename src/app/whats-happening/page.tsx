'use client'

import { useState, useEffect } from 'react'
import { broncosGames2025, BroncosGame } from '../../lib/broncos-events'

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

export default function WhatsHappeningPage() {
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
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay()) // Start from Sunday
      
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
        
        if (dayEvents.length > 0) {
          events = dayEvents.map(event => ({
            title: event.title,
            time: event.startTime ? 
              new Date(`2000-01-01T${event.startTime}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }) : 'All Day',
            description: event.description,
            type: event.type === 'broncos' ? 'sports' : event.type as 'food' | 'drink' | 'entertainment',
            price: event.price
          }))
        } else {
          // Fallback to hardcoded events if no calendar events
          switch (i) {
            case 0: // Sunday
              events = [
                {
                  title: "Sunday Funday",
                  time: "All Day",
                  description: "Relaxed vibes, great food, and cold drinks",
                  type: "entertainment"
                }
              ]
              break
            case 1: // Monday
              events = [
                {
                  title: "Monday Night Poker",
                  time: "7:00 PM",
                  description: "Weekly poker tournament with cash prizes",
                  type: "entertainment"
                },
                {
                  title: "Chimichanga Special",
                  time: "All Day",
                  description: "Crispy chimichangas with rice and beans",
                  type: "food",
                  price: "$9.99"
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
                  title: "Whiskey Wednesday",
                  time: "All Day",
                  description: "$1 off all whiskey drinks",
                  type: "drink"
                },
                {
                  title: "Southwest Eggrolls",
                  time: "All Day",
                  description: "Crispy eggrolls with rice and beans",
                  type: "food",
                  price: "$8.99"
                }
              ]
              break
            case 4: // Thursday
              events = [
                {
                  title: "Thirsty Thursday",
                  time: "All Day",
                  description: "$1 off all tequila drinks",
                  type: "drink"
                },
                {
                  title: "Philly Cheesesteak",
                  time: "All Day",
                  description: "Classic Philly with peppers and onions",
                  type: "food",
                  price: "$11.99"
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
                  title: "Friday Night Vibes",
                  time: "All Day",
                  description: "Weekend starts here! Open until 2 AM",
                  type: "entertainment"
                },
                {
                  title: "Happy Hour",
                  time: "3:00 PM - 7:00 PM",
                  description: "BOGO first round of wine, wells, or drafts",
                  type: "drink"
                }
              ]
              break
            case 6: // Saturday
              events = [
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
                },
                {
                  title: "Happy Hour",
                  time: "3:00 PM - 7:00 PM",
                  description: "BOGO first round of wine, wells, or drafts",
                  type: "drink"
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
            there's always a reason to stop by!
          </p>
        </div>

        {/* Weekly Calendar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-12">
          {currentWeek.map((day, index) => {
            const today = new Date()
            const isToday = today.getDay() === index
            
            return (
              <div 
                key={index} 
                className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                  isToday ? 'ring-2 ring-green-500 ring-opacity-50 shadow-lg' : ''
                }`}
              >
                <div className={`${isToday ? 'bg-green-700' : 'bg-green-600'} text-white p-4 text-center relative`}>
                  {isToday && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      TODAY
                    </div>
                  )}
                  <h3 className="font-bold text-lg">{day.day}</h3>
                  <p className="text-green-100 text-sm">{day.date.split(',')[1]}</p>
                </div>
              
              <div className="p-4 space-y-3">
                {day.events.map((event, eventIndex) => (
                  <div key={eventIndex} className="border-l-4 border-green-200 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(event.type)}`}>
                        {getTypeIcon(event.type)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{event.title}</h4>
                    <p className="text-gray-600 text-xs mb-1">{event.time}</p>
                    <p className="text-gray-700 text-xs">{event.description}</p>
                    {event.price && (
                      <p className="text-green-600 font-semibold text-xs mt-1">{event.price}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )
          })}
        </div>

        {/* Broncos Games Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Upcoming Broncos Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {broncosGames2025
              .filter(game => new Date(game.date) >= new Date())
              .slice(0, 3)
              .map((game) => (
              <div key={game.id} className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg p-6 border border-blue-200">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Broncos vs {game.opponent}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {new Date(game.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium text-blue-800 mb-1">We're providing:</p>
                    <p className="text-sm font-semibold text-blue-700">{game.whatWeProvide || game.mainDish}</p>
                  </div>
                  <div className="text-sm text-gray-700 mb-4 whitespace-pre-line">
                    {game.description}
                  </div>
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-sm text-gray-600 mr-2">
                      {game.homeAway === 'home' ? 'Home' : game.homeAway === 'away' ? 'Away' : 'Neutral Site'}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {new Date(`2000-01-01T${game.time}`).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </span>
                  </div>
                  <span className="inline-block bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                    Potluck Event
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Happy Hour Info */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Daily Happy Hour</h2>
          <p className="text-xl mb-2">10:00 AM - 12:00 PM & 3:00 PM - 7:00 PM</p>
          <p className="text-green-100">Buy One Get One on first round of wine, wells, or drafts</p>
        </div>
      </div>
    </div>
  )
}