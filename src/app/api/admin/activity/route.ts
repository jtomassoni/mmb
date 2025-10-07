import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, RESOURCES, ACTIONS } from '@/lib/rbac'

// Get recent activity with user information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to read audit logs
    if (!hasPermission(session.user.role as any, RESOURCES.AUDIT, ACTIONS.READ)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const filter = searchParams.get('filter') || 'all'

    // Define resource filters
    const resourceFilters = {
      company: ['site_settings', 'business_hours', 'special_day'],
      menu: ['menu', 'menu_category'],
      specials: ['specials', 'events'],
      all: [] // Empty array means no filter
    }

    // Build where clause based on filter
    let whereClause: any = {
      success: true // Only show successful actions
    }

    if (filter !== 'all' && resourceFilters[filter as keyof typeof resourceFilters]) {
      whereClause.resource = {
        in: resourceFilters[filter as keyof typeof resourceFilters]
      }
    }

    // Get recent audit logs with user and site information
    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Format the response with proper timezone handling
    const formattedLogs = auditLogs.map(log => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      timestamp: log.timestamp,
      user: {
        id: log.userId,
        name: log.userName || log.userEmail,
        email: log.userEmail,
        role: log.userRole
      },
      site: log.siteId ? {
        id: log.siteId,
        name: log.siteName,
        timezone: 'America/Denver' // Default timezone for now
      } : null,
      changes: log.changes ? JSON.parse(log.changes) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
      newValue: log.newValue ? JSON.parse(log.newValue) : null
    }))

    return NextResponse.json({ 
      logs: formattedLogs,
      total: auditLogs.length,
      hasMore: auditLogs.length === limit
    })
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
