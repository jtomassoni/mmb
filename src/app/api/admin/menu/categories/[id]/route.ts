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
    const { name, description, sortOrder } = body

    if (!name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get existing category for audit log
    const existingCategory = await prisma.menuCategory.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const category = await prisma.menuCategory.update({
      where: { id },
      data: {
        name,
        description: description || '',
        sortOrder: sortOrder || 0
      }
    })

    // Log the update
    await logAuditEvent({
      action: 'UPDATE',
      resource: 'menu_category',
      resourceId: category.id,
      userId: session.user.id,
      changes: { 
        name, 
        description: description || '',
        sortOrder: sortOrder || 0
      },
      previousValues: {
        name: existingCategory.name,
        description: existingCategory.description,
        sortOrder: existingCategory.sortOrder
      },
      metadata: { siteId: existingCategory.siteId }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating menu category:', error)
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

    // Get existing category for audit log
    const existingCategory = await prisma.menuCategory.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category has menu items
    const itemsCount = await prisma.menuItem.count({
      where: { category: existingCategory.name }
    })

    if (itemsCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with existing menu items. Please move or delete the items first.' 
      }, { status: 400 })
    }

    await prisma.menuCategory.delete({
      where: { id }
    })

    // Log the deletion
    await logAuditEvent({
      action: 'DELETE',
      resource: 'menu_category',
      resourceId: id,
      userId: session.user.id,
      changes: null,
      previousValues: {
        name: existingCategory.name,
        description: existingCategory.description,
        sortOrder: existingCategory.sortOrder
      },
      metadata: { siteId: existingCategory.siteId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
