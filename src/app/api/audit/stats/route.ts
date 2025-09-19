import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { hasPermission } from '../../../../lib/rbac'
import { AuditLogStats } from '../../../../lib/audit-log'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

    // Check permissions
    if (!hasPermission('OWNER', 'audit', 'read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view audit statistics' },
        { status: 403 }
      )
    }

    // Build where clause
    const where: any = {}
    if (siteId) where.siteId = siteId
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = startDate
      if (endDate) where.timestamp.lte = endDate
    }

    // Get total entries
    const totalEntries = await prisma.auditLog.count({ where })

    // Get entries by action
    const entriesByAction = await prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: {
        action: true
      }
    })

    // Get entries by resource
    const entriesByResource = await prisma.auditLog.groupBy({
      by: ['resource'],
      where,
      _count: {
        resource: true
      }
    })

    // Get entries by user
    const entriesByUser = await prisma.auditLog.groupBy({
      by: ['userId'],
      where,
      _count: {
        userId: true
      },
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: 10
    })

    // Get entries by site
    const entriesBySite = await prisma.auditLog.groupBy({
      by: ['siteId'],
      where,
      _count: {
        siteId: true
      }
    })

    // Get success/error rates
    const successCount = await prisma.auditLog.count({
      where: { ...where, success: true }
    })

    const errorCount = await prisma.auditLog.count({
      where: { ...where, success: false }
    })

    const successRate = totalEntries > 0 ? (successCount / totalEntries) * 100 : 0
    const errorRate = totalEntries > 0 ? (errorCount / totalEntries) * 100 : 0

    // Get recent activity (last 10 entries)
    const recentActivity = await prisma.auditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    })

    // Transform recent activity
    const transformedRecentActivity = recentActivity.map(entry => ({
      id: entry.id,
      userId: entry.userId,
      userRole: entry.userRole,
      userEmail: entry.userEmail,
      userName: entry.userName,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      siteId: entry.siteId,
      siteName: entry.siteName,
      oldValue: entry.oldValue ? JSON.parse(entry.oldValue) : undefined,
      newValue: entry.newValue ? JSON.parse(entry.newValue) : undefined,
      changes: entry.changes ? JSON.parse(entry.changes) : undefined,
      success: entry.success,
      errorMessage: entry.errorMessage,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      timestamp: entry.timestamp,
      metadata: entry.metadata ? JSON.parse(entry.metadata) : undefined,
      rollbackData: entry.rollbackData ? JSON.parse(entry.rollbackData) : undefined,
      canRollback: entry.canRollback
    }))

    // Transform group by results
    const transformedEntriesByAction: Record<string, number> = {}
    entriesByAction.forEach(item => {
      transformedEntriesByAction[item.action] = item._count.action
    })

    const transformedEntriesByResource: Record<string, number> = {}
    entriesByResource.forEach(item => {
      transformedEntriesByResource[item.resource] = item._count.resource
    })

    const transformedEntriesByUser: Record<string, number> = {}
    entriesByUser.forEach(item => {
      transformedEntriesByUser[item.userId] = item._count.userId
    })

    const transformedEntriesBySite: Record<string, number> = {}
    entriesBySite.forEach(item => {
      transformedEntriesBySite[item.siteId || 'unknown'] = item._count.siteId
    })

    // Get top users
    const topUsers = entriesByUser.map(item => ({
      userId: item.userId,
      count: item._count.userId
    }))

    // Get top resources
    const topResources = entriesByResource.map(item => ({
      resource: item.resource,
      count: item._count.resource
    }))

    const stats: AuditLogStats = {
      totalEntries,
      entriesByAction: transformedEntriesByAction,
      entriesByResource: transformedEntriesByResource,
      entriesByUser: transformedEntriesByUser,
      entriesBySite: transformedEntriesBySite,
      successRate,
      errorRate,
      recentActivity: transformedRecentActivity,
      topUsers,
      topResources
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Audit stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get audit statistics' },
      { status: 500 }
    )
  }
}
