import { 
  hasPermission, 
  getRolePermissions, 
  hasAllPermissions, 
  hasAnyPermission,
  getRoleLevel,
  canManageRole,
  getAssignableRoles,
  validateSiteAccess,
  getRoleInfo,
  UserRole,
  RESOURCES,
  ACTIONS
} from '../../src/lib/rbac'
import { 
  createAutosaveManager, 
  AutosaveManager,
  AutosaveConfig,
  AutosaveState
} from '../../src/lib/autosave'
import { 
  createAuditLogEntry,
  AuditLogService,
  AuditLogEntry
} from '../../src/lib/audit-log'

// Mock fetch for testing
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    onLine: true,
  },
  writable: true,
})

describe('RBAC System', () => {
  describe('Permission Checking', () => {
    it('should allow SUPERADMIN to perform any action', () => {
      expect(hasPermission('SUPERADMIN', RESOURCES.SITE, ACTIONS.MANAGE)).toBe(true)
      expect(hasPermission('SUPERADMIN', RESOURCES.EVENTS, ACTIONS.MANAGE)).toBe(true)
      expect(hasPermission('SUPERADMIN', RESOURCES.USERS, ACTIONS.MANAGE)).toBe(true)
      expect(hasPermission('SUPERADMIN', RESOURCES.DOMAINS, ACTIONS.MANAGE)).toBe(true)
    })

    it('should allow OWNER to manage their own site', () => {
      expect(hasPermission('OWNER', RESOURCES.SITE, ACTIONS.MANAGE)).toBe(true)
      expect(hasPermission('OWNER', RESOURCES.EVENTS, ACTIONS.MANAGE)).toBe(true)
      expect(hasPermission('OWNER', RESOURCES.SPECIALS, ACTIONS.MANAGE)).toBe(true)
      expect(hasPermission('OWNER', RESOURCES.MENU, ACTIONS.MANAGE)).toBe(true)
      expect(hasPermission('OWNER', RESOURCES.HOURS, ACTIONS.MANAGE)).toBe(true)
    })

    it('should allow MANAGER to manage content', () => {
      expect(hasPermission('MANAGER', RESOURCES.EVENTS, ACTIONS.CREATE)).toBe(true)
      expect(hasPermission('MANAGER', RESOURCES.EVENTS, ACTIONS.UPDATE)).toBe(true)
      expect(hasPermission('MANAGER', RESOURCES.EVENTS, ACTIONS.DELETE)).toBe(true)
      expect(hasPermission('MANAGER', RESOURCES.SPECIALS, ACTIONS.CREATE)).toBe(true)
      expect(hasPermission('MANAGER', RESOURCES.MENU, ACTIONS.UPDATE)).toBe(true)
    })

    it('should restrict STAFF to read-only access', () => {
      expect(hasPermission('STAFF', RESOURCES.EVENTS, ACTIONS.READ)).toBe(true)
      expect(hasPermission('STAFF', RESOURCES.SPECIALS, ACTIONS.READ)).toBe(true)
      expect(hasPermission('STAFF', RESOURCES.MENU, ACTIONS.READ)).toBe(true)
      expect(hasPermission('STAFF', RESOURCES.EVENTS, ACTIONS.CREATE)).toBe(false)
      expect(hasPermission('STAFF', RESOURCES.SPECIALS, ACTIONS.UPDATE)).toBe(false)
    })

    it('should deny unauthorized actions', () => {
      expect(hasPermission('STAFF', RESOURCES.USERS, ACTIONS.MANAGE)).toBe(false)
      expect(hasPermission('MANAGER', RESOURCES.DOMAINS, ACTIONS.MANAGE)).toBe(false)
      expect(hasPermission('OWNER', RESOURCES.DOMAINS, ACTIONS.MANAGE)).toBe(false)
    })
  })

  describe('Role Hierarchy', () => {
    it('should have correct role levels', () => {
      expect(getRoleLevel('SUPERADMIN')).toBe(4)
      expect(getRoleLevel('OWNER')).toBe(3)
      expect(getRoleLevel('MANAGER')).toBe(2)
      expect(getRoleLevel('STAFF')).toBe(1)
    })

    it('should allow higher roles to manage lower roles', () => {
      expect(canManageRole('SUPERADMIN', 'OWNER')).toBe(true)
      expect(canManageRole('SUPERADMIN', 'MANAGER')).toBe(true)
      expect(canManageRole('SUPERADMIN', 'STAFF')).toBe(true)
      expect(canManageRole('OWNER', 'MANAGER')).toBe(true)
      expect(canManageRole('OWNER', 'STAFF')).toBe(true)
      expect(canManageRole('MANAGER', 'STAFF')).toBe(true)
    })

    it('should not allow lower roles to manage higher roles', () => {
      expect(canManageRole('OWNER', 'SUPERADMIN')).toBe(false)
      expect(canManageRole('MANAGER', 'OWNER')).toBe(false)
      expect(canManageRole('MANAGER', 'SUPERADMIN')).toBe(false)
      expect(canManageRole('STAFF', 'MANAGER')).toBe(false)
      expect(canManageRole('STAFF', 'OWNER')).toBe(false)
      expect(canManageRole('STAFF', 'SUPERADMIN')).toBe(false)
    })

    it('should return correct assignable roles', () => {
      expect(getAssignableRoles('SUPERADMIN')).toEqual(['OWNER', 'MANAGER', 'STAFF'])
      expect(getAssignableRoles('OWNER')).toEqual(['MANAGER', 'STAFF'])
      expect(getAssignableRoles('MANAGER')).toEqual(['STAFF'])
      expect(getAssignableRoles('STAFF')).toEqual([])
    })
  })

  describe('Site Access Validation', () => {
    it('should allow SUPERADMIN to access any site', () => {
      expect(validateSiteAccess('SUPERADMIN', 'site1', 'site2', ACTIONS.MANAGE)).toBe(true)
      expect(validateSiteAccess('SUPERADMIN', 'site1', 'site1', ACTIONS.MANAGE)).toBe(true)
    })

    it('should allow OWNER to access only their own site', () => {
      expect(validateSiteAccess('OWNER', 'site1', 'site1', ACTIONS.MANAGE)).toBe(true)
      expect(validateSiteAccess('OWNER', 'site1', 'site2', ACTIONS.MANAGE)).toBe(false)
    })

    it('should allow MANAGER and STAFF to access only their own site', () => {
      expect(validateSiteAccess('MANAGER', 'site1', 'site1', ACTIONS.READ)).toBe(true)
      expect(validateSiteAccess('MANAGER', 'site1', 'site2', ACTIONS.READ)).toBe(false)
      expect(validateSiteAccess('STAFF', 'site1', 'site1', ACTIONS.READ)).toBe(true)
      expect(validateSiteAccess('STAFF', 'site1', 'site2', ACTIONS.READ)).toBe(false)
    })
  })

  describe('Role Information', () => {
    it('should return correct role info for SUPERADMIN', () => {
      const info = getRoleInfo('SUPERADMIN')
      expect(info.role).toBe('SUPERADMIN')
      expect(info.level).toBe(4)
      expect(info.canManage).toEqual(['OWNER', 'MANAGER', 'STAFF'])
      expect(info.permissions.length).toBeGreaterThan(0)
    })

    it('should return correct role info for STAFF', () => {
      const info = getRoleInfo('STAFF')
      expect(info.role).toBe('STAFF')
      expect(info.level).toBe(1)
      expect(info.canManage).toEqual([])
      expect(info.permissions.length).toBeGreaterThan(0)
    })
  })

  describe('Multiple Permission Checking', () => {
    it('should check all permissions correctly', () => {
      const requiredPermissions = [
        { resource: RESOURCES.EVENTS, action: ACTIONS.CREATE },
        { resource: RESOURCES.EVENTS, action: ACTIONS.UPDATE }
      ]

      expect(hasAllPermissions('MANAGER', requiredPermissions)).toBe(true)
      expect(hasAllPermissions('STAFF', requiredPermissions)).toBe(false)
    })

    it('should check any permission correctly', () => {
      const requiredPermissions = [
        { resource: RESOURCES.EVENTS, action: ACTIONS.CREATE },
        { resource: RESOURCES.USERS, action: ACTIONS.MANAGE }
      ]

      expect(hasAnyPermission('MANAGER', requiredPermissions)).toBe(true)
      expect(hasAnyPermission('STAFF', requiredPermissions)).toBe(false)
    })
  })
})

