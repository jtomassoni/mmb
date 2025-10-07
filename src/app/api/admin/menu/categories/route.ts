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

    const categories = await prisma.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching menu categories:', error)
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
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the Monaghan's site
    const site = await prisma.site.findFirst({
      where: { slug: 'monaghans-bargrill' }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Get the next sort order
    const lastCategory = await prisma.menuCategory.findFirst({
      where: { siteId: site.id },
      orderBy: { sortOrder: 'desc' }
    })
    const nextSortOrder = (lastCategory?.sortOrder || 0) + 1

    const category = await prisma.menuCategory.create({
      data: {
        name,
        description: description || '',
        sortOrder: nextSortOrder,
        siteId: site.id
      }
    })

    // Log the creation
    await logAuditEvent({
      action: 'CREATE',
      resource: 'menu_category',
      resourceId: category.id,
      userId: session.user.id,
      changes: { 
        name, 
        sortOrder: nextSortOrder,
        description: description || ''
      },
      metadata: { siteId: site.id }
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating menu category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
