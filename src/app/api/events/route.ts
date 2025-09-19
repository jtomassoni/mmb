import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Build where clause
    const where: any = {}
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
    console.error('Events API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { siteId, title, description, isRecurring, dayOfWeek, time, startDate, endDate } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Get or create default site
    let site
    if (siteId && siteId !== 'default') {
      site = await prisma.site.findUnique({ where: { id: siteId } })
      if (!site) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 })
      }
    } else {
      // Use first site or create default
      site = await prisma.site.findFirst()
      if (!site) {
        site = await prisma.site.create({
          data: {
            name: "Monaghan's Bar & Grill",
            slug: "monaghans-bar-grill",
            description: "Where Denver comes to eat, drink, and play",
            address: "1234 Main Street, Denver, CO 80202",
            phone: "(303) 555-0123",
            email: "info@monaghansbargrill.com"
          }
        })
      }
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        siteId: site.id,
        title,
        description,
        isRecurring: isRecurring || false,
        dayOfWeek: isRecurring ? dayOfWeek : null,
        time: isRecurring ? time : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        site: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      event: {
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
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ 
      error: 'Failed to create event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, isRecurring, dayOfWeek, time, startDate, endDate } = body

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Update event
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        isRecurring: isRecurring || false,
        dayOfWeek: isRecurring ? dayOfWeek : null,
        time: isRecurring ? time : null,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        site: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      event: {
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
      }
    })
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json({ 
      error: 'Failed to update event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    await prisma.event.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete event',
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
