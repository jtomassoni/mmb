import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { hasPermission, validateSiteAccess } from '../../../../lib/rbac'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const resource = searchParams.get('resource')
    const resourceId = searchParams.get('resourceId')
    const siteId = searchParams.get('siteId')
    const limit = parseInt(searchParams.get('limit') || '5')

    // Check permissions
    if (!hasPermission((session.user as any).role, 'audit', 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get user's site access
    let userSiteId: string | null = null
    if ((session.user as any).role !== 'SUPERADMIN') {
      const membership = await prisma.membership.findFirst({
        where: { userId: (session.user as any).id }
      })
      userSiteId = membership?.siteId || null
    }

    // Validate site access if siteId is provided
    if (siteId && !validateSiteAccess((session.user as any).role, userSiteId || '', siteId, 'read')) {
      return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
    }

    // Build where clause
    const where: any = {
      success: true,
      canRollback: true,
      action: { not: 'rollback' } // Exclude rollback actions
    }

    if (resource) where.resource = resource
    if (resourceId) where.resourceId = resourceId
    if (siteId) {
      where.siteId = siteId
    } else if ((session.user as any).role !== 'SUPERADMIN') {
      where.siteId = userSiteId
    }

    // Only get entries from the last 20 minutes
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000)
    where.timestamp = { gte: twentyMinutesAgo }

    // Get recent changes
    const recentChanges = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        timestamp: true,
        canRollback: true,
        changes: true,
        oldValue: true,
        newValue: true,
        userEmail: true,
        userName: true
      }
    })

    // Calculate time remaining for each change
    const now = new Date()
    const changesWithTimeRemaining = recentChanges.map(change => {
      const entryTime = new Date(change.timestamp)
      const timeDiffMs = now.getTime() - entryTime.getTime()
      const timeDiffMinutes = timeDiffMs / (1000 * 60)
      const timeRemaining = Math.max(0, 20 - timeDiffMinutes)

      return {
        ...change,
        timeRemaining,
        canRollback: timeRemaining > 0,
        changes: change.changes ? JSON.parse(change.changes) : {}
      }
    }).filter(change => change.canRollback)

    return NextResponse.json({
      changes: changesWithTimeRemaining,
      count: changesWithTimeRemaining.length
    })

  } catch (error) {
    console.error('Recent changes API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch recent changes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
