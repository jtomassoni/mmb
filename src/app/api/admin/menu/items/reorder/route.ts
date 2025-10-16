import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { movedItemId, movedItemName, category, oldPosition, newPosition, reorderedItems } = body

    // Get the site ID from the user's membership
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
      select: { siteId: true }
    })

    if (!membership) {
      return NextResponse.json({ error: 'No site membership found' }, { status: 400 })
    }

    const totalItemsInCategory = await prisma.menuItem.count({
      where: { 
        siteId: membership.siteId,
        category: category
      }
    })

    // Actually update the sortOrder for each item in the database
    console.log('Backend updating sortOrders:', reorderedItems.map((item: any) => ({ 
      id: item.id.substring(0, 8), 
      sortOrder: item.sortOrder 
    })))
    
    await Promise.all(
      reorderedItems.map((item: any) =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    )
    
    console.log('✓ SortOrders updated successfully')

    await logAuditEvent({
      action: 'REORDER',
      resource: 'menu',
      resourceId: movedItemId,
      userId: session.user.id,
      changes: {
        itemName: movedItemName,
        category: category,
        oldPosition,
        newPosition,
        totalItemsInCategory,
      },
      metadata: {
        siteId: membership.siteId,
        reorderedItems: reorderedItems.map((item: any) => ({ id: item.id, sortOrder: item.sortOrder }))
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging menu item reorder event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
