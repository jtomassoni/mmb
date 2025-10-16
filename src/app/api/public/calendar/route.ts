// src/app/api/public/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBroncosGamesForWeek, broncosSchedule2025 } from '@/lib/broncos-schedule'

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string // YYYY-MM-DD
  startTime?: string // HH:MM
  endTime?: string // HH:MM
  type: 'food' | 'drink' | 'entertainment' | 'broncos' | 'special' | 'sports'
  isRecurring: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  recurringDays?: number[] // 0-6 for days of week
  price?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  eventType?: {
    id: string
    name: string
    color?: string
    icon?: string
  }
  images?: Array<{
    id: string
    url: string
    alt?: string
    caption?: string
  }>
  ctas?: Array<{
    id: string
    text: string
    url: string
    type: string
  }>
}

// Generate recurring events for the next 30 days
function generateRecurringEvents(baseEvents: CalendarEvent[]): CalendarEvent[] {
  const generatedEvents: CalendarEvent[] = []
  const today = new Date()
  
  // Start from beginning of current week (Sunday) to include past days
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  
  const endDate = new Date()
  endDate.setDate(today.getDate() + 30)

  baseEvents.forEach(event => {
    if (!event.isRecurring || !event.isActive) {
      generatedEvents.push(event)
      return
    }

    if (event.recurringPattern === 'weekly' && event.recurringDays) {
      // Generate weekly recurring events starting from beginning of current week
      const startDate = new Date(startOfWeek)
      
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
      // Generate daily recurring events starting from beginning of current week
      const startDate = new Date(startOfWeek)
      
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

    // Get the site first
    const site = await prisma.site.findFirst({
      where: { slug: 'monaghans-bargrill' }
    })

    if (!site) {
      return NextResponse.json(
        { success: false, error: 'Site not found' },
        { status: 404 }
      )
    }

    // Fetch events from database
    const dbEvents = await prisma.event.findMany({
      where: {
        siteId: site.id,
        isActive: true,
        ...(startDate && endDate ? {
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        } : {})
      },
      include: {
        eventType: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        ctas: {
          where: { isActive: true }
        }
      },
      orderBy: { startDate: 'asc' }
    })

    // Convert database events to calendar format
    const calendarEvents: CalendarEvent[] = dbEvents.map(event => ({
      id: event.id,
      title: event.name,
      description: event.description || '',
      date: event.startDate.toISOString().split('T')[0],
      startTime: event.startTime || undefined,
      endTime: event.endTime || undefined,
      type: event.eventType?.name?.toLowerCase().includes('food') ? 'food' :
            event.eventType?.name?.toLowerCase().includes('drink') ? 'drink' :
            event.eventType?.name?.toLowerCase().includes('sport') ? 'sports' :
            event.eventType?.name?.toLowerCase().includes('entertainment') ? 'entertainment' :
            'special',
      isRecurring: false, // For now, we'll handle recurring events separately
      price: event.price || undefined,
      isActive: event.isActive,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      eventType: event.eventType ? {
        id: event.eventType.id,
        name: event.eventType.name,
        color: event.eventType.color || undefined,
        icon: event.eventType.icon || undefined
      } : undefined,
      images: event.images.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt || undefined,
        caption: img.caption || undefined
      })),
      ctas: event.ctas.map(cta => ({
        id: cta.id,
        text: cta.text,
        url: cta.url,
        type: cta.type
      }))
    }))

    // Add Broncos games for the requested date range
    if (startDate && endDate) {
      const broncosGames = getBroncosGamesForWeek(startDate, endDate)
      broncosGames.forEach(game => {
        calendarEvents.push({
          id: game.id,
          title: `Broncos vs ${game.opponent} Potluck`,
          description: game.description,
          date: game.date,
          startTime: game.time,
          type: 'sports',
          isRecurring: false,
          price: 'Potluck Event',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          eventType: {
            id: 'broncos',
            name: 'Sports Event',
            color: '#3498DB',
            icon: '🏈'
          }
        })
      })
    }
    
    let filteredEvents = calendarEvents.filter(event => event.isActive)

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
