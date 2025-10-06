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
    const { name, description, price, category, image, isAvailable } = body

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    const item = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        image: image || null,
        isAvailable: isAvailable !== false
      }
    })

    // Log the update
    await logAuditEvent({
      action: 'UPDATE',
      resource: 'menu',
      resourceId: item.id,
      userId: session.user.id,
      changes: { name, price, category, isAvailable },
      metadata: { description, image },
      previousValues: {
        name: existingItem.name,
        price: existingItem.price,
        category: existingItem.category,
        isAvailable: existingItem.isAvailable
      }
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error updating menu item:', error)
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

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    await prisma.menuItem.delete({
      where: { id: params.id }
    })

    // Log the deletion
    await logAuditEvent({
      action: 'DELETE',
      resource: 'menu',
      resourceId: params.id,
      userId: session.user.id,
      changes: { deleted: true },
      metadata: { 
        name: existingItem.name,
        category: existingItem.category,
        price: existingItem.price
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
