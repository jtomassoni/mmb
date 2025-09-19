import {
  createTelemetryEvent,
  getFailureSummary,
  getActionableErrorInfo,
  getTelemetryStats,
  resolveTelemetryEvent,
  resolveDomainEvents,
  getDomainEvents
} from '../../src/lib/domain-telemetry'
import { prisma } from '../../src/lib/prisma'

describe('Domain Telemetry', () => {
  let testDomain: any
  let testSite: any

  beforeEach(async () => {
    // Create test site
    testSite = await prisma.site.create({
      data: {
        name: 'Test Site',
        slug: 'test-site',
        description: 'Test site for telemetry'
      }
    })

    // Create test domain
    testDomain = await prisma.domain.create({
      data: {
        siteId: testSite.id,
        hostname: 'test.example.com',
        status: 'PENDING',
        provider: 'VERCEL'
      }
    })
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.telemetryEvent.deleteMany({
      where: { domainId: testDomain.id }
    })
    await prisma.verificationAttempt.deleteMany({
      where: { domainId: testDomain.id }
    })
    await prisma.domain.deleteMany({
      where: { siteId: testSite.id }
    })
    await prisma.site.deleteMany({
      where: { id: testSite.id }
    })
  })

  describe('createTelemetryEvent', () => {
    it('should create a telemetry event', async () => {
      const event = await createTelemetryEvent(
        testDomain.id,
        'verification_started',
        'info',
        'Domain verification started',
        { attemptId: 'test-attempt' }
      )

      expect(event).toBeDefined()
      expect(event.domainId).toBe(testDomain.id)
      expect(event.eventType).toBe('verification_started')
      expect(event.severity).toBe('info')
      expect(event.message).toBe('Domain verification started')
      expect(event.details).toEqual({ attemptId: 'test-attempt' })
      expect(event.resolved).toBe(false)
    })

    it('should create event without details', async () => {
      const event = await createTelemetryEvent(
        testDomain.id,
        'verification_success',
        'info',
        'Verification completed'
      )

      expect(event.details).toBeUndefined()
    })
  })

  describe('getActionableErrorInfo', () => {
    it('should provide actionable info for environment errors', () => {
      const info = getActionableErrorInfo('environment_error', 'Missing VERCEL_TOKEN')

      expect(info.actionable).toBe(true)
      expect(info.severity).toBe('critical')
      expect(info.actions).toContain('Check VERCEL_TOKEN environment variable')
      expect(info.actions).toContain('Contact system administrator for environment setup')
    })

    it('should provide actionable info for Vercel errors', () => {
      const info = getActionableErrorInfo('vercel_error', 'API rate limit exceeded')

      expect(info.actionable).toBe(true)
      expect(info.severity).toBe('error')
      expect(info.actions).toContain('Check Vercel service status')
      expect(info.actions).toContain('Retry verification after a few minutes')
    })

    it('should provide actionable info for DNS errors', () => {
      const info = getActionableErrorInfo('dns_error', 'TXT record not found')

      expect(info.actionable).toBe(true)
      expect(info.severity).toBe('warning')
      expect(info.actions).toContain('Verify DNS records are correctly configured')
      expect(info.actions).toContain('Check TXT record for domain verification')
    })

    it('should provide actionable info for verification timeout', () => {
      const info = getActionableErrorInfo('verification_timeout', 'Max attempts reached')

      expect(info.actionable).toBe(true)
      expect(info.severity).toBe('error')
      expect(info.actions).toContain('Check DNS configuration manually')
      expect(info.actions).toContain('Try adding domain again with fresh verification')
    })

    it('should provide actionable info for verification failure', () => {
      const info = getActionableErrorInfo('verification_failed', 'Domain not verified')

      expect(info.actionable).toBe(true)
      expect(info.severity).toBe('error')
      expect(info.actions).toContain('Review DNS configuration')
      expect(info.actions).toContain('Retry verification')
    })

    it('should not provide actionable info for unknown event types', () => {
      const info = getActionableErrorInfo('unknown_event' as any, 'Some message')

      expect(info.actionable).toBe(false)
      expect(info.actions).toHaveLength(0)
    })
  })

  describe('getFailureSummary', () => {
    it('should return null for non-existent domain', async () => {
      const summary = await getFailureSummary('non-existent-id')
      expect(summary).toBeNull()
    })

    it('should return summary with no failures for domain with no events', async () => {
      const summary = await getFailureSummary(testDomain.id)

      expect(summary).toBeDefined()
      expect(summary!.domainId).toBe(testDomain.id)
      expect(summary!.hostname).toBe('test.example.com')
      expect(summary!.totalFailures).toBe(0)
      expect(summary!.actionableErrors).toHaveLength(0)
      expect(summary!.suggestedActions).toHaveLength(0)
    })

    it('should return summary with failures and actionable errors', async () => {
      // Create some failure events
      await createTelemetryEvent(
        testDomain.id,
        'environment_error',
        'critical',
        'Missing VERCEL_TOKEN',
        { missing: ['VERCEL_TOKEN'] }
      )

      await createTelemetryEvent(
        testDomain.id,
        'dns_error',
        'warning',
        'TXT record not found',
        { record: 'verification-txt-record' }
      )

      // Create a verification attempt
      await prisma.verificationAttempt.create({
        data: {
          domainId: testDomain.id,
          attempt: 1,
          maxAttempts: 10,
          nextRetryAt: new Date(Date.now() + 60000),
          status: 'pending'
        }
      })

      const summary = await getFailureSummary(testDomain.id)

      expect(summary!.totalFailures).toBe(2)
      expect(summary!.failureTypes).toEqual({
        environment_error: 1,
        dns_error: 1
      })
      expect(summary!.actionableErrors.length).toBeGreaterThan(0)
      expect(summary!.suggestedActions.length).toBeGreaterThan(0)
      expect(summary!.canRetry).toBe(true)
    })
  })

  describe('getTelemetryStats', () => {
    it('should return stats with no events', async () => {
      const stats = await getTelemetryStats()

      expect(stats.totalEvents).toBe(0)
      expect(stats.domainsWithIssues).toBe(0)
      expect(stats.failuresByType).toEqual({})
      expect(stats.failuresBySeverity).toEqual({})
      expect(stats.recentFailures).toHaveLength(0)
    })

    it('should return stats with events', async () => {
      // Create some events
      await createTelemetryEvent(
        testDomain.id,
        'environment_error',
        'critical',
        'Missing VERCEL_TOKEN'
      )

      await createTelemetryEvent(
        testDomain.id,
        'verification_success',
        'info',
        'Verification completed'
      )

      // Create a verification attempt to make domain have issues
      await prisma.verificationAttempt.create({
        data: {
          domainId: testDomain.id,
          attempt: 1,
          maxAttempts: 10,
          nextRetryAt: new Date(Date.now() + 60000),
          status: 'failed'
        }
      })

      const stats = await getTelemetryStats()

      expect(stats.totalEvents).toBe(2)
      expect(stats.domainsWithIssues).toBe(1)
      expect(stats.failuresByType.environment_error).toBe(1)
      expect(stats.failuresBySeverity.critical).toBe(1)
      expect(stats.recentFailures).toHaveLength(1)
    })
  })

  describe('resolveTelemetryEvent', () => {
    it('should resolve a telemetry event', async () => {
      const event = await createTelemetryEvent(
        testDomain.id,
        'environment_error',
        'critical',
        'Missing VERCEL_TOKEN'
      )

      await resolveTelemetryEvent(event.id, 'test-user@example.com')

      const resolvedEvent = await prisma.telemetryEvent.findUnique({
        where: { id: event.id }
      })

      expect(resolvedEvent!.resolved).toBe(true)
      expect(resolvedEvent!.resolvedAt).toBeDefined()
      expect(resolvedEvent!.resolvedBy).toBe('test-user@example.com')
    })
  })

  describe('resolveDomainEvents', () => {
    it('should resolve all events for a domain', async () => {
      // Create multiple events
      await createTelemetryEvent(
        testDomain.id,
        'environment_error',
        'critical',
        'Missing VERCEL_TOKEN'
      )

      await createTelemetryEvent(
        testDomain.id,
        'dns_error',
        'warning',
        'TXT record not found'
      )

      await resolveDomainEvents(testDomain.id, 'test-user@example.com')

      const events = await prisma.telemetryEvent.findMany({
        where: { domainId: testDomain.id }
      })

      expect(events).toHaveLength(2)
      events.forEach(event => {
        expect(event.resolved).toBe(true)
        expect(event.resolvedAt).toBeDefined()
        expect(event.resolvedBy).toBe('test-user@example.com')
      })
    })
  })

  describe('getDomainEvents', () => {
    it('should return all events for a domain', async () => {
      // Create multiple events
      const event1 = await createTelemetryEvent(
        testDomain.id,
        'verification_started',
        'info',
        'Verification started'
      )

      const event2 = await createTelemetryEvent(
        testDomain.id,
        'verification_success',
        'info',
        'Verification completed'
      )

      const events = await getDomainEvents(testDomain.id)

      expect(events).toHaveLength(2)
      expect(events[0].id).toBe(event2.id) // Should be ordered by timestamp desc
      expect(events[1].id).toBe(event1.id)
    })

    it('should return empty array for domain with no events', async () => {
      const events = await getDomainEvents(testDomain.id)
      expect(events).toHaveLength(0)
    })
  })
})
