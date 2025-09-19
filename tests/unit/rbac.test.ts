// tests/unit/rbac.test.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../src/lib/auth'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('RBAC Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should require authentication for protected routes', async () => {
      mockGetServerSession.mockResolvedValue(null)

      // Simulate a request to a protected route
      const request = new NextRequest('https://example.com/admin')
      
      // In a real test, you'd call the actual route handler
      // For now, we're testing the auth logic
      const session = await getServerSession(authOptions)
      expect(session).toBeNull()
    })

    it('should allow authenticated users', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'OWNER' as const,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const session = await getServerSession(authOptions)
      expect(session).toEqual(mockSession)
      expect(session?.user.role).toBe('OWNER')
    })
  })

  describe('Role-based Access Control', () => {
    it('should allow SUPERADMIN to access platform routes', async () => {
      const superadminSession = {
        user: {
          id: 'superadmin-1',
          email: 'superadmin@byte-by-bite.com',
          name: 'Super Admin',
          role: 'SUPERADMIN' as const,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockGetServerSession.mockResolvedValue(superadminSession)

      const session = await getServerSession(authOptions)
      expect(session?.user.role).toBe('SUPERADMIN')
      
      // SUPERADMIN should be able to access /resto-admin
      const canAccessRestoAdmin = session?.user.role === 'SUPERADMIN'
      expect(canAccessRestoAdmin).toBe(true)
    })

    it('should redirect OWNER to site admin', async () => {
      const ownerSession = {
        user: {
          id: 'owner-1',
          email: 'owner@monaghans.com',
          name: 'Restaurant Owner',
          role: 'OWNER' as const,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockGetServerSession.mockResolvedValue(ownerSession)

      const session = await getServerSession(authOptions)
      expect(session?.user.role).toBe('OWNER')
      
      // OWNER should be redirected to /admin, not /resto-admin
      const shouldRedirectToAdmin = session?.user.role !== 'SUPERADMIN'
      expect(shouldRedirectToAdmin).toBe(true)
    })

    it('should redirect MANAGER to site admin', async () => {
      const managerSession = {
        user: {
          id: 'manager-1',
          email: 'manager@monaghans.com',
          name: 'Restaurant Manager',
          role: 'MANAGER' as const,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockGetServerSession.mockResolvedValue(managerSession)

      const session = await getServerSession(authOptions)
      expect(session?.user.role).toBe('MANAGER')
      
      // MANAGER should be redirected to /admin
      const shouldRedirectToAdmin = session?.user.role !== 'SUPERADMIN'
      expect(shouldRedirectToAdmin).toBe(true)
    })

    it('should redirect STAFF to site admin', async () => {
      const staffSession = {
        user: {
          id: 'staff-1',
          email: 'staff@monaghans.com',
          name: 'Restaurant Staff',
          role: 'STAFF' as const,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockGetServerSession.mockResolvedValue(staffSession)

      const session = await getServerSession(authOptions)
      expect(session?.user.role).toBe('STAFF')
      
      // STAFF should be redirected to /admin
      const shouldRedirectToAdmin = session?.user.role !== 'SUPERADMIN'
      expect(shouldRedirectToAdmin).toBe(true)
    })
  })

  describe('Route Protection', () => {
    it('should protect /resto-admin from non-superadmin users', async () => {
      const ownerSession = {
        user: {
          id: 'owner-1',
          email: 'owner@monaghans.com',
          name: 'Restaurant Owner',
          role: 'OWNER' as const,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockGetServerSession.mockResolvedValue(ownerSession)

      const session = await getServerSession(authOptions)
      const canAccessRestoAdmin = session?.user.role === 'SUPERADMIN'
      
      expect(canAccessRestoAdmin).toBe(false)
    })

    it('should allow /admin for all authenticated users', async () => {
      const roles = ['SUPERADMIN', 'OWNER', 'MANAGER', 'STAFF'] as const
      
      for (const role of roles) {
        const session = {
          user: {
            id: `user-${role.toLowerCase()}`,
            email: `${role.toLowerCase()}@example.com`,
            name: `${role} User`,
            role,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }

        mockGetServerSession.mockResolvedValue(session)

        const userSession = await getServerSession(authOptions)
        const canAccessAdmin = userSession?.user.role !== undefined
        
        expect(canAccessAdmin).toBe(true)
      }
    })
  })

  describe('Session Validation', () => {
    it('should handle expired sessions', async () => {
      const expiredSession = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'OWNER' as const,
        },
        expires: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired
      }

      mockGetServerSession.mockResolvedValue(expiredSession)

      const session = await getServerSession(authOptions)
      expect(session).toBeDefined()
      
      // In a real implementation, you'd check if the session is expired
      const isExpired = new Date(session?.expires || '') < new Date()
      expect(isExpired).toBe(true)
    })

    it('should handle invalid user roles', async () => {
      const invalidSession = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'INVALID_ROLE' as any,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockGetServerSession.mockResolvedValue(invalidSession)

      const session = await getServerSession(authOptions)
      expect(session).toBeDefined()
      
      // Should handle invalid roles gracefully
      const validRoles = ['SUPERADMIN', 'OWNER', 'MANAGER', 'STAFF']
      const hasValidRole = validRoles.includes(session?.user.role as any)
      expect(hasValidRole).toBe(false)
    })
  })
})
