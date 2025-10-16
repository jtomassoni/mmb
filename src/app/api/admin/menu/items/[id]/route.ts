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
    const { name, description, price, category, image, isAvailable, sortOrder } = body

    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    // Validate and clean price input if provided
    let numericPrice = existingItem.price
    if (price !== undefined) {
      const cleanPrice = String(price).replace(/[^0-9.,]/g, '')
      numericPrice = parseFloat(cleanPrice.replace(',', ''))
      
      if (isNaN(numericPrice) || numericPrice < 0) {
        return NextResponse.json({ error: 'Invalid price format' }, { status: 400 })
      }
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: name ?? existingItem.name,
        description: description ?? existingItem.description,
        price: numericPrice,
        category: category ?? existingItem.category,
        image: image !== undefined ? (image || null) : existingItem.image,
        isAvailable: isAvailable ?? existingItem.isAvailable,
      }
    })

    // Log the update with only changed fields
    const changes: Record<string, any> = {}
    const previousValues: Record<string, any> = {}
    
    if (name !== undefined && name !== existingItem.name) {
      changes.name = name
      previousValues.name = existingItem.name
    }
    if (description !== undefined && description !== existingItem.description) {
      changes.description = description
      previousValues.description = existingItem.description
    }
    if (price !== undefined && numericPrice !== existingItem.price) {
      changes.price = numericPrice
      previousValues.price = existingItem.price
    }
    if (category !== undefined && category !== existingItem.category) {
      changes.category = category
      previousValues.category = existingItem.category
    }
    if (isAvailable !== undefined && isAvailable !== existingItem.isAvailable) {
      changes.isAvailable = isAvailable
      previousValues.isAvailable = existingItem.isAvailable
    }
    if (image !== undefined && image !== existingItem.image) {
      changes.image = image
      previousValues.image = existingItem.image
    }

    if (Object.keys(changes).length > 0) {
      await logAuditEvent({
        action: 'UPDATE',
        resource: 'menu',
        resourceId: updatedItem.id,
        userId: session.user.id,
        changes,
        previousValues,
        metadata: { itemName: updatedItem.name, category: updatedItem.category }
      })
    }

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error('Error updating menu item:', error)
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

    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    await prisma.menuItem.delete({
      where: { id }
    })

    // Log the deletion
    await logAuditEvent({
      action: 'DELETE',
      resource: 'menu',
      resourceId: id,
      userId: session.user.id,
      changes: {},
      previousValues: {
        name: existingItem.name,
        description: existingItem.description,
        price: existingItem.price,
        category: existingItem.category,
        isAvailable: existingItem.isAvailable
      },
      metadata: { itemName: existingItem.name, category: existingItem.category }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}