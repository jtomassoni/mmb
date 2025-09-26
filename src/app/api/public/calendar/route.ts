// src/app/api/public/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string // YYYY-MM-DD
  startTime?: string // HH:MM
  endTime?: string // HH:MM
  type: 'food' | 'drink' | 'entertainment' | 'broncos' | 'special'
  isRecurring: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  recurringDays?: number[] // 0-6 for days of week
  price?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Mock data - in production this would come from database
const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Monday Poker Night',
    description: 'Weekly poker tournament with cash prizes',
    date: '2025-01-20',
    startTime: '19:00',
    endTime: '23:00',
    type: 'entertainment',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringDays: [1], // Monday
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '1b',
    title: 'Chimichangas Special',
    description: 'Crispy chimichangas with rice and beans',
    date: '2025-01-20',
    type: 'food',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringDays: [1], // Monday
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Taco Tuesday',
    description: 'Beef tacos $1.50, chicken/carnitas $2, fish $3',
    date: '2025-01-21',
    type: 'food',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringDays: [2], // Tuesday
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Whiskey Wednesday',
    description: '$1 off all whiskey drinks',
    date: '2025-01-22',
    type: 'drink',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringDays: [3], // Wednesday
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '3b',
    title: 'Southwest Eggrolls Special',
    description: 'Crispy eggrolls with rice and beans',
    date: '2025-01-22',
    type: 'food',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringDays: [3], // Wednesday
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    title: 'Thirsty Thursday - Drink Special',
    description: '$1 off all tequila drinks',
    date: '2025-01-23',
    type: 'drink',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringDays: [4], // Thursday
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '4b',
    title: 'Philly Cheesesteak Special',
    description: 'Classic Philly cheesesteak with peppers and onions',
    date: '2025-01-23',
    type: 'food',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringDays: [4], // Thursday
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '4c',
    title: 'Music Bingo',
    description: 'Music Bingo with cash prizes',
    date: '2025-01-23',
    startTime: '20:00',
    type: 'entertainment',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringDays: [4], // Thursday
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    title: 'Broncos vs Raiders',
    description: 'Game day potluck - we provide taco bar, you bring sides!',
    date: '2025-09-07',
    startTime: '13:00',
    type: 'broncos',
    isRecurring: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  // Broncos Games
  {
    id: 'broncos-titans-week1',
    title: 'Broncos vs Titans Potluck',
    description: 'Week 1\n• Broncos vs Titans\n• Community potluck event\n• Bring a side or dessert',
    date: '2024-09-07',
    startTime: '13:00',
    type: 'broncos',
    isRecurring: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'broncos-colts-week2',
    title: 'Broncos vs Colts Potluck',
    description: 'Week 2\n• Broncos vs Colts\n• Community potluck event\n• Bring your favorite side or dessert',
    date: '2024-09-14',
    startTime: '13:00',
    type: 'broncos',
    isRecurring: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'broncos-chargers-week3',
    title: 'Broncos vs Chargers Potluck',
    description: 'Week 3\n• Broncos vs Chargers\n• Community potluck event\n• Bring a side or dessert',
    date: '2024-09-21',
    startTime: '13:00',
    type: 'broncos',
    isRecurring: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
]

// Generate recurring events for the next 30 days
function generateRecurringEvents(baseEvents: CalendarEvent[]): CalendarEvent[] {
  const generatedEvents: CalendarEvent[] = []
  const today = new Date()
  const endDate = new Date()
  endDate.setDate(today.getDate() + 30)

  baseEvents.forEach(event => {
    if (!event.isRecurring || !event.isActive) {
      generatedEvents.push(event)
      return
    }

    if (event.recurringPattern === 'weekly' && event.recurringDays) {
      // Generate weekly recurring events
      const startDate = new Date(event.date)
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (event.recurringDays.includes(d.getDay())) {
          const recurringEvent: CalendarEvent = {
            ...event,
            id: `${event.id}-${d.toISOString().split('T')[0]}`,
            date: d.toISOString().split('T')[0]
          }
          generatedEvents.push(recurringEvent)
        }
      }
    } else if (event.recurringPattern === 'daily') {
      // Generate daily recurring events
      const startDate = new Date(event.date)
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const recurringEvent: CalendarEvent = {
          ...event,
          id: `${event.id}-${d.toISOString().split('T')[0]}`,
          date: d.toISOString().split('T')[0]
        }
        generatedEvents.push(recurringEvent)
      }
    }
  })

  return generatedEvents
}

// GET - Fetch public calendar events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')

    // Generate recurring events
    const allEvents = generateRecurringEvents(calendarEvents)
    
    let filteredEvents = allEvents.filter(event => event.isActive)

    // Filter by date range
    if (startDate && endDate) {
      filteredEvents = filteredEvents.filter(event => 
        event.date >= startDate && event.date <= endDate
      )
    }

    // Filter by type
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type)
    }

    // Sort by date
    filteredEvents.sort((a, b) => a.date.localeCompare(b.date))

    // Apply limit
    if (limit) {
      filteredEvents = filteredEvents.slice(0, parseInt(limit))
    }

    return NextResponse.json({
      success: true,
      events: filteredEvents,
      total: filteredEvents.length
    })
  } catch (error) {
    console.error('Error fetching public calendar events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}
