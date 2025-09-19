import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Build where clause
    const where: any = {}
    if (siteId) {
      where.siteId = siteId
    }
    if (!includeInactive) {
      where.isActive = true
    }

    // Get specials from database
    const specials = await prisma.special.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        site: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      specials,
      count: specials.length
    })
  } catch (error) {
    console.error('Specials API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch specials',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { siteId, title, description, price, isActive } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Get or create default site
    let site
    if (siteId && siteId !== 'default') {
      site = await prisma.site.findUnique({ where: { id: siteId } })
      if (!site) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 })
      }
    } else {
      // Use first site or create default
      site = await prisma.site.findFirst()
      if (!site) {
        site = await prisma.site.create({
          data: {
            name: "Monaghan's Bar & Grill",
            slug: "monaghans-bar-grill",
            description: "Where Denver comes to eat, drink, and play",
            address: "1234 Main Street, Denver, CO 80202",
            phone: "(303) 555-0123",
            email: "info@monaghansbargrill.com"
          }
        })
      }
    }

    // Create special
    const special = await prisma.special.create({
      data: {
        siteId: site.id,
        title,
        description,
        price,
        isActive: isActive !== false // Default to true
      },
      include: {
        site: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      special
    }, { status: 201 })
  } catch (error) {
    console.error('Create special error:', error)
    return NextResponse.json({ 
      error: 'Failed to create special',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, price, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Special ID is required' }, { status: 400 })
    }

    // Update special
    const special = await prisma.special.update({
      where: { id },
      data: {
        title,
        description,
        price,
        isActive
      },
      include: {
        site: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      special
    })
  } catch (error) {
    console.error('Update special error:', error)
    return NextResponse.json({ 
      error: 'Failed to update special',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Special ID is required' }, { status: 400 })
    }

    await prisma.special.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete special error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete special',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
