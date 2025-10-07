import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'
import { validateTime } from '@/lib/input-validation'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the Monaghan's site
    const site = await prisma.site.findFirst({
      where: { slug: 'monaghans-bargrill' }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Get business hours
    const hours = await prisma.hours.findMany({
      where: { siteId: site.id },
      orderBy: { dayOfWeek: 'asc' }
    })

    // Convert to the format expected by the frontend
    const businessHours = {
      monday: { open: '11:00', close: '22:00', closed: false },
      tuesday: { open: '11:00', close: '22:00', closed: false },
      wednesday: { open: '11:00', close: '22:00', closed: false },
      thursday: { open: '11:00', close: '22:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    }

    // Update with actual data from database
    hours.forEach(hour => {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const dayName = dayNames[hour.dayOfWeek] as keyof typeof businessHours
      
      if (businessHours[dayName]) {
        businessHours[dayName] = {
          open: hour.openTime || '11:00',
          close: hour.closeTime || '22:00',
          closed: hour.isClosed
        }
      }
    })

    return NextResponse.json(businessHours)
  } catch (error) {
    console.error('Error fetching business hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = body

    // Validate all time inputs
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const hoursData = { sunday, monday, tuesday, wednesday, thursday, friday, saturday }
    const validationErrors: string[] = []

    // Validate each day's hours
    Object.entries(hoursData).forEach(([dayName, dayHours]) => {
      if (!dayHours.closed) {
        if (dayHours.open) {
          const openValidation = validateTime(dayHours.open)
          if (!openValidation.isValid) {
            validationErrors.push(`${dayName} open time: ${openValidation.errors.join(', ')}`)
          }
        }
        if (dayHours.close) {
          const closeValidation = validateTime(dayHours.close)
          if (!closeValidation.isValid) {
            validationErrors.push(`${dayName} close time: ${closeValidation.errors.join(', ')}`)
          }
        }
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }

    // Get the Monaghan's site
    const site = await prisma.site.findFirst({
      where: { slug: 'monaghans-bargrill' }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Get existing hours BEFORE updating (for audit log)
    const existingHours = await prisma.hours.findMany({
      where: { siteId: site.id },
      orderBy: { dayOfWeek: 'asc' }
    })

    // Convert existing hours to the same format
    const existingHoursData = {
      monday: { open: '11:00', close: '22:00', closed: false },
      tuesday: { open: '11:00', close: '22:00', closed: false },
      wednesday: { open: '11:00', close: '22:00', closed: false },
      thursday: { open: '11:00', close: '22:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    }

    // Update with actual existing data
    existingHours.forEach(hour => {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const dayName = dayNames[hour.dayOfWeek] as keyof typeof existingHoursData
      
      if (existingHoursData[dayName]) {
        existingHoursData[dayName] = {
          open: hour.openTime || '11:00',
          close: hour.closeTime || '22:00',
          closed: hour.isClosed
        }
      }
    })

    // Update each day's hours
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dayName = dayNames[dayOfWeek] as keyof typeof hoursData
      const dayHours = hoursData[dayName]

      await prisma.hours.upsert({
        where: { siteId_dayOfWeek: { siteId: site.id, dayOfWeek } },
        update: {
          openTime: dayHours.closed ? null : dayHours.open,
          closeTime: dayHours.closed ? null : dayHours.close,
          isClosed: dayHours.closed
        },
        create: {
          siteId: site.id,
          dayOfWeek,
          openTime: dayHours.closed ? null : dayHours.open,
          closeTime: dayHours.closed ? null : dayHours.close,
          isClosed: dayHours.closed
        }
      })
    }

    // Log the audit event with before/after values
    await logAuditEvent({
      action: 'UPDATE',
      resource: 'business_hours',
      resourceId: site.id,
      userId: session.user.id,
      changes: { businessHours: hoursData },
      previousValues: { businessHours: existingHoursData },
      metadata: { updatedDays: Object.keys(hoursData) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating business hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
