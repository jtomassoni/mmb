import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { 
      name, 
      description, 
      startDate, 
      endDate, 
      startTime, 
      endTime, 
      location, 
      isActive,
      eventTypeId,
      price,
      images,
      ctas
    } = body

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        images: true,
        ctas: true
      }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Handle images update
    if (images !== undefined) {
      // Delete existing images
      await prisma.eventImage.deleteMany({
        where: { eventId: id }
      })
    }

    // Handle CTAs update
    if (ctas !== undefined) {
      // Delete existing CTAs
      await prisma.eventCTA.deleteMany({
        where: { eventId: id }
      })
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        name: name ?? existingEvent.name,
        description: description ?? existingEvent.description,
        startDate: startDate ? new Date(startDate) : existingEvent.startDate,
        endDate: endDate ? new Date(endDate) : existingEvent.endDate,
        startTime: startTime ?? existingEvent.startTime,
        endTime: endTime ?? existingEvent.endTime,
        location: location ?? existingEvent.location,
        isActive: isActive ?? existingEvent.isActive,
        eventTypeId: eventTypeId ?? existingEvent.eventTypeId,
        price: price ?? existingEvent.price,
        images: images ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || '',
            caption: img.caption || '',
            sortOrder: index
          }))
        } : undefined,
        ctas: ctas ? {
          create: ctas.map((cta: any) => ({
            text: cta.text,
            url: cta.url,
            type: cta.type || 'external',
            isActive: true
          }))
        } : undefined
      },
      include: {
        eventType: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        ctas: {
          where: { isActive: true }
        }
      }
    })

    // Log the update with only changed fields
    const changes: Record<string, any> = {}
    const previousValues: Record<string, any> = {}
    
    if (name !== undefined && name !== existingEvent.name) {
      changes.name = name
      previousValues.name = existingEvent.name
    }
    if (description !== undefined && description !== existingEvent.description) {
      changes.description = description
      previousValues.description = existingEvent.description
    }
    if (startDate !== undefined && new Date(startDate).getTime() !== existingEvent.startDate.getTime()) {
      changes.startDate = startDate
      previousValues.startDate = existingEvent.startDate.toISOString()
    }
    if (endDate !== undefined && new Date(endDate).getTime() !== existingEvent.endDate.getTime()) {
      changes.endDate = endDate
      previousValues.endDate = existingEvent.endDate.toISOString()
    }
    if (startTime !== undefined && startTime !== existingEvent.startTime) {
      changes.startTime = startTime
      previousValues.startTime = existingEvent.startTime
    }
    if (endTime !== undefined && endTime !== existingEvent.endTime) {
      changes.endTime = endTime
      previousValues.endTime = existingEvent.endTime
    }
    if (location !== undefined && location !== existingEvent.location) {
      changes.location = location
      previousValues.location = existingEvent.location
    }
    if (isActive !== undefined && isActive !== existingEvent.isActive) {
      changes.isActive = isActive
      previousValues.isActive = existingEvent.isActive
    }
    if (eventTypeId !== undefined && eventTypeId !== existingEvent.eventTypeId) {
      changes.eventTypeId = eventTypeId
      previousValues.eventTypeId = existingEvent.eventTypeId
    }
    if (price !== undefined && price !== existingEvent.price) {
      changes.price = price
      previousValues.price = existingEvent.price
    }
    if (images !== undefined) {
      changes.imagesCount = images.length
      previousValues.imagesCount = existingEvent.images.length
    }
    if (ctas !== undefined) {
      changes.ctasCount = ctas.length
      previousValues.ctasCount = existingEvent.ctas.length
    }

    if (Object.keys(changes).length > 0) {
      await logAuditEvent({
        action: 'UPDATE',
        resource: 'events',
        resourceId: updatedEvent.id,
        userId: session.user.id,
        changes,
        previousValues,
        metadata: { eventName: updatedEvent.name, siteId: 'cmgfjti600004meoa7n4vy3o8' }
      })
    }

    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existingEvent = await prisma.event.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    await prisma.event.delete({
      where: { id }
    })

    // Log the deletion
    await logAuditEvent({
      action: 'DELETE',
      resource: 'events',
      resourceId: id,
      userId: session.user.id,
      changes: {},
      previousValues: {
        name: existingEvent.name,
        description: existingEvent.description,
        startDate: existingEvent.startDate.toISOString(),
        endDate: existingEvent.endDate.toISOString(),
        startTime: existingEvent.startTime,
        endTime: existingEvent.endTime,
        location: existingEvent.location,
        isActive: existingEvent.isActive
      },
      metadata: { eventName: existingEvent.name, siteId: 'cmgfjti600004meoa7n4vy3o8' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}