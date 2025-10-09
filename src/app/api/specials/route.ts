import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { hasPermission, validateSiteAccess } from '../../../lib/rbac'
import { createAuditLogEntry } from '../../../lib/audit-log'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Check permissions
    if (!hasPermission((session.user as any).role, 'specials', 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get user's site access
    let userSiteId: string | null = null
    if ((session.user as any).role !== 'SUPERADMIN') {
      const membership = await prisma.membership.findFirst({
        where: { userId: (session.user as any).id },
        include: { site: true }
      })
      userSiteId = membership?.siteId || null
    }

    // Build where clause
    const where: any = {}
    if (siteId) {
      // Validate site access
      if (!validateSiteAccess((session.user as any).role, userSiteId || '', siteId, 'read')) {
        return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
      }
      where.siteId = siteId
    } else if ((session.user as any).role !== 'SUPERADMIN') {
      // Non-superadmin users can only see their own site's specials
      where.siteId = userSiteId
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
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { siteId, name, description, price, isActive } = body

    // Check permissions
    if (!hasPermission((session.user as any).role, 'specials', 'create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Get or create default site
    let site
    if (siteId && siteId !== 'default') {
      site = await prisma.site.findUnique({ where: { id: siteId } })
      if (!site) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 })
      }
      
      // Get user's site access for validation
      let userSiteId: string | null = null
      if ((session.user as any).role !== 'SUPERADMIN') {
        const membership = await prisma.membership.findFirst({
          where: { userId: session.user.id }
        })
        userSiteId = membership?.siteId || null
      }

      // Validate site access
      if (!validateSiteAccess((session.user as any).role, userSiteId || '', siteId, 'create')) {
        return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
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
            email: "Monaghanv061586@gmail.com"
          }
        })
      }
    }

    // Create special
    const special = await prisma.special.create({
      data: {
        siteId: site.id,
        name,
        description,
        price,
        originalPrice: null,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: isActive !== false, // Default to true
        image: null
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

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userRole: (session.user as any).role,
        userEmail: (session.user as any).email || null,
        userName: (session.user as any).name || null,
        action: 'create',
        resource: 'specials',
        resourceId: special.id,
        siteId: site.id,
        siteName: site.name,
        newValue: JSON.stringify({
          name: special.name,
          description: special.description,
          price: special.price,
          isActive: special.isActive
        }),
        success: true,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null
      } as any
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
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, name, description, price, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Special ID is required' }, { status: 400 })
    }

    // Check permissions
    if (!hasPermission((session.user as any).role, 'specials', 'update')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get existing special to check access and capture old values
    const existingSpecial = await prisma.special.findUnique({
      where: { id },
      include: { site: true }
    })

    if (!existingSpecial) {
      return NextResponse.json({ error: 'Special not found' }, { status: 404 })
    }

    // Get user's site access for validation
    let userSiteId: string | null = null
    if ((session.user as any).role !== 'SUPERADMIN') {
      const membership = await prisma.membership.findFirst({
        where: { userId: session.user.id }
      })
      userSiteId = membership?.siteId || null
    }

    // Validate site access
    if (!validateSiteAccess((session.user as any).role, userSiteId || '', existingSpecial.siteId, 'update')) {
      return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
    }

    // Update special
    const special = await prisma.special.update({
      where: { id },
      data: {
        name,
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

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userRole: (session.user as any).role,
        userEmail: (session.user as any).email || null,
        userName: (session.user as any).name || null,
        action: 'update',
        resource: 'specials',
        resourceId: special.id,
        siteId: existingSpecial.siteId,
        siteName: existingSpecial.site.name,
        oldValue: JSON.stringify({
          name: existingSpecial.name,
          description: existingSpecial.description,
          price: existingSpecial.price,
          isActive: existingSpecial.isActive
        }),
        newValue: JSON.stringify({
          name: special.name,
          description: special.description,
          price: special.price,
          isActive: special.isActive
        }),
        success: true,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null
      } as any
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
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Special ID is required' }, { status: 400 })
    }

    // Check permissions
    if (!hasPermission((session.user as any).role, 'specials', 'delete')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get existing special to check access and capture old values
    const existingSpecial = await prisma.special.findUnique({
      where: { id },
      include: { site: true }
    })

    if (!existingSpecial) {
      return NextResponse.json({ error: 'Special not found' }, { status: 404 })
    }

    // Get user's site access for validation
    let userSiteId: string | null = null
    if ((session.user as any).role !== 'SUPERADMIN') {
      const membership = await prisma.membership.findFirst({
        where: { userId: session.user.id }
      })
      userSiteId = membership?.siteId || null
    }

    // Validate site access
    if (!validateSiteAccess((session.user as any).role, userSiteId || '', existingSpecial.siteId, 'delete')) {
      return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
    }

    await prisma.special.delete({
      where: { id }
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userRole: (session.user as any).role,
        userEmail: (session.user as any).email || null,
        userName: (session.user as any).name || null,
        action: 'delete',
        resource: 'specials',
        resourceId: id,
        siteId: existingSpecial.siteId,
        siteName: existingSpecial.site.name,
        oldValue: JSON.stringify({
          name: existingSpecial.name,
          description: existingSpecial.description,
          price: existingSpecial.price,
          isActive: existingSpecial.isActive
        }),
        success: true,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null
      } as any
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
