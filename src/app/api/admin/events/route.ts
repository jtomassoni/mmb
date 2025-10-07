import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      where: { siteId: 'cmgfjti600004meoa7n4vy3o8' },
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

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    if (!name || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        siteId: 'cmgfjti600004meoa7n4vy3o8',
        name,
        description: description || '',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || 'Main Dining Room',
        isActive: isActive !== false,
        eventTypeId: eventTypeId || null,
        price: price || null,
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

    // Log the creation
    await logAuditEvent({
      action: 'CREATE',
      resource: 'events',
      resourceId: event.id,
      userId: session.user.id,
      changes: { 
        name, 
        description: description || '',
        startDate,
        endDate: endDate || startDate,
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || 'Main Dining Room',
        isActive: isActive !== false,
        eventTypeId,
        price,
        imagesCount: images?.length || 0,
        ctasCount: ctas?.length || 0
      },
      metadata: { siteId: 'cmgfjti600004meoa7n4vy3o8' }
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}