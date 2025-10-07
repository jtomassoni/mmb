import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit-log'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      movedCategoryId, 
      movedCategoryName, 
      oldPosition, 
      newPosition, 
      reorderedCategories 
    } = body

    if (!movedCategoryId || !movedCategoryName || oldPosition === undefined || newPosition === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Log the reordering action
    await logAuditEvent({
      action: 'REORDER',
      resource: 'menu_category',
      resourceId: movedCategoryId,
      userId: session.user.id,
      changes: {
        categoryName: movedCategoryName,
        oldPosition,
        newPosition,
        totalCategories: reorderedCategories.length
      },
      previousValues: {
        position: oldPosition
      },
      metadata: {
        action: 'reorder',
        movedCategory: movedCategoryName,
        fromPosition: oldPosition,
        toPosition: newPosition,
        allCategories: reorderedCategories.map((cat: any) => ({
          id: cat.id,
          sortOrder: cat.sortOrder
        }))
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging category reorder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
