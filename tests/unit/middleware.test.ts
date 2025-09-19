// tests/unit/middleware.test.ts
import { NextRequest } from 'next/server'
import { middleware } from '../../middleware'

// Mock environment
const originalEnv = process.env

describe('Middleware', () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PLATFORM_HOST: 'www.byte-by-bite.com'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Platform host restrictions', () => {
    it('should allow /resto-admin on platform host', async () => {
      const request = new NextRequest('https://www.byte-by-bite.com/resto-admin', {
        headers: {
          host: 'www.byte-by-bite.com'
        }
      })

      const response = await middleware(request)
      expect(response).toBeInstanceOf(Response)
      expect(response?.status).toBe(200) // NextResponse.next() returns 200
    })

    it('should redirect /resto-admin from tenant host to platform host', async () => {
      const request = new NextRequest('https://monaghansbargrill.com/resto-admin', {
        headers: {
          host: 'monaghansbargrill.com'
        }
      })

      const response = await middleware(request)
      expect(response).toBeInstanceOf(Response)
      expect(response?.status).toBe(307) // Temporary redirect
      
      const location = response?.headers.get('location')
      expect(location).toBe('https://www.byte-by-bite.com/resto-admin')
    })

    it('should allow other paths on tenant hosts', async () => {
      const request = new NextRequest('https://monaghansbargrill.com/menu', {
        headers: {
          host: 'monaghansbargrill.com'
        }
      })

      const response = await middleware(request)
      expect(response).toBeInstanceOf(Response)
      expect(response?.status).toBe(200) // NextResponse.next() returns 200
    })

    it('should allow other paths on platform host', async () => {
      const request = new NextRequest('https://www.byte-by-bite.com/admin', {
        headers: {
          host: 'www.byte-by-bite.com'
        }
      })

      const response = await middleware(request)
      expect(response).toBeInstanceOf(Response)
      expect(response?.status).toBe(200) // NextResponse.next() returns 200
    })
  })

  describe('Host case sensitivity', () => {
    it('should handle uppercase host headers', async () => {
      const request = new NextRequest('https://MONAGHANSBARGRILL.COM/resto-admin', {
        headers: {
          host: 'MONAGHANSBARGRILL.COM'
        }
      })

      const response = await middleware(request)
      expect(response).toBeInstanceOf(Response)
      expect(response?.status).toBe(307)
      
      const location = response?.headers.get('location')
      expect(location).toBe('https://www.byte-by-bite.com/resto-admin')
    })

    it('should handle mixed case host headers', async () => {
      const request = new NextRequest('https://MonaghansBarGrill.com/resto-admin', {
        headers: {
          host: 'MonaghansBarGrill.com'
        }
      })

      const response = await middleware(request)
      expect(response).toBeInstanceOf(Response)
      expect(response?.status).toBe(307)
      
      const location = response?.headers.get('location')
      expect(location).toBe('https://www.byte-by-bite.com/resto-admin')
    })
  })

  describe('Edge cases', () => {
    it('should handle missing host header', async () => {
      const request = new NextRequest('https://example.com/resto-admin', {
        headers: {}
      })

      const response = await middleware(request)
      expect(response).toBeInstanceOf(Response)
      expect(response?.status).toBe(307)
    })

    it('should handle localhost development', async () => {
      const request = new NextRequest('http://localhost:3000/resto-admin', {
        headers: {
          host: 'localhost:3000'
        }
      })

      const response = await middleware(request)
      expect(response).toBeInstanceOf(Response)
      expect(response?.status).toBe(307)
    })
  })
})
