import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'

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
