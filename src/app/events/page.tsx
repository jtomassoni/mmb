'use client'

import { useState, useEffect } from 'react'

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setEvents(data.events)
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
        
        {events.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No events scheduled</h2>
            <p className="text-gray-600">Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white p-8 rounded-lg shadow">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2 text-red-600">{event.title}</h3>
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
