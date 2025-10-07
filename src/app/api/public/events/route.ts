import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let whereClause: any = {
      siteId: 'cmgfjti600004meoa7n4vy3o8',
      isActive: true
    }

    // If date range is provided, filter events
    if (startDate && endDate) {
      whereClause.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { startDate: 'asc' }
    })

    // Format events for public consumption
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.name,
      description: event.description,
      date: event.startDate.toISOString().split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.name.toLowerCase().includes('broncos') ? 'broncos' : 
            event.name.toLowerCase().includes('poker') ? 'entertainment' :
            event.name.toLowerCase().includes('taco') ? 'food' :
            event.name.toLowerCase().includes('whiskey') || event.name.toLowerCase().includes('thirsty') ? 'drink' :
            'special',
      isRecurring: false, // For now, we'll handle recurring events differently
      price: null,
      isActive: event.isActive,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }))

    return NextResponse.json({ 
      success: true,
      events: formattedEvents 
    })
  } catch (error) {
    console.error('Error fetching public events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}