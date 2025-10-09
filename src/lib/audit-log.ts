/**
 * Audit Logging System
 * 
 * Comprehensive audit trail for all user actions and system changes
 * with rollback capabilities and compliance reporting.
 */

import React from 'react'
import { UserRole } from './rbac'

export interface AuditLogEntry {
  id: string
  userId: string
  userRole: UserRole
  userEmail?: string
  userName?: string
  action: string
  resource: string
  resourceId?: string
  siteId?: string
  siteName?: string
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  changes?: Record<string, { old: any; new: any }>
  success: boolean
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  metadata?: Record<string, any>
  rollbackData?: Record<string, any>
  canRollback: boolean
}

export interface AuditLogQuery {
  userId?: string
  userRole?: UserRole
  action?: string
  resource?: string
  resourceId?: string
  siteId?: string
  success?: boolean
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
  orderBy?: 'timestamp' | 'action' | 'resource'
  orderDirection?: 'asc' | 'desc'
}

export interface AuditLogStats {
  totalEntries: number
  entriesByAction: Record<string, number>
  entriesByResource: Record<string, number>
  entriesByUser: Record<string, number>
  entriesBySite: Record<string, number>
  successRate: number
  errorRate: number
  recentActivity: AuditLogEntry[]
  topUsers: Array<{ userId: string; count: number }>
  topResources: Array<{ resource: string; count: number }>
}

export interface RollbackOptions {
  auditLogId: string
  userId: string
  userRole: UserRole
  reason: string
  notifyUsers?: boolean
}

/**
 * Create audit log entry
 */
export function createAuditLogEntry(
  userId: string,
  userRole: UserRole,
  action: string,
  resource: string,
  options: {
    resourceId?: string
    siteId?: string
    siteName?: string
    oldValue?: Record<string, any>
    newValue?: Record<string, any>
    success?: boolean
    errorMessage?: string
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, any>
    userEmail?: string
    userName?: string
  } = {}
): AuditLogEntry {
  const changes = calculateChanges(options.oldValue, options.newValue)
  const canRollback = determineRollbackCapability(action, resource, changes)

  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userRole,
    userEmail: options.userEmail,
    userName: options.userName,
    action,
    resource,
    resourceId: options.resourceId,
    siteId: options.siteId,
    siteName: options.siteName,
    oldValue: options.oldValue,
    newValue: options.newValue,
    changes,
    success: options.success ?? true,
    errorMessage: options.errorMessage,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    timestamp: new Date(),
    metadata: options.metadata,
    rollbackData: canRollback ? options.oldValue : undefined,
    canRollback
  }
}

/**
 * Calculate changes between old and new values
 */
function calculateChanges(
  oldValue?: Record<string, any>,
  newValue?: Record<string, any>
): Record<string, { old: any; new: any }> {
  if (!oldValue || !newValue) return {}

  const changes: Record<string, { old: any; new: any }> = {}
  const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)])

  for (const key of allKeys) {
    const oldVal = oldValue[key]
    const newVal = newValue[key]

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[key] = { old: oldVal, new: newVal }
    }
  }

  return changes
}

/**
 * Determine if an action can be rolled back
 */
function determineRollbackCapability(
  action: string,
  resource: string,
  changes: Record<string, { old: any; new: any }>
): boolean {
  // Only allow rollback for update actions on certain resources
  const rollbackableActions = ['update', 'create', 'delete']
  const rollbackableResources = ['events', 'specials', 'menu', 'hours', 'profile']

  if (!rollbackableActions.includes(action) || !rollbackableResources.includes(resource)) {
    return false
  }

  // Must have actual changes
  return Object.keys(changes).length > 0
}

/**
 * Audit log service class
 */
export class AuditLogService {
  private baseUrl: string

  constructor(baseUrl: string = '/api/audit') {
    this.baseUrl = baseUrl
  }

