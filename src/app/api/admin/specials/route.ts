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

    const specials = await prisma.special.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ specials })
  } catch (error) {
    console.error('Error fetching specials:', error)
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
    const { name, description, price, originalPrice, startDate, endDate, isActive, image } = body

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const special = await prisma.special.create({
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

    // Log the creation
    await logAuditEvent({
      action: 'CREATE',
      resource: 'specials',
      resourceId: special.id,
      userId: session.user.id,
      changes: { name, startDate, endDate, price },
      metadata: { description, originalPrice, isActive, image }
    })

    return NextResponse.json({ special }, { status: 201 })
  } catch (error) {
    console.error('Error creating special:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
