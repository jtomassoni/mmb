// src/app/api/admin/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

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
    id: '4',
    title: 'Thirsty Thursday',
    description: '$1 off tequila + Philly cheesesteak + Music Bingo',
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
  }
]

// GET - Fetch calendar events
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')

    let filteredEvents = [...calendarEvents]

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

    return NextResponse.json({
      success: true,
      events: filteredEvents,
      total: filteredEvents.length
    })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

// POST - Create new calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const eventData = await request.json()
    
    // Validate required fields
    if (!eventData.title || !eventData.date || !eventData.type) {
      return NextResponse.json(
        { success: false, error: 'Title, date, and type are required' },
        { status: 400 }
      )
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventData.title,
      description: eventData.description || '',
      date: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      type: eventData.type,
      isRecurring: eventData.isRecurring || false,
      recurringPattern: eventData.recurringPattern,
      recurringDays: eventData.recurringDays,
      price: eventData.price,
      isActive: eventData.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    calendarEvents.push(newEvent)

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: 'Event created successfully'
    })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}

// PUT - Update calendar event
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, ...updateData } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const eventIndex = calendarEvents.findIndex(event => event.id === id)
    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    // Update event
    calendarEvents[eventIndex] = {
      ...calendarEvents[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      event: calendarEvents[eventIndex],
      message: 'Event updated successfully'
    })
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update calendar event' },
      { status: 500 }
    )
  }
}

// DELETE - Delete calendar event
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const eventIndex = calendarEvents.findIndex(event => event.id === id)
    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    calendarEvents.splice(eventIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete calendar event' },
      { status: 500 }
    )
  }
}
