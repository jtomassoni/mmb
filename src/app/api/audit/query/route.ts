import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { hasPermission } from '../../../../lib/rbac'
import { AuditLogQuery } from '../../../../lib/audit-log'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const query: AuditLogQuery = {
      userId: searchParams.get('userId') || undefined,
      userRole: searchParams.get('userRole') as any || undefined,
      action: searchParams.get('action') || undefined,
      resource: searchParams.get('resource') || undefined,
      resourceId: searchParams.get('resourceId') || undefined,
      siteId: searchParams.get('siteId') || undefined,
      success: searchParams.get('success') === 'true' ? true : searchParams.get('success') === 'false' ? false : undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      orderBy: (searchParams.get('orderBy') as any) || 'timestamp',
      orderDirection: (searchParams.get('orderDirection') as any) || 'desc'
    }

    // Check permissions
    const userRole = query.userRole || 'STAFF'
    if (!hasPermission(userRole, 'audit', 'read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to query audit logs' },
        { status: 403 }
      )
    }

    // Build where clause
    const where: any = {}
    
    if (query.userId) where.userId = query.userId
    if (query.userRole) where.userRole = query.userRole
    if (query.action) where.action = query.action
    if (query.resource) where.resource = query.resource
    if (query.resourceId) where.resourceId = query.resourceId
    if (query.siteId) where.siteId = query.siteId
    if (query.success !== undefined) where.success = query.success
    
    if (query.startDate || query.endDate) {
      where.timestamp = {}
      if (query.startDate) where.timestamp.gte = query.startDate
      if (query.endDate) where.timestamp.lte = query.endDate
    }

    // Get total count
    const total = await prisma.auditLog.count({ where })

    // Get audit log entries
    const entries = await prisma.auditLog.findMany({
      where,
      orderBy: {
        [query.orderBy]: query.orderDirection
      },
      skip: query.offset,
      take: query.limit
    })

    // Transform entries
    const transformedEntries = entries.map(entry => ({
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

    return NextResponse.json({
      entries: transformedEntries,
      total,
      hasMore: query.offset + query.limit < total,
      query
    })

  } catch (error) {
    console.error('Audit log query error:', error)
    return NextResponse.json(
      { error: 'Failed to query audit logs' },
      { status: 500 }
    )
  }
}
