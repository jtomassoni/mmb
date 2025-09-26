import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    // Get the menu item
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { site: true }
    })

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    // Verify user has access to this site
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        siteId: menuItem.siteId
      }
    })

    if (!membership && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
    }

    // Update the menu item
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userRole: 'STAFF',
        siteId: menuItem.siteId,
        action: 'UPDATE_MENU_ITEM',
        resource: 'MENU_ITEM',
        resourceId: id,
        metadata: JSON.stringify({
          itemId: id,
          itemName: menuItem.name,
          changes: data
        })
      }
    })

    return NextResponse.json({ success: true, item: updatedItem })

  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Get the menu item
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { site: true }
    })

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    // Verify user has access to this site
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        siteId: menuItem.siteId
      }
    })

    if (!membership && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
    }

    // Delete the menu item
    await prisma.menuItem.delete({
      where: { id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userRole: 'STAFF',
        siteId: menuItem.siteId,
        action: 'DELETE_MENU_ITEM',
        resource: 'MENU_ITEM',
        resourceId: id,
        metadata: JSON.stringify({
          itemId: id,
          itemName: menuItem.name
        })
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}
