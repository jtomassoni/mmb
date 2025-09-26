/**
 * Domain Verification Telemetry Service
 * 
 * Tracks failures, provides actionable error messages,
 * and surfaces telemetry data for monitoring.
 */

import { prisma } from './prisma'

export interface TelemetryEvent {
  id: string
  domainId: string
  eventType: 'verification_started' | 'verification_success' | 'verification_failed' | 'verification_timeout' | 'dns_error' | 'vercel_error' | 'environment_error'
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  details?: Record<string, any>
  timestamp: Date
  resolved?: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export interface FailureSummary {
  domainId: string
  hostname: string
  totalFailures: number
  lastFailure?: Date
  failureTypes: Record<string, number>
  actionableErrors: string[]
  suggestedActions: string[]
  canRetry: boolean
  nextRetryAt?: Date
}

export interface TelemetryStats {
  totalEvents: number
  failuresByType: Record<string, number>
  failuresBySeverity: Record<string, number>
  recentFailures: TelemetryEvent[]
  domainsWithIssues: number
  averageResolutionTime?: number
}

/**
 * Creates a telemetry event
 */
export async function createTelemetryEvent(
  domainId: string,
  eventType: TelemetryEvent['eventType'],
  severity: TelemetryEvent['severity'],
  message: string,
  details?: Record<string, any>
): Promise<TelemetryEvent> {
  const event = await prisma.telemetryEvent.create({
    data: {
      domainId,
      eventType,
      severity,
      message,
      details: details ? JSON.stringify(details) : null,
      timestamp: new Date()
    }
  })

  return {
    id: event.id,
    domainId: event.domainId,
    eventType: event.eventType as TelemetryEvent['eventType'],
    severity: event.severity as TelemetryEvent['severity'],
    message: event.message,
    details: event.details ? JSON.parse(event.details) : undefined,
    timestamp: event.timestamp,
    resolved: event.resolved,
    resolvedAt: event.resolvedAt || undefined,
    resolvedBy: event.resolvedBy || undefined
  }
}

/**
 * Gets failure summary for a domain
 */
export async function getFailureSummary(domainId: string): Promise<FailureSummary | null> {
  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
    include: {
      verificationAttempts: {
        where: { status: { in: ['pending', 'failed', 'timeout'] } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!domain) {
    return null
  }

  const failureEvents = await prisma.telemetryEvent.findMany({
    where: {
      domainId,
      severity: { in: ['warning', 'error', 'critical'] },
      resolved: false
    },
    orderBy: { timestamp: 'desc' }
  })

  const failureTypes: Record<string, number> = {}
  const actionableErrors: string[] = []
  const suggestedActions: string[] = []

  failureEvents.forEach(event => {
    failureTypes[event.eventType] = (failureTypes[event.eventType] || 0) + 1
    
    const errorInfo = getActionableErrorInfo(event.eventType as any, event.message, event.details ? JSON.parse(event.details) : undefined)
    if (errorInfo.actionable) {
      actionableErrors.push(errorInfo.message)
      suggestedActions.push(...errorInfo.actions)
    }
  })

  const latestAttempt = domain.verificationAttempts[0]
  const canRetry = latestAttempt?.status === 'pending' || latestAttempt?.status === 'failed'

  return {
    domainId: domain.id,
    hostname: domain.hostname,
    totalFailures: failureEvents.length,
    lastFailure: failureEvents[0]?.timestamp,
    failureTypes,
    actionableErrors,
    suggestedActions: [...new Set(suggestedActions)], // Remove duplicates
    canRetry,
    nextRetryAt: latestAttempt?.nextRetryAt
  }
}

/**
 * Gets actionable error information
 */
export function getActionableErrorInfo(
  eventType: TelemetryEvent['eventType'],
  message: string,
  details?: Record<string, any>
): {
  actionable: boolean
  message: string
  actions: string[]
  severity: 'warning' | 'error' | 'critical'
} {
  switch (eventType) {
    case 'environment_error':
      return {
        actionable: true,
        message: 'Vercel environment configuration is missing or invalid',
        actions: [
          'Check VERCEL_TOKEN environment variable',
          'Verify VERCEL_PROJECT_ID is correct',
          'Ensure VERCEL_TEAM_ID is set if using team account',
          'Contact system administrator for environment setup'
        ],
        severity: 'critical'
      }

    case 'vercel_error':
      return {
        actionable: true,
        message: 'Vercel API error occurred during domain verification',
        actions: [
          'Check Vercel service status',
          'Verify API token permissions',
          'Retry verification after a few minutes',
          'Contact Vercel support if issue persists'
        ],
        severity: 'error'
      }

    case 'dns_error':
      return {
        actionable: true,
        message: 'DNS configuration issue detected',
        actions: [
          'Verify DNS records are correctly configured',
          'Check TXT record for domain verification',
          'Ensure DNS propagation is complete (can take up to 48 hours)',
          'Contact domain registrar if DNS changes are not taking effect'
        ],
        severity: 'warning'
      }

    case 'verification_timeout':
      return {
        actionable: true,
        message: 'Domain verification timed out after maximum attempts',
        actions: [
          'Check DNS configuration manually',
          'Verify domain is not blocked or restricted',
          'Try adding domain again with fresh verification',
          'Contact support for manual verification assistance'
        ],
        severity: 'error'
      }

    case 'verification_failed':
      return {
        actionable: true,
        message: 'Domain verification failed',
        actions: [
          'Review DNS configuration',
          'Check domain status with domain registrar',
          'Verify domain is not expired or suspended',
          'Retry verification'
        ],
        severity: 'error'
      }

    default:
      return {
        actionable: false,
        message: message,
        actions: [],
        severity: 'warning'
      }
  }
}

/**
 * Gets telemetry statistics
 */
export async function getTelemetryStats(): Promise<TelemetryStats> {
  const totalEvents = await prisma.telemetryEvent.count()
  
  const failuresByType = await prisma.telemetryEvent.groupBy({
    by: ['eventType'],
    where: {
      severity: { in: ['warning', 'error', 'critical'] }
    },
    _count: {
      eventType: true
    }
  })

  const failuresBySeverity = await prisma.telemetryEvent.groupBy({
    by: ['severity'],
    where: {
      severity: { in: ['warning', 'error', 'critical'] }
    },
    _count: {
      severity: true
    }
  })

  const recentFailures = await prisma.telemetryEvent.findMany({
    where: {
      severity: { in: ['warning', 'error', 'critical'] },
      resolved: false
    },
    orderBy: { timestamp: 'desc' },
    take: 10,
    include: {
      domain: true
    }
  })

  const domainsWithIssues = await prisma.domain.count({
    where: {
      verificationAttempts: {
        some: {
          status: { in: ['failed', 'timeout'] }
        }
      }
    }
  })

  // Calculate average resolution time for resolved events
  const resolvedEvents = await prisma.telemetryEvent.findMany({
    where: {
      resolved: true,
      resolvedAt: { not: null }
    },
    select: {
      timestamp: true,
      resolvedAt: true
    }
  })

  const averageResolutionTime = resolvedEvents.length > 0
    ? resolvedEvents.reduce((sum, event) => {
        const resolutionTime = event.resolvedAt!.getTime() - event.timestamp.getTime()
        return sum + resolutionTime
      }, 0) / resolvedEvents.length
    : undefined

  return {
    totalEvents,
    failuresByType: Object.fromEntries(
      failuresByType.map(item => [item.eventType, item._count.eventType])
    ),
    failuresBySeverity: Object.fromEntries(
      failuresBySeverity.map(item => [item.severity, item._count.severity])
    ),
    recentFailures: recentFailures.map(event => ({
      id: event.id,
      domainId: event.domainId,
      eventType: event.eventType as TelemetryEvent['eventType'],
      severity: event.severity as TelemetryEvent['severity'],
      message: event.message,
      details: event.details ? JSON.parse(event.details) : undefined,
      timestamp: event.timestamp,
      resolved: event.resolved,
      resolvedAt: event.resolvedAt || undefined,
      resolvedBy: event.resolvedBy || undefined
    })),
    domainsWithIssues,
    averageResolutionTime
  }
}

/**
 * Resolves a telemetry event
 */
export async function resolveTelemetryEvent(
  eventId: string,
  resolvedBy: string
): Promise<void> {
  await prisma.telemetryEvent.update({
    where: { id: eventId },
    data: {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy
    }
  })
}

/**
 * Resolves all events for a domain
 */
export async function resolveDomainEvents(
  domainId: string,
  resolvedBy: string
): Promise<void> {
  await prisma.telemetryEvent.updateMany({
    where: {
      domainId,
      resolved: false
    },
    data: {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy
    }
  })
}

/**
 * Gets all unresolved events for a domain
 */
export async function getDomainEvents(domainId: string): Promise<TelemetryEvent[]> {
  const events = await prisma.telemetryEvent.findMany({
    where: { domainId },
    orderBy: { timestamp: 'desc' }
  })

  return events.map(event => ({
    id: event.id,
    domainId: event.domainId,
    eventType: event.eventType as TelemetryEvent['eventType'],
    severity: event.severity as TelemetryEvent['severity'],
    message: event.message,
    details: event.details ? JSON.parse(event.details) : undefined,
    timestamp: event.timestamp,
    resolved: event.resolved,
    resolvedAt: event.resolvedAt || undefined,
    resolvedBy: event.resolvedBy || undefined
  }))
}
