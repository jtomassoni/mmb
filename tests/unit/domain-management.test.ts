import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Domain Management', () => {
  let testSiteId: string
  let testDomainId: string

  beforeAll(async () => {
    // Create a test site
    const site = await prisma.site.create({
      data: {
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        description: 'Test restaurant for domain management',
        address: '123 Test St, Test City, TC 12345',
        phone: '(555) 123-4567',
        email: 'test@testrestaurant.com'
      }
    })
    testSiteId = site.id

    // Create a test domain
    const domain = await prisma.domain.create({
      data: {
        siteId: testSiteId,
        hostname: 'testrestaurant.com',
        status: 'PENDING',
        provider: 'VERCEL'
      }
    })
    testDomainId = domain.id
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.domain.deleteMany({
      where: { hostname: 'testrestaurant.com' }
    })
    await prisma.site.deleteMany({
      where: { slug: 'test-restaurant' }
    })
    await prisma.$disconnect()
  })

  describe('Domain Creation', () => {
    it('should create a domain with correct properties', async () => {
      const domain = await prisma.domain.findUnique({
        where: { id: testDomainId }
      })

      expect(domain).toBeTruthy()
      expect(domain?.hostname).toBe('testrestaurant.com')
      expect(domain?.status).toBe('PENDING')
      expect(domain?.provider).toBe('VERCEL')
      expect(domain?.siteId).toBe(testSiteId)
    })

    it('should associate domain with correct site', async () => {
      const domain = await prisma.domain.findUnique({
        where: { id: testDomainId },
        include: { site: true }
      })

      expect(domain?.site.id).toBe(testSiteId)
      expect(domain?.site.name).toBe('Test Restaurant')
    })
  })

  describe('Domain Status Updates', () => {
    it('should update domain status to ACTIVE', async () => {
      const updatedDomain = await prisma.domain.update({
        where: { id: testDomainId },
        data: {
          status: 'ACTIVE',
          verifiedAt: new Date()
        }
      })

      expect(updatedDomain.status).toBe('ACTIVE')
      expect(updatedDomain.verifiedAt).toBeTruthy()
    })

    it('should update domain status to ERROR', async () => {
      const updatedDomain = await prisma.domain.update({
        where: { id: testDomainId },
        data: { status: 'ERROR' }
      })

      expect(updatedDomain.status).toBe('ERROR')
    })
  })

  describe('Domain Queries', () => {
    it('should find domains by site', async () => {
      const domains = await prisma.domain.findMany({
        where: { siteId: testSiteId }
      })

      expect(domains).toHaveLength(1)
      expect(domains[0].hostname).toBe('testrestaurant.com')
    })

    it('should find domains by status', async () => {
      // Reset to PENDING for this test
      await prisma.domain.update({
        where: { id: testDomainId },
        data: { status: 'PENDING' }
      })

      const pendingDomains = await prisma.domain.findMany({
        where: { status: 'PENDING' }
      })

      expect(pendingDomains.length).toBeGreaterThan(0)
      expect(pendingDomains.some(d => d.hostname === 'testrestaurant.com')).toBe(true)
    })

    it('should find domains by hostname', async () => {
      const domain = await prisma.domain.findFirst({
        where: { hostname: 'testrestaurant.com' }
      })

      expect(domain).toBeTruthy()
      expect(domain?.id).toBe(testDomainId)
    })
  })

  describe('Domain Validation', () => {
    it('should accept various hostname formats', async () => {
      const domain = await prisma.domain.create({
        data: {
          siteId: testSiteId,
          hostname: 'subdomain.example.com',
          status: 'PENDING',
          provider: 'VERCEL'
        }
      })

      expect(domain.hostname).toBe('subdomain.example.com')
      
      // Clean up
      await prisma.domain.delete({ where: { id: domain.id } })
    })

    it('should require siteId', async () => {
      await expect(
        prisma.domain.create({
          data: {
            hostname: 'test.com',
            status: 'PENDING',
            provider: 'VERCEL'
          }
        })
      ).rejects.toThrow()
    })

    it('should require hostname', async () => {
      await expect(
        prisma.domain.create({
          data: {
            siteId: testSiteId,
            status: 'PENDING',
            provider: 'VERCEL'
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Domain Relationships', () => {
    it('should cascade delete when site is deleted', async () => {
      // Create a temporary site and domain
      const tempSite = await prisma.site.create({
        data: {
          name: 'Temp Site',
          slug: 'temp-site',
          description: 'Temporary site for cascade test',
          address: '123 Temp St',
          phone: '(555) 000-0000',
          email: 'temp@tempsite.com'
        }
      })

      const tempDomain = await prisma.domain.create({
        data: {
          siteId: tempSite.id,
          hostname: 'tempsite.com',
          status: 'PENDING',
          provider: 'VERCEL'
        }
      })

      // Delete the site
      await prisma.site.delete({
        where: { id: tempSite.id }
      })

      // Check that domain was also deleted
      const deletedDomain = await prisma.domain.findUnique({
        where: { id: tempDomain.id }
      })

      expect(deletedDomain).toBeNull()
    })
  })
})
