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

    // Get recent audit logs with user and site information
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        success: true // Only show successful actions
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        site: {
          select: {
            id: true,
            name: true,
            timezone: true
          }
        }
      },
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
        id: log.user.id,
        name: log.user.name || log.userEmail,
        email: log.user.email,
        role: log.user.role
      },
      site: log.site ? {
        id: log.site.id,
        name: log.site.name,
        timezone: log.site.timezone
      } : null,
      changes: log.changes ? JSON.parse(log.changes) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
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
