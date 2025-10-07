import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 })
    }

    const eventTypes = await prisma.eventType.findMany({
      where: {
        siteId,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        siteId: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ success: true, eventTypes })
  } catch (error) {
    console.error('Error fetching event types:', error)
    return NextResponse.json({ error: 'Failed to fetch event types' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { siteId, name, description, color, icon } = body

    if (!siteId || !name) {
      return NextResponse.json({ error: 'Site ID and name are required' }, { status: 400 })
    }

    const eventType = await prisma.eventType.create({
      data: {
        siteId,
        name,
        description,
        color,
        icon,
        isActive: true
      }
    })

    // Log the audit event
    await logAuditEvent({
      userId: session.user.id,
      userRole: session.user.role,
      userEmail: session.user.email,
      userName: session.user.name,
      action: 'create',
      resource: 'event_types',
      resourceId: eventType.id,
      details: { name, description, color, icon }
    })

    return NextResponse.json({ success: true, eventType })
  } catch (error) {
    console.error('Error creating event type:', error)
    return NextResponse.json({ error: 'Failed to create event type' }, { status: 500 })
  }
}