describe('Autosave System', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>
  let autosaveManager: AutosaveManager

  beforeEach(() => {
    mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockClear()
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue('')
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()

    autosaveManager = createAutosaveManager({
      resource: 'events',
      resourceId: 'event-1',
      userId: 'user-1',
      userRole: 'OWNER',
      siteId: 'site-1',
      endpoint: '/api/events/event-1'
    })
  })

  afterEach(() => {
    autosaveManager.destroy()
  })

  describe('Basic Functionality', () => {
    it('should initialize with clean state', () => {
      const state = autosaveManager.getState()
      expect(state.isDirty).toBe(false)
      expect(state.isSaving).toBe(false)
      expect(state.lastSaved).toBeNull()
      expect(state.lastError).toBeNull()
      expect(state.pendingChanges).toEqual({})
      expect(state.conflictData).toBeNull()
      expect(state.offlineQueue).toEqual([])
    })

    it('should update data and mark as dirty', () => {
      autosaveManager.updateData({ name: 'New Event' })
      
      const state = autosaveManager.getState()
      expect(state.isDirty).toBe(true)
      expect(state.pendingChanges).toEqual({ name: 'New Event' })
    })

    it('should accumulate changes', () => {
      autosaveManager.updateData({ name: 'New Event' })
      autosaveManager.updateData({ description: 'Event description' })
      
      const state = autosaveManager.getState()
      expect(state.pendingChanges).toEqual({ 
        name: 'New Event', 
        description: 'Event description' 
      })
    })
  })

  describe('Save Operations', () => {
    it('should handle successful save', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 'event-1' } })
      } as Response)

      autosaveManager.updateData({ name: 'New Event' })
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 2500))

      const state = autosaveManager.getState()
      expect(state.isDirty).toBe(false)
      expect(state.isSaving).toBe(false)
      expect(state.lastSaved).toBeTruthy()
      expect(state.lastError).toBeNull()
      expect(state.pendingChanges).toEqual({})
    })

    it('should handle save errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      autosaveManager.updateData({ name: 'New Event' })
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 2500))

      const state = autosaveManager.getState()
      expect(state.isDirty).toBe(true)
      expect(state.isSaving).toBe(false)
      expect(state.lastError).toBe('Network error')
    })

    it('should handle conflicts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          conflictData: {
            localChanges: { name: 'New Event' },
            serverChanges: { name: 'Updated Event' },
            conflictFields: ['name'],
            resolution: 'pending'
          }
        })
      } as Response)

      autosaveManager.updateData({ name: 'New Event' })
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 2500))

      const state = autosaveManager.getState()
      expect(state.conflictData).toBeTruthy()
      expect(state.conflictData?.conflictFields).toEqual(['name'])
    })
  })

  describe('Conflict Resolution', () => {
    it('should resolve conflicts with local changes', async () => {
      // Mock successful save after conflict resolution
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 'event-1' } })
      } as Response)

      autosaveManager.updateData({ name: 'New Event' })
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Resolve conflict
      autosaveManager.resolveConflict('local')
      
      // Wait for save
      await new Promise(resolve => setTimeout(resolve, 1000))

      const state = autosaveManager.getState()
      expect(state.conflictData).toBeNull()
      expect(state.isDirty).toBe(false)
    })

    it('should resolve conflicts with server changes', () => {
      autosaveManager.updateData({ name: 'New Event' })
      
      // Simulate conflict
      const conflictData = {
        localChanges: { name: 'New Event' },
        serverChanges: { name: 'Updated Event' },
        conflictFields: ['name'],
        resolution: 'pending' as const
      }
      
      // Manually set conflict data for testing
      ;(autosaveManager as any).state.conflictData = conflictData

      autosaveManager.resolveConflict('server')
      
      const state = autosaveManager.getState()
      expect(state.conflictData).toBeNull()
      expect(state.pendingChanges).toEqual({ name: 'Updated Event' })
    })
  })

  describe('Offline Support', () => {
    it('should queue changes when offline', async () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      // Mock fetch to reject (simulating offline)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      autosaveManager.updateData({ name: 'New Event' })
      
      // Wait for the save attempt to fail and queue the change
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      const state = autosaveManager.getState()
      expect(state.offlineQueue.length).toBe(1)
      expect(state.offlineQueue[0].data).toEqual({ name: 'New Event' })
    })

    it('should process offline queue when back online', async () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      autosaveManager.updateData({ name: 'New Event' })
      
      // Mock back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 'event-1' } })
      } as Response)

      await autosaveManager.processOfflineQueue()
      
      const state = autosaveManager.getState()
      expect(state.offlineQueue.length).toBe(0)
    })
  })

  describe('State Listeners', () => {
    it('should notify listeners of state changes', () => {
      const listener = jest.fn()
      autosaveManager.subscribe('test-listener', listener)

      autosaveManager.updateData({ name: 'New Event' })
      
      expect(listener).toHaveBeenCalled()
      
      const state = listener.mock.calls[0][0]
      expect(state.isDirty).toBe(true)
    })

    it('should allow unsubscribing from state changes', () => {
      const listener = jest.fn()
      autosaveManager.subscribe('test-listener', listener)
      autosaveManager.unsubscribe('test-listener')

      autosaveManager.updateData({ name: 'New Event' })
      
      expect(listener).not.toHaveBeenCalled()
    })
  })
})

