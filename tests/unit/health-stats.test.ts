// tests/unit/health-stats.test.ts
import { GET } from '../../src/app/api/health/stats/route'
import { prisma } from '../../src/lib/prisma'

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    site: {
      count: jest.fn(),
    },
    auditLog: {
      count: jest.fn(),
    },
    event: {
      count: jest.fn(),
    },
    special: {
      count: jest.fn(),
    },
    healthPing: {
      aggregate: jest.fn(),
      count: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('Health Stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return health stats successfully', async () => {
    // Mock the database responses
    mockPrisma.site.count.mockResolvedValue(3)
    mockPrisma.auditLog.count.mockResolvedValue(15)
    mockPrisma.event.count.mockResolvedValue(5)
    mockPrisma.special.count.mockResolvedValue(25)
    mockPrisma.healthPing.aggregate.mockResolvedValue({
      _count: { id: 100 },
      _avg: { responseTime: 250 }
    })
    mockPrisma.healthPing.count.mockResolvedValue(95)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      activeSites: 3,
      last7dEdits: 15,
      eventsThisWeek: 5,
      specialsCount: 25,
      uptimePings: {
        total: 100,
        successful: 95,
        averageResponseTime: 250
      },
      timestamp: expect.any(String)
    })
  })

  it('should handle zero values correctly', async () => {
    // Mock empty database responses
    mockPrisma.site.count.mockResolvedValue(0)
    mockPrisma.auditLog.count.mockResolvedValue(0)
    mockPrisma.event.count.mockResolvedValue(0)
    mockPrisma.special.count.mockResolvedValue(0)
    mockPrisma.healthPing.aggregate.mockResolvedValue({
      _count: { id: 0 },
      _avg: { responseTime: null }
    })
    mockPrisma.healthPing.count.mockResolvedValue(0)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      activeSites: 0,
      last7dEdits: 0,
      eventsThisWeek: 0,
      specialsCount: 0,
      uptimePings: {
        total: 0,
        successful: 0,
        averageResponseTime: 0
      },
      timestamp: expect.any(String)
    })
  })

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockPrisma.site.count.mockRejectedValue(new Error('Database connection failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      error: 'Failed to fetch health stats',
      details: 'Database connection failed'
    })
  })

  it('should calculate uptime percentage correctly', async () => {
    // Mock data with specific uptime values
    mockPrisma.site.count.mockResolvedValue(1)
    mockPrisma.auditLog.count.mockResolvedValue(0)
    mockPrisma.event.count.mockResolvedValue(0)
    mockPrisma.special.count.mockResolvedValue(0)
    mockPrisma.healthPing.aggregate.mockResolvedValue({
      _count: { id: 100 },
      _avg: { responseTime: 200 }
    })
    mockPrisma.healthPing.count.mockResolvedValue(98) // 98% success rate

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.uptimePings).toEqual({
      total: 100,
      successful: 98,
      averageResponseTime: 200
    })
  })

  it('should handle null response time average', async () => {
    // Mock data with null average response time
    mockPrisma.site.count.mockResolvedValue(1)
    mockPrisma.auditLog.count.mockResolvedValue(0)
    mockPrisma.event.count.mockResolvedValue(0)
    mockPrisma.special.count.mockResolvedValue(0)
    mockPrisma.healthPing.aggregate.mockResolvedValue({
      _count: { id: 10 },
      _avg: { responseTime: null }
    })
    mockPrisma.healthPing.count.mockResolvedValue(10)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.uptimePings.averageResponseTime).toBe(0)
  })
})
