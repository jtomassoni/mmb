import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'
import { validateText, validateTime } from '@/lib/input-validation'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's site
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { memberships: { include: { site: true } } }
    })

    if (!user?.memberships?.[0]?.site) {
      return NextResponse.json({ error: 'No site found' }, { status: 404 })
    }

    const site = user.memberships[0].site

    // Fetch special days for this site
    const specialDays = await prisma.specialDay.findMany({
      where: { siteId: site.id },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ specialDays })
  } catch (error) {
    console.error('Failed to fetch special days:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's site
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { memberships: { include: { site: true } } }
    })

    if (!user?.memberships?.[0]?.site) {
      return NextResponse.json({ error: 'No site found' }, { status: 404 })
    }

    const site = user.memberships[0].site
    const body = await request.json()
    const { date, reason, closed, openTime, closeTime } = body

    // Validate inputs
    const reasonValidation = validateText(reason || '', { 
      minLength: 3,
      maxLength: 200, 
      allowEmojis: false 
    })

    const validationErrors: string[] = []
    if (!reasonValidation.isValid) validationErrors.push(`Reason: ${reasonValidation.errors.join(', ')}`)
    
    // Validate times if not closed
    if (!closed) {
      if (openTime) {
        const openValidation = validateTime(openTime)
        if (!openValidation.isValid) {
          validationErrors.push(`Open time: ${openValidation.errors.join(', ')}`)
        }
      }
      if (closeTime) {
        const closeValidation = validateTime(closeTime)
        if (!closeValidation.isValid) {
          validationErrors.push(`Close time: ${closeValidation.errors.join(', ')}`)
        }
      }
    }

    // Validate date
    if (!date) {
      validationErrors.push('Date is required')
    } else {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        validationErrors.push('Invalid date format')
      } else if (dateObj < new Date()) {
        validationErrors.push('Date cannot be in the past')
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }

    // Check if special day already exists for this date
    const existingSpecialDay = await prisma.specialDay.findFirst({
      where: { 
        siteId: site.id,
        date: new Date(date)
      }
    })

    if (existingSpecialDay) {
      return NextResponse.json({ 
        error: 'A special day already exists for this date' 
      }, { status: 400 })
    }

    // Create special day
    const specialDay = await prisma.specialDay.create({
      data: {
        siteId: site.id,
        date: new Date(date),
        reason: reasonValidation.sanitizedValue,
        closed: closed,
        openTime: !closed ? openTime : null,
        closeTime: !closed ? closeTime : null
      }
    })

    // Log audit event
    await logAuditEvent({
      action: 'CREATE',
      resource: 'special_day',
      resourceId: specialDay.id,
      userId: session.user.id,
      changes: {
        date: date,
        reason: reasonValidation.sanitizedValue,
        closed: closed,
        openTime: openTime,
        closeTime: closeTime
      },
      metadata: {
        siteId: site.id,
        siteName: site.name
      }
    })

    return NextResponse.json({ specialDay })
  } catch (error) {
    console.error('Failed to create special day:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
