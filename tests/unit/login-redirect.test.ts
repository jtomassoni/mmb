// tests/unit/login-redirect.test.ts
import { getRedirectUrl, isPlatformHost, getPlatformHost, getCurrentHost } from '../../src/lib/redirect'

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
})

afterAll(() => {
  process.env = originalEnv
})

describe('Login Redirect Logic', () => {
  describe('getRedirectUrl', () => {
    it('should redirect SUPERADMIN to platform host', () => {
      process.env.NEXT_PUBLIC_PLATFORM_HOST = 'https://www.byte-by-bite.com'
      
      const redirectUrl = getRedirectUrl('SUPERADMIN', 'https://monaghansbargrill.com')
      
      expect(redirectUrl).toBe('https://www.byte-by-bite.com/resto-admin')
    })

    it('should redirect other roles to admin on current host', () => {
      const redirectUrl = getRedirectUrl('OWNER', 'https://monaghansbargrill.com')
      
      expect(redirectUrl).toBe('https://monaghansbargrill.com/admin')
    })

    it('should redirect MANAGER to admin on current host', () => {
      const redirectUrl = getRedirectUrl('MANAGER', 'https://monaghansbargrill.com')
      
      expect(redirectUrl).toBe('https://monaghansbargrill.com/admin')
    })

    it('should redirect STAFF to admin on current host', () => {
      const redirectUrl = getRedirectUrl('STAFF', 'https://monaghansbargrill.com')
      
      expect(redirectUrl).toBe('https://monaghansbargrill.com/admin')
    })
  })

  describe('isPlatformHost', () => {
    it('should identify platform host correctly', () => {
      process.env.NEXT_PUBLIC_PLATFORM_HOST = 'https://www.byte-by-bite.com'
      
      expect(isPlatformHost('https://www.byte-by-bite.com')).toBe(true)
      expect(isPlatformHost('http://www.byte-by-bite.com')).toBe(true)
      expect(isPlatformHost('www.byte-by-bite.com')).toBe(true)
    })

    it('should identify non-platform hosts correctly', () => {
      process.env.NEXT_PUBLIC_PLATFORM_HOST = 'https://www.byte-by-bite.com'
      
      expect(isPlatformHost('https://monaghansbargrill.com')).toBe(false)
      expect(isPlatformHost('https://other-restaurant.com')).toBe(false)
    })
  })

  describe('getPlatformHost', () => {
    it('should return environment variable when set', () => {
      process.env.NEXT_PUBLIC_PLATFORM_HOST = 'https://custom-platform.com'
      
      expect(getPlatformHost()).toBe('https://custom-platform.com')
    })

    it('should return default when environment variable not set', () => {
      delete process.env.NEXT_PUBLIC_PLATFORM_HOST
      
      expect(getPlatformHost()).toBe('https://www.byte-by-bite.com')
    })
  })

  describe('getCurrentHost', () => {
    it('should return environment variable when set', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://custom-app.com'
      
      expect(getCurrentHost()).toBe('https://custom-app.com')
    })

    it('should return default when environment variable not set', () => {
      delete process.env.NEXT_PUBLIC_APP_URL
      
      expect(getCurrentHost()).toBe('http://localhost:3000')
    })
  })

  describe('Cross-host redirect scenarios', () => {
    it('should handle SUPERADMIN login from tenant site', () => {
      process.env.NEXT_PUBLIC_PLATFORM_HOST = 'https://www.byte-by-bite.com'
      
      // SUPERADMIN logs in from tenant site
      const redirectUrl = getRedirectUrl('SUPERADMIN', 'https://monaghansbargrill.com')
      
      expect(redirectUrl).toBe('https://www.byte-by-bite.com/resto-admin')
    })

    it('should handle OWNER login from tenant site', () => {
      // OWNER logs in from tenant site
      const redirectUrl = getRedirectUrl('OWNER', 'https://monaghansbargrill.com')
      
      expect(redirectUrl).toBe('https://monaghansbargrill.com/admin')
    })

    it('should handle SUPERADMIN login from platform site', () => {
      process.env.NEXT_PUBLIC_PLATFORM_HOST = 'https://www.byte-by-bite.com'
      
      // SUPERADMIN logs in from platform site
      const redirectUrl = getRedirectUrl('SUPERADMIN', 'https://www.byte-by-bite.com')
      
      expect(redirectUrl).toBe('https://www.byte-by-bite.com/resto-admin')
    })
  })
})
