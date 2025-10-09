import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, color, icon, isActive } = body

    const eventType = await prisma.eventType.update({
      where: { id },
      data: {
        name,
        description,
        color,
        icon,
        isActive
      }
    })

    // Log the audit event
    await logAuditEvent({
      userId: session.user.id,
      action: 'update',
      resource: 'event_types',
      resourceId: eventType.id,
      changes: { name, description, color, icon, isActive }
    })

    return NextResponse.json({ success: true, eventType })
  } catch (error) {
    console.error('Error updating event type:', error)
    return NextResponse.json({ error: 'Failed to update event type' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Soft delete by setting isActive to false
    const eventType = await prisma.eventType.update({
      where: { id },
      data: { isActive: false }
    })

    // Log the audit event
    await logAuditEvent({
      userId: session.user.id,
      action: 'delete',
      resource: 'event_types',
      resourceId: eventType.id,
      changes: { name: eventType.name }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event type:', error)
    return NextResponse.json({ error: 'Failed to delete event type' }, { status: 500 })
  }
}
