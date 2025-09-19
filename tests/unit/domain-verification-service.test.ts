import {
  calculateNextRetryDelay,
  createVerificationAttempt,
  processVerificationAttempt,
  processPendingVerifications,
  getDomainVerificationStatus,
  cancelVerificationAttempt,
  getActiveVerificationAttempts
} from '../../src/lib/domain-verification-service'
import { prisma } from '../../src/lib/prisma'

// Mock the Vercel functions
jest.mock('../../src/lib/vercel', () => ({
  getDomainStatus: jest.fn()
}))

jest.mock('../../src/lib/vercel-env', () => ({
  validateVercelEnv: jest.fn()
}))

import { getDomainStatus } from '../../src/lib/vercel'
import { validateVercelEnv } from '../../src/lib/vercel-env'

const mockGetDomainStatus = getDomainStatus as jest.MockedFunction<typeof getDomainStatus>
const mockValidateVercelEnv = validateVercelEnv as jest.MockedFunction<typeof validateVercelEnv>

describe('Domain Verification Service', () => {
  let testDomain: any
  let testSite: any

  beforeEach(async () => {
    // Create test site
    testSite = await prisma.site.create({
      data: {
        name: 'Test Site',
        slug: 'test-site',
        description: 'Test site for verification'
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

    // Reset mocks
    jest.clearAllMocks()
  })

  afterEach(async () => {
    // Clean up test data
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

  describe('calculateNextRetryDelay', () => {
    it('should calculate exponential backoff delays', () => {
      const config = {
        maxAttempts: 5,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitterMs: 100
      }

      const delay1 = calculateNextRetryDelay(1, config)
      const delay2 = calculateNextRetryDelay(2, config)
      const delay3 = calculateNextRetryDelay(3, config)

      expect(delay1).toBeGreaterThanOrEqual(1000)
      expect(delay1).toBeLessThanOrEqual(1100)
      expect(delay2).toBeGreaterThanOrEqual(2000)
      expect(delay2).toBeLessThanOrEqual(2100)
      expect(delay3).toBeGreaterThanOrEqual(4000)
      expect(delay3).toBeLessThanOrEqual(4100)
    })

    it('should cap at maximum delay', () => {
      const config = {
        maxAttempts: 10,
        initialDelayMs: 1000,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
        jitterMs: 100
      }

      const delay = calculateNextRetryDelay(10, config)
      expect(delay).toBeLessThanOrEqual(5100) // maxDelayMs + jitterMs
    })

    it('should use default config when none provided', () => {
      const delay = calculateNextRetryDelay(1)
      expect(delay).toBeGreaterThan(0)
    })
  })

  describe('createVerificationAttempt', () => {
    it('should create a new verification attempt', async () => {
      const attempt = await createVerificationAttempt(testDomain.id)

      expect(attempt).toBeDefined()
      expect(attempt.domainId).toBe(testDomain.id)
      expect(attempt.attempt).toBe(1)
      expect(attempt.maxAttempts).toBe(10)
      expect(attempt.status).toBe('pending')
      expect(attempt.nextRetryAt).toBeInstanceOf(Date)
      expect(attempt.nextRetryAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('should use custom config when provided', async () => {
      const config = {
        maxAttempts: 5,
        initialDelayMs: 2000,
        maxDelayMs: 10000,
        backoffMultiplier: 1.5,
        jitterMs: 500
      }

      const attempt = await createVerificationAttempt(testDomain.id, config)

      expect(attempt.maxAttempts).toBe(5)
      expect(attempt.nextRetryAt.getTime()).toBeGreaterThan(Date.now() + 1500) // 2000 - 500 jitter
    })
  })

  describe('processVerificationAttempt', () => {
    it('should verify domain when Vercel reports verified', async () => {
      const attempt = await createVerificationAttempt(testDomain.id)
      
      // Update the attempt to be ready for processing now
      await prisma.verificationAttempt.update({
        where: { id: attempt.id },
        data: { nextRetryAt: new Date(Date.now() - 1000) } // 1 second ago
      })
      
      // Mock Vercel environment as valid
      mockValidateVercelEnv.mockReturnValue({
        isValid: true,
        config: {
          VERCEL_TOKEN: 'test-token',
          VERCEL_PROJECT_ID: 'test-project'
        },
        missing: [],
        invalid: [],
        warnings: []
      })

      // Mock domain as verified
      mockGetDomainStatus.mockResolvedValue({
        id: 'vercel-domain-id',
        name: 'test.example.com',
        verified: true,
        verification: []
      })

      const result = await processVerificationAttempt(attempt.id)

      expect(result.success).toBe(true)
      expect(result.verified).toBe(true)

      // Check that domain was updated
      const updatedDomain = await prisma.domain.findUnique({
        where: { id: testDomain.id }
      })
      expect(updatedDomain?.status).toBe('ACTIVE')
      expect(updatedDomain?.verifiedAt).toBeDefined()

      // Check that attempt was updated
      const updatedAttempt = await prisma.verificationAttempt.findUnique({
        where: { id: attempt.id }
      })
      expect(updatedAttempt?.status).toBe('verified')
    })

    it('should retry when domain is not verified', async () => {
      const attempt = await createVerificationAttempt(testDomain.id)
      
      // Update the attempt to be ready for processing now
      await prisma.verificationAttempt.update({
        where: { id: attempt.id },
        data: { nextRetryAt: new Date(Date.now() - 1000) } // 1 second ago
      })
      
      // Mock Vercel environment as valid
      mockValidateVercelEnv.mockReturnValue({
        isValid: true,
        config: {
          VERCEL_TOKEN: 'test-token',
          VERCEL_PROJECT_ID: 'test-project'
        },
        missing: [],
        invalid: [],
        warnings: []
      })

      // Mock domain as not verified
      mockGetDomainStatus.mockResolvedValue({
        id: 'vercel-domain-id',
        name: 'test.example.com',
        verified: false,
        verification: []
      })

      const result = await processVerificationAttempt(attempt.id)

      expect(result.success).toBe(false)
      expect(result.verified).toBe(false)
      expect(result.nextRetryAt).toBeDefined()

      // Check that attempt was updated
      const updatedAttempt = await prisma.verificationAttempt.findUnique({
        where: { id: attempt.id }
      })
      expect(updatedAttempt?.attempt).toBe(2)
      expect(updatedAttempt?.status).toBe('pending')
    })

    it('should fail when max attempts reached', async () => {
      const attempt = await createVerificationAttempt(testDomain.id, {
        maxAttempts: 1,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitterMs: 100
      })
      
      // Update the attempt to be ready for processing now
      await prisma.verificationAttempt.update({
        where: { id: attempt.id },
        data: { nextRetryAt: new Date(Date.now() - 1000) } // 1 second ago
      })
      
      // Mock Vercel environment as valid
      mockValidateVercelEnv.mockReturnValue({
        isValid: true,
        config: {
          VERCEL_TOKEN: 'test-token',
          VERCEL_PROJECT_ID: 'test-project'
        },
        missing: [],
        invalid: [],
        warnings: []
      })

      // Mock domain as not verified
      mockGetDomainStatus.mockResolvedValue({
        id: 'vercel-domain-id',
        name: 'test.example.com',
        verified: false,
        verification: []
      })

      const result = await processVerificationAttempt(attempt.id)

      expect(result.success).toBe(true)
      expect(result.verified).toBe(false)
      expect(result.error).toBe('Maximum verification attempts reached')

      // Check that attempt was marked as timeout
      const updatedAttempt = await prisma.verificationAttempt.findUnique({
        where: { id: attempt.id }
      })
      expect(updatedAttempt?.status).toBe('timeout')
    })

    it('should handle Vercel environment not available', async () => {
      const attempt = await createVerificationAttempt(testDomain.id)
      
      // Update the attempt to be ready for processing now
      await prisma.verificationAttempt.update({
        where: { id: attempt.id },
        data: { nextRetryAt: new Date(Date.now() - 1000) } // 1 second ago
      })
      
      // Mock Vercel environment as invalid
      mockValidateVercelEnv.mockReturnValue({
        isValid: false,
        missing: ['VERCEL_TOKEN'],
        invalid: [],
        warnings: []
      })

      const result = await processVerificationAttempt(attempt.id)

      expect(result.success).toBe(true)
      expect(result.verified).toBe(false)
      expect(result.error).toBe('Vercel environment not available')

      // Check that attempt was marked as failed
      const updatedAttempt = await prisma.verificationAttempt.findUnique({
        where: { id: attempt.id }
      })
      expect(updatedAttempt?.status).toBe('failed')
    })

    it('should handle Vercel API errors', async () => {
      const attempt = await createVerificationAttempt(testDomain.id)
      
      // Update the attempt to be ready for processing now
      await prisma.verificationAttempt.update({
        where: { id: attempt.id },
        data: { nextRetryAt: new Date(Date.now() - 1000) } // 1 second ago
      })
      
      // Mock Vercel environment as valid
      mockValidateVercelEnv.mockReturnValue({
        isValid: true,
        config: {
          VERCEL_TOKEN: 'test-token',
          VERCEL_PROJECT_ID: 'test-project'
        },
        missing: [],
        invalid: [],
        warnings: []
      })

      // Mock Vercel API error
      mockGetDomainStatus.mockRejectedValue(new Error('Vercel API error'))

      const result = await processVerificationAttempt(attempt.id)

      expect(result.success).toBe(false)
      expect(result.verified).toBe(false)
      expect(result.error).toBe('Vercel API error')
      expect(result.nextRetryAt).toBeDefined()

      // Check that attempt was updated for retry
      const updatedAttempt = await prisma.verificationAttempt.findUnique({
        where: { id: attempt.id }
      })
      expect(updatedAttempt?.attempt).toBe(2)
      expect(updatedAttempt?.status).toBe('pending')
    })
  })

  describe('getDomainVerificationStatus', () => {
    it('should return not_started when no attempts exist', async () => {
      const status = await getDomainVerificationStatus(testDomain.id)

      expect(status.status).toBe('not_started')
      expect(status.attempt).toBeUndefined()
    })

    it('should return latest attempt status', async () => {
      const attempt = await createVerificationAttempt(testDomain.id)
      
      const status = await getDomainVerificationStatus(testDomain.id)

      expect(status.status).toBe('pending')
      expect(status.attempt).toBeDefined()
      expect(status.attempt?.id).toBe(attempt.id)
      expect(status.nextRetryAt).toBeDefined()
    })
  })

  describe('cancelVerificationAttempt', () => {
    it('should cancel pending verification attempts', async () => {
      const attempt = await createVerificationAttempt(testDomain.id)
      
      await cancelVerificationAttempt(testDomain.id)

      const updatedAttempt = await prisma.verificationAttempt.findUnique({
        where: { id: attempt.id }
      })
      expect(updatedAttempt?.status).toBe('failed')
      expect(updatedAttempt?.error).toBe('Cancelled by user')
    })
  })

  describe('getActiveVerificationAttempts', () => {
    it('should return only pending attempts', async () => {
      const attempt1 = await createVerificationAttempt(testDomain.id)
      
      // Create another domain and attempt
      const domain2 = await prisma.domain.create({
        data: {
          siteId: testSite.id,
          hostname: 'test2.example.com',
          status: 'PENDING',
          provider: 'VERCEL'
        }
      })
      const attempt2 = await createVerificationAttempt(domain2.id)

      const activeAttempts = await getActiveVerificationAttempts()

      expect(activeAttempts).toHaveLength(2)
      expect(activeAttempts.every(a => a.status === 'pending')).toBe(true)
      expect(activeAttempts.every(a => a.domain)).toBeDefined()

      // Clean up
      await prisma.verificationAttempt.deleteMany({
        where: { domainId: domain2.id }
      })
      await prisma.domain.deleteMany({
        where: { id: domain2.id }
      })
    })
  })

  describe('processPendingVerifications', () => {
    it('should process multiple pending attempts', async () => {
      const attempt1 = await createVerificationAttempt(testDomain.id)
      
      // Create another domain and attempt
      const domain2 = await prisma.domain.create({
        data: {
          siteId: testSite.id,
          hostname: 'test2.example.com',
          status: 'PENDING',
          provider: 'VERCEL'
        }
      })
      const attempt2 = await createVerificationAttempt(domain2.id)

      // Update both attempts to be ready for processing now
      await prisma.verificationAttempt.updateMany({
        where: { 
          id: { in: [attempt1.id, attempt2.id] }
        },
        data: { nextRetryAt: new Date(Date.now() - 1000) } // 1 second ago
      })

      // Mock Vercel environment as valid
      mockValidateVercelEnv.mockReturnValue({
        isValid: true,
        config: {
          VERCEL_TOKEN: 'test-token',
          VERCEL_PROJECT_ID: 'test-project'
        },
        missing: [],
        invalid: [],
        warnings: []
      })

      // Mock domain as verified
      mockGetDomainStatus.mockResolvedValue({
        id: 'vercel-domain-id',
        name: 'test.example.com',
        verified: true,
        verification: []
      })

      const result = await processPendingVerifications()

      expect(result.processed).toBeGreaterThan(0)
      expect(result.verified).toBeGreaterThan(0)

      // Clean up
      await prisma.verificationAttempt.deleteMany({
        where: { domainId: domain2.id }
      })
      await prisma.domain.deleteMany({
        where: { id: domain2.id }
      })
    })
  })
})
