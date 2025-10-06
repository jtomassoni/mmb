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
    const { name, description, price, originalPrice, startDate, endDate, isActive, image } = body

    const existingSpecial = await prisma.special.findUnique({
      where: { id: params.id }
    })

    if (!existingSpecial) {
      return NextResponse.json({ error: 'Special not found' }, { status: 404 })
    }

    const special = await prisma.special.update({
      where: { id: params.id },
      data: {
        name,
        description: description || '',
        price: price ? parseFloat(price) : null,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== false,
        image: image || null
      }
    })

    // Log the update
    await logAuditEvent({
      action: 'UPDATE',
      resource: 'specials',
      resourceId: special.id,
      userId: session.user.id,
      changes: { name, startDate, endDate, isActive },
      metadata: { description, price, originalPrice, image },
      previousValues: {
        name: existingSpecial.name,
        startDate: existingSpecial.startDate,
        endDate: existingSpecial.endDate,
        isActive: existingSpecial.isActive
      }
    })

    return NextResponse.json({ special })
  } catch (error) {
    console.error('Error updating special:', error)
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

    const existingSpecial = await prisma.special.findUnique({
      where: { id: params.id }
    })

    if (!existingSpecial) {
      return NextResponse.json({ error: 'Special not found' }, { status: 404 })
    }

    await prisma.special.delete({
      where: { id: params.id }
    })

    // Log the deletion
    await logAuditEvent({
      action: 'DELETE',
      resource: 'specials',
      resourceId: params.id,
      userId: session.user.id,
      changes: { deleted: true },
      metadata: { 
        name: existingSpecial.name,
        startDate: existingSpecial.startDate,
        endDate: existingSpecial.endDate
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting special:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
