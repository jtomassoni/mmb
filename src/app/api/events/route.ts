import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { hasPermission, validateSiteAccess } from '../../../lib/rbac'
import { createAuditLogEntry } from '../../../lib/audit-log'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Check permissions
    if (!hasPermission((session.user as any).role, 'events', 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get user's site access
    let userSiteId: string | null = null
    if ((session.user as any).role !== 'SUPERADMIN') {
      const membership = await prisma.membership.findFirst({
        where: { userId: (session.user as any).id },
        include: { site: true }
      })
      userSiteId = membership?.siteId || null
    }

    // Build where clause
    const where: any = {}
    if (siteId) {
      // Validate site access
      if (!validateSiteAccess((session.user as any).role, userSiteId || '', siteId, 'read')) {
        return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
      }
      where.siteId = siteId
    } else if ((session.user as any).role !== 'SUPERADMIN') {
      // Non-superadmin users can only see their own site's events
      where.siteId = userSiteId
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
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { siteId, title, description, isRecurring, dayOfWeek, time, startDate, endDate } = body

    // Check permissions
    if (!hasPermission((session.user as any).role, 'events', 'create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

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
      
      // Get user's site access for validation
      let userSiteId: string | null = null
      if ((session.user as any).role !== 'SUPERADMIN') {
        const membership = await prisma.membership.findFirst({
          where: { userId: session.user.id }
        })
        userSiteId = membership?.siteId || null
      }

      // Validate site access
      if (!validateSiteAccess((session.user as any).role, userSiteId || '', siteId, 'create')) {
        return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
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
            email: "Monaghanv061586@gmail.com"
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

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userRole: (session.user as any).role,
        userEmail: (session.user as any).email || null,
        userName: (session.user as any).name || null,
        action: 'create',
        resource: 'events',
        resourceId: event.id,
        siteId: site.id,
        siteName: site.name,
        newValue: JSON.stringify({
          title: event.title,
          description: event.description,
          isRecurring: event.isRecurring,
          dayOfWeek: event.dayOfWeek,
          time: event.time,
          startDate: event.startDate,
          endDate: event.endDate
        }),
        success: true,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null
      } as any
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
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, title, description, isRecurring, dayOfWeek, time, startDate, endDate } = body

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Check permissions
    if (!hasPermission((session.user as any).role, 'events', 'update')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get existing event to check access and capture old values
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { site: true }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get user's site access for validation
    let userSiteId: string | null = null
    if ((session.user as any).role !== 'SUPERADMIN') {
      const membership = await prisma.membership.findFirst({
        where: { userId: session.user.id }
      })
      userSiteId = membership?.siteId || null
    }

    // Validate site access
    if (!validateSiteAccess((session.user as any).role, userSiteId || '', existingEvent.siteId, 'update')) {
      return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
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

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userRole: (session.user as any).role,
        userEmail: (session.user as any).email || null,
        userName: (session.user as any).name || null,
        action: 'update',
        resource: 'events',
        resourceId: event.id,
        siteId: existingEvent.siteId,
        siteName: existingEvent.site.name,
        oldValue: JSON.stringify({
          title: existingEvent.title,
          description: existingEvent.description,
          isRecurring: existingEvent.isRecurring,
          dayOfWeek: existingEvent.dayOfWeek,
          time: existingEvent.time,
          startDate: existingEvent.startDate,
          endDate: existingEvent.endDate
        }),
        newValue: JSON.stringify({
          title: event.title,
          description: event.description,
          isRecurring: event.isRecurring,
          dayOfWeek: event.dayOfWeek,
          time: event.time,
          startDate: event.startDate,
          endDate: event.endDate
        }),
        success: true,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null
      } as any
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
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Check permissions
    if (!hasPermission((session.user as any).role, 'events', 'delete')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get existing event to check access and capture old values
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { site: true }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get user's site access for validation
    let userSiteId: string | null = null
    if ((session.user as any).role !== 'SUPERADMIN') {
      const membership = await prisma.membership.findFirst({
        where: { userId: session.user.id }
      })
      userSiteId = membership?.siteId || null
    }

    // Validate site access
    if (!validateSiteAccess((session.user as any).role, userSiteId || '', existingEvent.siteId, 'delete')) {
      return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
    }

    await prisma.event.delete({
      where: { id }
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userRole: (session.user as any).role,
        userEmail: (session.user as any).email || null,
        userName: (session.user as any).name || null,
        action: 'delete',
        resource: 'events',
        resourceId: id,
        siteId: existingEvent.siteId,
        siteName: existingEvent.site.name,
        oldValue: JSON.stringify({
          title: existingEvent.title,
          description: existingEvent.description,
          isRecurring: existingEvent.isRecurring,
          dayOfWeek: existingEvent.dayOfWeek,
          time: existingEvent.time,
          startDate: existingEvent.startDate,
          endDate: existingEvent.endDate
        }),
        success: true,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null
      } as any
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
