import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.menuItem.findMany({
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, category, image, isAvailable } = body

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate and clean price input
    const cleanPrice = String(price).replace(/[^0-9.,]/g, '') // Remove all non-numeric chars except commas and decimals
    const numericPrice = parseFloat(cleanPrice.replace(',', '')) // Remove commas and convert to number
    
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: 'Invalid price format' }, { status: 400 })
    }

    // Get the next sort order for this category
    const lastItem = await prisma.menuItem.findFirst({
      where: { category: category },
      orderBy: { createdAt: 'desc' }
    })
    const nextSortOrder = 1 // Simple default for now

    const item = await prisma.menuItem.create({
      data: {
        siteId: 'cmgfjti600004meoa7n4vy3o8', // Use actual site ID
        name,
        description: description || '',
        price: numericPrice,
        category,
        isAvailable: isAvailable !== false
      }
    })

    // Log the creation
    await logAuditEvent({
      action: 'CREATE',
      resource: 'menu',
      resourceId: item.id,
      userId: session.user.id,
      changes: { 
        name, 
        price: numericPrice, 
        category,
        description: description || '',
        isAvailable: isAvailable !== false
      },
      metadata: { image: image || null }
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
