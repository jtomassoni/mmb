'use client'

import { useState, useEffect } from 'react'
import { broncosSchedule2025, BroncosGame } from '../../lib/broncos-schedule'

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

interface Event {
  id: string
  title: string
  description: string | null
  day: string | null
  time: string | null
  startDate: string
  endDate: string | null
  isRecurring: boolean
  dayOfWeek: number | null
  site: {
    name: string
    slug: string
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [broncosOffset, setBroncosOffset] = useState(0)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch from calendar API
        const today = new Date()
        const nextMonth = new Date()
        nextMonth.setMonth(today.getMonth() + 1)
        
        const startDate = today.toISOString().split('T')[0]
        const endDate = nextMonth.toISOString().split('T')[0]
        
        const response = await fetch(`/api/public/calendar?startDate=${startDate}&endDate=${endDate}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        if (data.success) {
          setCalendarEvents(data.events)
        } else {
          throw new Error('Failed to fetch calendar events')
        }
        
        // Keep the old events API as fallback for now
        try {
          const oldResponse = await fetch('/api/public/events')
          if (oldResponse.ok) {
            const oldData = await oldResponse.json()
            setEvents(oldData.events)
          }
        } catch (oldError) {
          console.warn('Old events API failed, using calendar events only')
        }
        
      } catch (error) {
        console.error('Failed to fetch events:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch events')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // JSON-LD structured data for events
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Restaurant Events",
    "description": "Weekly events at Monaghan's Bar & Grill including poker, bingo, and Broncos games",
    "organizer": {
      "@type": "Organization",
      "name": "Monaghan's Bar & Grill",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1234 Main Street",
        "addressLocality": "Denver",
        "addressRegion": "CO",
        "postalCode": "80202"
      },
      "telephone": "(303) 555-0123"
    },
    "eventSchedule": events.map(event => ({
      "@type": "Schedule",
      "name": event.title,
      "description": event.description,
      "recurrenceRule": event.isRecurring ? `FREQ=WEEKLY;BYDAY=${event.day?.toUpperCase().substring(0, 2)}` : undefined,
      "startTime": event.time
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Events & Entertainment</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-8 rounded-lg shadow animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Events & Entertainment</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to load events</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Events & Entertainment</h1>
        
        {/* Calendar Events */}
        {calendarEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calendarEvents.slice(0, 6).map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.type === 'food' ? 'bg-orange-100 text-orange-800' :
                        event.type === 'drink' ? 'bg-green-100 text-green-800' :
                        event.type === 'entertainment' ? 'bg-purple-100 text-purple-800' :
                        event.type === 'broncos' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.type}
                      </span>
                      {event.price && (
                        <span className="text-sm font-semibold text-green-600">{event.price}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">📅</span>
                      <span>{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                      {event.startTime && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{new Date(`2000-01-01T${event.startTime}`).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && calendarEvents.length === 0 ? (
          <div className="space-y-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Weekly Events at Monaghan's</h2>
              <p className="text-gray-600 mb-6">Join us for our regular weekly events!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2 text-red-600">Monday - Chimichangas & Poker</h3>
                  <p className="text-lg text-gray-600 mb-2">Monday</p>
                  <p className="text-lg font-medium text-gray-800 mb-4">7:00 PM</p>
                  <p className="text-gray-600 mb-4">Chimichangas special + Poker night</p>
                  <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    Weekly Event
                  </span>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2 text-red-600">Tuesday - Taco Tuesday</h3>
                  <p className="text-lg text-gray-600 mb-2">Tuesday</p>
                  <p className="text-lg font-medium text-gray-800 mb-4">All Day</p>
                  <p className="text-gray-600 mb-4">Beef tacos $1.50, chicken/carnitas $2, fish $3. Mexican beer specials!</p>
                  <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    Weekly Event
                  </span>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2 text-red-600">Thursday - Thirsty Thursday</h3>
                  <p className="text-lg text-gray-600 mb-2">Thursday</p>
                  <p className="text-lg font-medium text-gray-800 mb-4">All Day</p>
                  <p className="text-gray-600 mb-4">$1 off tequila + Philly cheesesteak + Music Bingo with cash prizes</p>
                  <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    Weekly Event
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-white p-8 rounded-lg shadow">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2 text-red-600">Wednesday - Whiskey Wednesday</h3>
                  <p className="text-lg text-gray-600 mb-2">Wednesday</p>
                  <p className="text-lg font-medium text-gray-800 mb-4">All Day</p>
                  <p className="text-gray-600 mb-4">$1 off all whiskey + Southwest Eggrolls with rice & beans</p>
                  <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    Weekly Event
                  </span>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2 text-red-600">NFL Watch Parties</h3>
                  <p className="text-lg text-gray-600 mb-2">Thursday & Sunday</p>
                  <p className="text-lg font-medium text-gray-800 mb-4">Game Time</p>
                  <p className="text-gray-600 mb-4">Thursday Night Football & Sunday games - join us for the action!</p>
                  <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    Seasonal Event
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white p-8 rounded-lg shadow">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2 text-green-600">{event.title}</h3>
                  {event.day && (
                    <p className="text-lg text-gray-600 mb-2">{event.day}</p>
                  )}
                  {event.time && (
                    <p className="text-lg font-medium text-gray-800 mb-4">{event.time}</p>
                  )}
                  {event.description && (
                    <p className="text-gray-600 mb-4">{event.description}</p>
                  )}
                  {event.isRecurring && (
                    <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      Weekly Event
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Broncos Games Section */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Broncos Game Potlucks</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setBroncosOffset(Math.max(0, broncosOffset - 3))}
                disabled={broncosOffset === 0}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setBroncosOffset(broncosOffset + 3)}
                disabled={broncosOffset + 3 >= broncosSchedule2025.filter(game => new Date(game.date) >= new Date()).length}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Join us for every Broncos game! We provide the main dish, you bring a side or dessert. 
            It's a community potluck that makes every game day special.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {broncosSchedule2025
              .filter(game => new Date(game.date) >= new Date())
              .slice(broncosOffset, broncosOffset + 3)
              .map((game) => (
              <div key={game.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 text-green-600">
                    Broncos vs {game.opponent}
                  </h3>
                  <p className="text-lg text-gray-600 mb-2">
                    {new Date(game.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-lg font-medium text-gray-800 mb-3">
                    {new Date(`2000-01-01T${game.time}`).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    {game.homeAway === 'home' ? 'Home Game' : game.homeAway === 'away' ? 'Away Game' : 'Neutral Site'}
                  </p>
                  <div className="bg-green-50 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium text-green-800 mb-1">We're providing:</p>
                    <p className="text-lg font-semibold text-green-700">{game.potluckFood}</p>
                  </div>
                  <div className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                    {game.description}
                  </div>
                  <span className="inline-block bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                    Potluck Event
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Showing next 3 upcoming games. Check back for more!
            </p>
            <a 
              href="tel:3035550123" 
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
            >
              Call (303) 555-0123 for Full Schedule
            </a>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Private Events</h2>
          <p className="text-gray-600 mb-6">
            Host your next party, corporate event, or celebration at Monaghan's!
          </p>
          <a 
            href="tel:3035550123" 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-block"
          >
            Call (303) 555-0123 to Book
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
