import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const limit = searchParams.get('limit')

    // Build where clause
    const where: any = {}

    // If siteId is provided, filter by site
    if (siteId) {
      where.siteId = siteId
    }

    // Get events from database
    const events = await prisma.event.findMany({
      where,
      orderBy: [
        { dayOfWeek: 'asc' },
        { time: 'asc' },
        { startDate: 'asc' }
      ],
      take: limit ? parseInt(limit) : undefined,
      include: {
        site: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    // Transform events for frontend
    const transformedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      day: event.dayOfWeek !== null ? getDayName(event.dayOfWeek) : null,
      time: event.time ? formatTime(event.time) : null,
      startDate: event.startDate,
      endDate: event.endDate,
      isRecurring: event.isRecurring,
      dayOfWeek: event.dayOfWeek,
      site: event.site
    }))

    return NextResponse.json({
      events: transformedEvents,
      count: events.length
    })
  } catch (error) {
    console.error('Public events API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions
function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || 'Unknown'
}

function formatTime(time: string): string {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}
