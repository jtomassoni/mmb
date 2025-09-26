import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { hasPermission, UserRole } from '../../../../lib/rbac'
import { AuditLogEntry } from '../../../../lib/audit-log'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const auditEntry: AuditLogEntry = body

    // Validate required fields
    if (!auditEntry.userId || !auditEntry.action || !auditEntry.resource) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, action, resource' },
        { status: 400 }
      )
    }

    // Check permissions (only allow logging for authenticated users)
    const userRole = auditEntry.userRole || 'STAFF'
    if (!hasPermission(userRole, 'audit', 'create')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create audit log' },
        { status: 403 }
      )
    }

    // Create audit log entry in database
    const createdEntry = await prisma.auditLog.create({
      data: {
        id: auditEntry.id,
        userId: auditEntry.userId,
        userRole: auditEntry.userRole,
        userEmail: auditEntry.userEmail,
        userName: auditEntry.userName,
        action: auditEntry.action,
        resource: auditEntry.resource,
        resourceId: auditEntry.resourceId,
        siteId: auditEntry.siteId,
        siteName: auditEntry.siteName,
        oldValue: auditEntry.oldValue ? JSON.stringify(auditEntry.oldValue) : null,
        newValue: auditEntry.newValue ? JSON.stringify(auditEntry.newValue) : null,
        changes: auditEntry.changes ? JSON.stringify(auditEntry.changes) : null,
        success: auditEntry.success,
        errorMessage: auditEntry.errorMessage,
        ipAddress: auditEntry.ipAddress,
        userAgent: auditEntry.userAgent,
        timestamp: auditEntry.timestamp,
        metadata: auditEntry.metadata ? JSON.stringify(auditEntry.metadata) : null,
        rollbackData: auditEntry.rollbackData ? JSON.stringify(auditEntry.rollbackData) : null,
        canRollback: auditEntry.canRollback
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: createdEntry.id,
        timestamp: createdEntry.timestamp
      }
    })

  } catch (error) {
    console.error('Audit log creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create audit log entry' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const resourceId = searchParams.get('resourceId')
    const siteId = searchParams.get('siteId')
    const success = searchParams.get('success')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const orderBy = searchParams.get('orderBy') || 'timestamp'
    const orderDirection = searchParams.get('orderDirection') || 'desc'

    // Check permissions
    const userRoleParam = (userRole || 'STAFF') as UserRole
    if (!hasPermission(userRoleParam, 'audit', 'read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to read audit logs' },
        { status: 403 }
      )
    }

    // Build query conditions
    const where: any = {}
    
    if (userId) where.userId = userId
    if (userRole) where.userRole = userRole
    if (action) where.action = action
    if (resource) where.resource = resource
    if (resourceId) where.resourceId = resourceId
    if (siteId) where.siteId = siteId
    if (success !== null) where.success = success === 'true'
    
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = new Date(startDate)
      if (endDate) where.timestamp.lte = new Date(endDate)
    }

    // Get total count
    const total = await prisma.auditLog.count({ where })

    // Get audit log entries
    const entries = await prisma.auditLog.findMany({
      where,
      orderBy: {
        [orderBy]: orderDirection
      },
      skip: offset,
      take: limit
    })

    // Transform entries to match AuditLogEntry interface
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
      hasMore: offset + limit < total
    })

  } catch (error) {
    console.error('Audit log query error:', error)
    return NextResponse.json(
      { error: 'Failed to query audit logs' },
      { status: 500 }
    )
  }
}
