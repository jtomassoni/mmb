import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, startDate, endDate, startTime, endTime, location, isActive, image } = body

    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        name,
        description: description || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || null,
        isActive: isActive !== false,
        image: image || null
      }
    })

    // Log the update
    await logAuditEvent({
      action: 'UPDATE',
      resource: 'events',
      resourceId: event.id,
      userId: session.user.id,
      changes: { name, startDate, endDate, isActive },
      metadata: { description, startTime, endTime, location, image },
      previousValues: {
        name: existingEvent.name,
        startDate: existingEvent.startDate,
        endDate: existingEvent.endDate,
        isActive: existingEvent.isActive
      }
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    await prisma.event.delete({
      where: { id: params.id }
    })

    // Log the deletion
    await logAuditEvent({
      action: 'DELETE',
      resource: 'events',
      resourceId: params.id,
      userId: session.user.id,
      changes: { deleted: true },
      metadata: { 
        name: existingEvent.name,
        startDate: existingEvent.startDate,
        endDate: existingEvent.endDate
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