  /**
   * Log an audit entry
   */
  async logEntry(entry: AuditLogEntry): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(entry)
      })

      return response.ok
    } catch (error) {
      console.error('Failed to log audit entry:', error)
      return false
    }
  }

  /**
   * Query audit logs
   */
  async queryLogs(query: AuditLogQuery): Promise<{
    entries: AuditLogEntry[]
    total: number
    hasMore: boolean
  }> {
    try {
      const params = new URLSearchParams()
      
      if (query.userId) params.append('userId', query.userId)
      if (query.userRole) params.append('userRole', query.userRole)
      if (query.action) params.append('action', query.action)
      if (query.resource) params.append('resource', query.resource)
      if (query.resourceId) params.append('resourceId', query.resourceId)
      if (query.siteId) params.append('siteId', query.siteId)
      if (query.success !== undefined) params.append('success', query.success.toString())
      if (query.startDate) params.append('startDate', query.startDate.toISOString())
      if (query.endDate) params.append('endDate', query.endDate.toISOString())
      if (query.limit) params.append('limit', query.limit.toString())
      if (query.offset) params.append('offset', query.offset.toString())
      if (query.orderBy) params.append('orderBy', query.orderBy)
      if (query.orderDirection) params.append('orderDirection', query.orderDirection)

      const response = await fetch(`${this.baseUrl}/query?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        entries: data.entries,
        total: data.total,
        hasMore: data.hasMore
      }
    } catch (error) {
      console.error('Failed to query audit logs:', error)
      return { entries: [], total: 0, hasMore: false }
    }
  }

  /**
   * Get audit log statistics
   */
  async getStats(options: {
    siteId?: string
    startDate?: Date
    endDate?: Date
  } = {}): Promise<AuditLogStats> {
    try {
      const params = new URLSearchParams()
      
      if (options.siteId) params.append('siteId', options.siteId)
      if (options.startDate) params.append('startDate', options.startDate.toISOString())
      if (options.endDate) params.append('endDate', options.endDate.toISOString())

      const response = await fetch(`${this.baseUrl}/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get audit stats:', error)
      return {
        totalEntries: 0,
        entriesByAction: {},
        entriesByResource: {},
        entriesByUser: {},
        entriesBySite: {},
        successRate: 0,
        errorRate: 0,
        recentActivity: [],
        topUsers: [],
        topResources: []
      }
    }
  }

  /**
   * Rollback an action
   */
  async rollbackAction(options: RollbackOptions): Promise<{
    success: boolean
    error?: string
    rollbackEntry?: AuditLogEntry
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(options)
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.message }
      }

      const result = await response.json()
      return { success: true, rollbackEntry: result.rollbackEntry }
    } catch (error) {
      console.error('Failed to rollback action:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Export audit logs
   */
  async exportLogs(query: AuditLogQuery, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      
      if (query.userId) params.append('userId', query.userId)
      if (query.userRole) params.append('userRole', query.userRole)
      if (query.action) params.append('action', query.action)
      if (query.resource) params.append('resource', query.resource)
      if (query.resourceId) params.append('resourceId', query.resourceId)
      if (query.siteId) params.append('siteId', query.siteId)
      if (query.success !== undefined) params.append('success', query.success.toString())
      if (query.startDate) params.append('startDate', query.startDate.toISOString())
      if (query.endDate) params.append('endDate', query.endDate.toISOString())
      if (query.limit) params.append('limit', query.limit.toString())
      if (query.offset) params.append('offset', query.offset.toString())
      if (query.orderBy) params.append('orderBy', query.orderBy)
      if (query.orderDirection) params.append('orderDirection', query.orderDirection)
      
      params.append('format', format)

      const response = await fetch(`${this.baseUrl}/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.blob()
    } catch (error) {
      console.error('Failed to export audit logs:', error)
      throw error
    }
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || ''
  }
}

/**
 * Create audit log service instance
 */
export function createAuditLogService(baseUrl?: string): AuditLogService {
  return new AuditLogService(baseUrl)
}

/**
 * Audit log middleware for API routes
 */
export function createAuditMiddleware(
  action: string,
  resource: string,
  options: {
    includeRequestBody?: boolean
    includeResponseBody?: boolean
    customMetadata?: Record<string, any>
  } = {}
) {
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now()
    const originalSend = res.send

    // Capture request data
    const requestData = {
      method: req.method,
      url: req.url,
      body: options.includeRequestBody ? req.body : undefined,
      query: req.query,
      params: req.params,
      headers: {
        'user-agent': req.get('user-agent'),
        'x-forwarded-for': req.get('x-forwarded-for')
      }
    }

    // Override res.send to capture response
    res.send = function(data: any) {
      const responseData = {
        statusCode: res.statusCode,
        body: options.includeResponseBody ? data : undefined,
        duration: Date.now() - startTime
      }

      // Create audit entry
      const auditEntry = createAuditLogEntry(
        req.user?.id || 'anonymous',
        req.user?.role || 'STAFF',
        action,
        resource,
        {
          resourceId: req.params.id,
          siteId: req.user?.siteId,
          siteName: req.user?.siteName,
          oldValue: requestData.body,
          newValue: responseData.body,
          success: res.statusCode < 400,
          errorMessage: res.statusCode >= 400 ? data : undefined,
          ipAddress: req.ip || req.get('x-forwarded-for'),
          userAgent: req.get('user-agent'),
          userEmail: req.user?.email,
          userName: req.user?.name,
          metadata: {
            ...options.customMetadata,
            requestData,
            responseData
          }
        }
      )

      // Log audit entry asynchronously
      const auditService = createAuditLogService()
      auditService.logEntry(auditEntry).catch(error => {
        console.error('Failed to log audit entry:', error)
      })

      // Call original send
      originalSend.call(this, data)
    }

    next()
  }
}

/**
 * React hook for audit logging
 */
export function useAuditLog() {
  const [service] = React.useState(() => createAuditLogService())

  const logAction = React.useCallback((
    action: string,
    resource: string,
    options: {
      userId?: string
      userRole?: UserRole
      resourceId?: string
      siteId?: string
      siteName?: string
      oldValue?: Record<string, any>
      newValue?: Record<string, any>
      success?: boolean
      errorMessage?: string
      ipAddress?: string
      userAgent?: string
      metadata?: Record<string, any>
      userEmail?: string
      userName?: string
    } = {}
  ) => {
    const entry = createAuditLogEntry(
      options.userId || 'current-user',
      options.userRole || 'STAFF',
      action,
      resource,
      options
    )

    return service.logEntry(entry)
  }, [service])

  const queryLogs = React.useCallback((query: AuditLogQuery) => {
    return service.queryLogs(query)
  }, [service])

  const getStats = React.useCallback((options?: Parameters<typeof service.getStats>[0]) => {
    return service.getStats(options)
  }, [service])

  const rollbackAction = React.useCallback((options: RollbackOptions) => {
    return service.rollbackAction(options)
  }, [service])

  const exportLogs = React.useCallback((query: AuditLogQuery, format?: 'json' | 'csv') => {
    return service.exportLogs(query, format)
  }, [service])

  return {
    logAction,
    queryLogs,
    getStats,
    rollbackAction,
    exportLogs
  }
}

/**
 * Simple audit logging function for API routes
 */
export async function logAuditEvent(data: {
  action: string
  resource: string
  resourceId?: string
  userId: string
  changes?: Record<string, any>
  metadata?: Record<string, any>
  previousValues?: Record<string, any>
}) {
  try {
    const { prisma } = await import('./prisma')
    
    // Get user info for the audit log
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { role: true, email: true, name: true }
    })

    // Get site info if we have a siteId
    let siteId: string | undefined
    let siteName: string | undefined
    
    if (data.resourceId && (data.resource === 'site_settings' || data.resource === 'business_hours')) {
      siteId = data.resourceId
      const site = await prisma.site.findUnique({
        where: { id: data.resourceId },
        select: { name: true }
      })
      siteName = site?.name
    }

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        userRole: user?.role || 'STAFF',
        userEmail: user?.email,
        userName: user?.name,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        siteId: siteId,
        siteName: siteName,
        oldValue: data.previousValues ? JSON.stringify(data.previousValues) : null,
        newValue: data.changes ? JSON.stringify(data.changes) : null,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        success: true,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        canRollback: ['UPDATE', 'CREATE', 'DELETE'].includes(data.action.toUpperCase())
      }
    })
    
    console.log('Audit Event logged:', {
      timestamp: new Date().toISOString(),
      action: data.action,
      resource: data.resource,
      userId: data.userId
    })
    
    return true
  } catch (error) {
    console.error('Failed to log audit event:', error)
    return false
  }
}
