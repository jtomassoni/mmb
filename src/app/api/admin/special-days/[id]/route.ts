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
    const { id: specialDayId } = await params
    const body = await request.json()
    const { date, reason, closed, openTime, closeTime } = body

    // Find the special day
    const existingSpecialDay = await prisma.specialDay.findFirst({
      where: { 
        id: specialDayId,
        siteId: site.id
      }
    })

    if (!existingSpecialDay) {
      return NextResponse.json({ error: 'Special day not found' }, { status: 404 })
    }

    // Parse date as local date if provided
    let localDate = existingSpecialDay.date
    let dateString = existingSpecialDay.date.toISOString().split('T')[0]
    
    if (date) {
      // Extract date string (handle both "YYYY-MM-DD" and ISO formats)
      dateString = typeof date === 'string' ? date.split('T')[0] : date
      const [year, month, day] = dateString.split('-').map(Number)
      localDate = new Date(year, month - 1, day, 12, 0, 0) // Set to noon local time to avoid timezone shifts
      
      // Check if another special day exists for this date (excluding the current one)
      const allSpecialDays = await prisma.specialDay.findMany({
        where: {
          siteId: site.id,
          id: { not: specialDayId }
        }
      })
      
      // Compare dates by extracting just the date part (YYYY-MM-DD)
      const duplicateSpecialDay = allSpecialDays.find(sd => {
        const existingDateStr = sd.date.toISOString().split('T')[0]
        return existingDateStr === dateString
      })

      if (duplicateSpecialDay) {
        return NextResponse.json({ 
          error: `A special day already exists for ${dateString}. Please edit or delete it first.`,
          details: [`date: A special day already exists for ${dateString}. Please edit or delete the existing one first.`]
        }, { status: 400 })
      }
    }

    // Update the special day
    const updatedSpecialDay = await prisma.specialDay.update({
      where: { id: specialDayId },
      data: {
        date: localDate,
        reason: reason || existingSpecialDay.reason,
        closed: closed !== undefined ? closed : existingSpecialDay.closed,
        openTime: openTime || existingSpecialDay.openTime,
        closeTime: closeTime || existingSpecialDay.closeTime
      }
    })

    // Log audit event
    await logAuditEvent({
      action: 'UPDATE',
      resource: 'special_day',
      resourceId: specialDayId,
      userId: session.user.id,
      changes: {
        ...(date && date !== existingSpecialDay.date.toISOString().split('T')[0] && { date }),
        ...(reason && reason !== existingSpecialDay.reason && { reason }),
        ...(closed !== undefined && closed !== existingSpecialDay.closed && { closed }),
        ...(openTime && openTime !== existingSpecialDay.openTime && { openTime }),
        ...(closeTime && closeTime !== existingSpecialDay.closeTime && { closeTime })
      },
      previousValues: {
        date: existingSpecialDay.date.toISOString().split('T')[0],
        reason: existingSpecialDay.reason,
        closed: existingSpecialDay.closed,
        openTime: existingSpecialDay.openTime,
        closeTime: existingSpecialDay.closeTime
      },
      metadata: {
        siteId: site.id,
        siteName: site.name
      }
    })

    return NextResponse.json(updatedSpecialDay)
  } catch (error) {
    console.error('Failed to update special day:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: specialDayId } = await params

    // Find the special day
    const specialDay = await prisma.specialDay.findFirst({
      where: { 
        id: specialDayId,
        siteId: site.id // Ensure it belongs to the user's site
      }
    })

    if (!specialDay) {
      return NextResponse.json({ error: 'Special day not found' }, { status: 404 })
    }

    // Delete the special day
    await prisma.specialDay.delete({
      where: { id: specialDayId }
    })

    // Log audit event
    await logAuditEvent({
      action: 'DELETE',
      resource: 'special_day',
      resourceId: specialDayId,
      userId: session.user.id,
      previousValues: {
        date: specialDay.date.toISOString().split('T')[0],
        reason: specialDay.reason,
        closed: specialDay.closed,
        openTime: specialDay.openTime,
        closeTime: specialDay.closeTime
      },
      metadata: {
        siteId: site.id,
        siteName: site.name
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete special day:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