describe('Audit Log System', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>
  let auditService: AuditLogService

  beforeEach(() => {
    mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockClear()
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue('test-token')
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
    
    auditService = new AuditLogService()
  })

  describe('Audit Entry Creation', () => {
    it('should create audit entry with required fields', () => {
      const entry = createAuditLogEntry(
        'user-1',
        'OWNER',
        'update',
        'events',
        {
          resourceId: 'event-1',
          siteId: 'site-1',
          oldValue: { name: 'Old Event' },
          newValue: { name: 'New Event' },
          success: true
        }
      )

      expect(entry.id).toBeTruthy()
      expect(entry.userId).toBe('user-1')
      expect(entry.userRole).toBe('OWNER')
      expect(entry.action).toBe('update')
      expect(entry.resource).toBe('events')
      expect(entry.resourceId).toBe('event-1')
      expect(entry.siteId).toBe('site-1')
      expect(entry.success).toBe(true)
      expect(entry.timestamp).toBeInstanceOf(Date)
    })

    it('should calculate changes correctly', () => {
      const entry = createAuditLogEntry(
        'user-1',
        'OWNER',
        'update',
        'events',
        {
          oldValue: { name: 'Old Event', description: 'Old description' },
          newValue: { name: 'New Event', description: 'New description' }
        }
      )

      expect(entry.changes).toEqual({
        name: { old: 'Old Event', new: 'New Event' },
        description: { old: 'Old description', new: 'New description' }
      })
    })

    it('should determine rollback capability correctly', () => {
      const updateEntry = createAuditLogEntry(
        'user-1',
        'OWNER',
        'update',
        'events',
        {
          oldValue: { name: 'Old Event' },
          newValue: { name: 'New Event' }
        }
      )

      const readEntry = createAuditLogEntry(
        'user-1',
        'OWNER',
        'read',
        'events'
      )

      expect(updateEntry.canRollback).toBe(true)
      expect(readEntry.canRollback).toBe(false)
    })
  })

  describe('Audit Service', () => {
    it('should log audit entries', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const entry = createAuditLogEntry(
        'user-1',
        'OWNER',
        'update',
        'events',
        { resourceId: 'event-1', siteId: 'site-1' }
      )

      const result = await auditService.logEntry(entry)
      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/audit/log',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(entry)
        })
      )
    })

    it.skip('should query audit logs', async () => {
      const mockResponse = {
        entries: [],
        total: 0,
        hasMore: false
      }

      // Clear any previous mocks
      mockFetch.mockClear()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          query: {
            userId: 'user-1',
            resource: 'events',
            limit: 10
          }
        })
      } as Response)

      const result = await auditService.queryLogs({
        userId: 'user-1',
        resource: 'events',
        limit: 10
      })

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/audit/query'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      )
    })

    it.skip('should get audit statistics', async () => {
      const mockStats = {
        totalEntries: 100,
        entriesByAction: { update: 50, create: 30, delete: 20 },
        entriesByResource: { events: 40, specials: 35, menu: 25 },
        entriesByUser: {},
        entriesBySite: {},
        successRate: 95,
        errorRate: 5,
        recentActivity: [],
        topUsers: [],
        topResources: []
      }

      // Clear any previous mocks
      mockFetch.mockClear()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      } as Response)

      const result = await auditService.getStats({
        siteId: 'site-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      })

      expect(result).toEqual(mockStats)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/audit/stats'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      )
    })

    it.skip('should handle rollback operations', async () => {
      const mockRollbackResponse = {
        success: true,
        rollbackEntry: {
          id: 'rollback-1',
          timestamp: new Date(),
          resource: 'events',
          resourceId: 'event-1'
        }
      }

      // Clear any previous mocks
      mockFetch.mockClear()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRollbackResponse
      } as Response)

      const result = await auditService.rollbackAction({
        auditLogId: 'audit-1',
        userId: 'user-1',
        userRole: 'OWNER',
        reason: 'Mistake in data entry'
      })

      expect(result.success).toBe(true)
      expect(result.rollbackEntry).toEqual({
        id: 'rollback-1',
        timestamp: expect.any(Date),
        resource: 'events',
        resourceId: 'event-1'
      })
    })
  })
})

