import { parseTimeForTesting, getStatusForTesting } from '../utils/daily-snapshot-utils'

describe('DailySnapshot Utilities', () => {
  describe('Time Parsing', () => {
    it('should parse AM times correctly', () => {
      const result = parseTimeForTesting('10:30 AM')
      expect(result.getHours()).toBe(10)
      expect(result.getMinutes()).toBe(30)
    })

    it('should parse PM times correctly', () => {
      const result = parseTimeForTesting('2:15 PM')
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(15)
    })

    it('should handle 12 PM correctly', () => {
      const result = parseTimeForTesting('12:00 PM')
      expect(result.getHours()).toBe(12)
      expect(result.getMinutes()).toBe(0)
    })

    it('should handle 12 AM correctly', () => {
      const result = parseTimeForTesting('12:00 AM')
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })
  })

  describe('Status Detection', () => {
    const now = new Date('2025-01-20T15:00:00Z') // 3 PM UTC

    it('should return "Upcoming" for future events', () => {
      const futureStart = new Date('2025-01-20T16:00:00Z') // 4 PM UTC
      const status = getStatusForTesting(now, futureStart)
      expect(status).toBe('Upcoming')
    })

    it('should return "Live" for current events', () => {
      const currentStart = new Date('2025-01-20T14:00:00Z') // 2 PM UTC (1 hour ago)
      const status = getStatusForTesting(now, currentStart)
      expect(status).toBe('Live')
    })

    it('should return "Done" for past events', () => {
      const pastStart = new Date('2025-01-20T10:00:00Z') // 10 AM UTC (5 hours ago)
      const status = getStatusForTesting(now, pastStart)
      expect(status).toBe('Done')
    })

    it('should handle 3-hour duration window correctly', () => {
      const startAtWindowEnd = new Date('2025-01-20T12:00:00Z') // 12 PM UTC (3 hours ago)
      const status = getStatusForTesting(now, startAtWindowEnd)
      expect(status).toBe('Live') // Events within 3 hours are considered Live
    })
  })
})