describe('Integration Tests', () => {
  it('should work together for a complete editing workflow', async () => {
    // Mock successful API responses
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { id: 'event-1' } })
    })

    // Create autosave manager
    const autosaveManager = createAutosaveManager({
      resource: 'events',
      resourceId: 'event-1',
      userId: 'user-1',
      userRole: 'OWNER',
      siteId: 'site-1',
      endpoint: '/api/events/event-1'
    })

    // Create audit service
    const auditService = new AuditLogService()

    // Check permissions
    expect(hasPermission('OWNER', 'events', 'manage')).toBe(true)

    // Update data
    autosaveManager.updateData({ name: 'New Event' })
    
    // Wait for autosave
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Log audit entry
    const auditEntry = createAuditLogEntry(
      'user-1',
      'OWNER',
      'update',
      'events',
      {
        resourceId: 'event-1',
        siteId: 'site-1',
        oldValue: { name: 'Old Event' },
        newValue: { name: 'New Event' },
        success: true
      }
    )

    const auditResult = await auditService.logEntry(auditEntry)
    expect(auditResult).toBe(true)

    // Check final state
    const state = autosaveManager.getState()
    expect(state.isDirty).toBe(false)
    expect(state.lastSaved).toBeTruthy()

    autosaveManager.destroy()
  })
})
