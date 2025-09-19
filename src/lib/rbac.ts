/**
 * Role-Based Access Control (RBAC) System
 * 
 * Defines permissions and access control for different user roles
 * in the restaurant management system.
 */

export type UserRole = 'SUPERADMIN' | 'OWNER' | 'MANAGER' | 'STAFF'

export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
  description: string
}

// Define all possible resources and actions
export const RESOURCES = {
  SITE: 'site',
  EVENTS: 'events',
  SPECIALS: 'specials',
  MENU: 'menu',
  HOURS: 'hours',
  PROFILE: 'profile',
  USERS: 'users',
  DOMAINS: 'domains',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  AUDIT: 'audit',
  BACKUP: 'backup'
} as const

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish',
  UNPUBLISH: 'unpublish',
  MANAGE: 'manage'
} as const

// Permission definitions for each role
const superadminPermissions: Permission[] = [
  // Full access to everything
  { resource: RESOURCES.SITE, action: ACTIONS.MANAGE },
  { resource: RESOURCES.EVENTS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.SPECIALS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.MENU, action: ACTIONS.MANAGE },
  { resource: RESOURCES.HOURS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.PROFILE, action: ACTIONS.MANAGE },
  { resource: RESOURCES.USERS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.DOMAINS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.ANALYTICS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.SETTINGS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.AUDIT, action: ACTIONS.MANAGE },
  { resource: RESOURCES.BACKUP, action: ACTIONS.MANAGE }
]

const ownerPermissions: Permission[] = [
  // Full access to their own site
  { resource: RESOURCES.SITE, action: ACTIONS.MANAGE },
  { resource: RESOURCES.EVENTS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.SPECIALS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.MENU, action: ACTIONS.MANAGE },
  { resource: RESOURCES.HOURS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.PROFILE, action: ACTIONS.MANAGE },
  { resource: RESOURCES.USERS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.ANALYTICS, action: ACTIONS.READ },
  { resource: RESOURCES.SETTINGS, action: ACTIONS.MANAGE },
  { resource: RESOURCES.AUDIT, action: ACTIONS.READ }
]

const managerPermissions: Permission[] = [
  // Content management permissions
  { resource: RESOURCES.EVENTS, action: ACTIONS.CREATE },
  { resource: RESOURCES.EVENTS, action: ACTIONS.READ },
  { resource: RESOURCES.EVENTS, action: ACTIONS.UPDATE },
  { resource: RESOURCES.EVENTS, action: ACTIONS.DELETE },
  { resource: RESOURCES.EVENTS, action: ACTIONS.PUBLISH },
  { resource: RESOURCES.SPECIALS, action: ACTIONS.CREATE },
  { resource: RESOURCES.SPECIALS, action: ACTIONS.READ },
  { resource: RESOURCES.SPECIALS, action: ACTIONS.UPDATE },
  { resource: RESOURCES.SPECIALS, action: ACTIONS.DELETE },
  { resource: RESOURCES.SPECIALS, action: ACTIONS.PUBLISH },
  { resource: RESOURCES.MENU, action: ACTIONS.CREATE },
  { resource: RESOURCES.MENU, action: ACTIONS.READ },
  { resource: RESOURCES.MENU, action: ACTIONS.UPDATE },
  { resource: RESOURCES.MENU, action: ACTIONS.DELETE },
  { resource: RESOURCES.HOURS, action: ACTIONS.READ },
  { resource: RESOURCES.HOURS, action: ACTIONS.UPDATE },
  { resource: RESOURCES.PROFILE, action: ACTIONS.READ },
  { resource: RESOURCES.ANALYTICS, action: ACTIONS.READ }
]

const staffPermissions: Permission[] = [
  // Limited content permissions
  { resource: RESOURCES.EVENTS, action: ACTIONS.READ },
  { resource: RESOURCES.SPECIALS, action: ACTIONS.READ },
  { resource: RESOURCES.MENU, action: ACTIONS.READ },
  { resource: RESOURCES.HOURS, action: ACTIONS.READ },
  { resource: RESOURCES.PROFILE, action: ACTIONS.READ }
]

const rolePermissions: RolePermissions[] = [
  {
    role: 'SUPERADMIN',
    permissions: superadminPermissions,
    description: 'Full system access across all sites and features'
  },
  {
    role: 'OWNER',
    permissions: ownerPermissions,
    description: 'Full access to own restaurant site and management'
  },
  {
    role: 'MANAGER',
    permissions: managerPermissions,
    description: 'Content management and operational permissions'
  },
  {
    role: 'STAFF',
    permissions: staffPermissions,
    description: 'Read-only access to restaurant information'
  }
]

/**
 * Check if a user role has permission for a specific resource and action
 */
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  context?: Record<string, any>
): boolean {
  const rolePermission = rolePermissions.find(rp => rp.role === userRole)
  if (!rolePermission) return false

  return rolePermission.permissions.some(permission => {
    // Check if resource and action match
    if (permission.resource !== resource || permission.action !== action) {
      return false
    }

    // Check conditions if they exist
    if (permission.conditions && context) {
      return Object.entries(permission.conditions).every(([key, value]) => {
        return context[key] === value
      })
    }

    return true
  })
}

/**
 * Get all permissions for a user role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  const rolePermission = rolePermissions.find(rp => rp.role === userRole)
  return rolePermission?.permissions || []
}

/**
 * Check if a user can perform multiple actions
 */
export function hasAllPermissions(
  userRole: UserRole,
  requiredPermissions: Array<{ resource: string; action: string }>,
  context?: Record<string, any>
): boolean {
  return requiredPermissions.every(({ resource, action }) =>
    hasPermission(userRole, resource, action, context)
  )
}

/**
 * Check if a user can perform any of the specified actions
 */
export function hasAnyPermission(
  userRole: UserRole,
  requiredPermissions: Array<{ resource: string; action: string }>,
  context?: Record<string, any>
): boolean {
  return requiredPermissions.some(({ resource, action }) =>
    hasPermission(userRole, resource, action, context)
  )
}

/**
 * Get the role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(userRole: UserRole): number {
  const roleLevels: Record<UserRole, number> = {
    SUPERADMIN: 4,
    OWNER: 3,
    MANAGER: 2,
    STAFF: 1
  }
  return roleLevels[userRole] || 0
}

/**
 * Check if one role can manage another role
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const managerLevel = getRoleLevel(managerRole)
  const targetLevel = getRoleLevel(targetRole)
  
  // Can manage roles at lower levels
  return managerLevel > targetLevel
}

/**
 * Get available roles that a user can assign
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
  const allRoles: UserRole[] = ['SUPERADMIN', 'OWNER', 'MANAGER', 'STAFF']
  const userLevel = getRoleLevel(userRole)
  
  return allRoles.filter(role => {
    const roleLevel = getRoleLevel(role)
    return roleLevel < userLevel
  })
}

/**
 * Validate user access to a specific site
 */
export function validateSiteAccess(
  userRole: UserRole,
  userSiteId: string,
  targetSiteId: string,
  action: string
): boolean {
  // Superadmin can access any site
  if (userRole === 'SUPERADMIN') return true
  
  // Owner can only access their own site
  if (userRole === 'OWNER') return userSiteId === targetSiteId
  
  // Manager and Staff can only access their own site
  return userSiteId === targetSiteId
}

/**
 * Get role description and permissions summary
 */
export function getRoleInfo(userRole: UserRole): {
  role: UserRole
  description: string
  permissions: Permission[]
  level: number
  canManage: UserRole[]
} {
  const rolePermission = rolePermissions.find(rp => rp.role === userRole)
  
  return {
    role: userRole,
    description: rolePermission?.description || 'Unknown role',
    permissions: rolePermission?.permissions || [],
    level: getRoleLevel(userRole),
    canManage: getAssignableRoles(userRole)
  }
}

/**
 * Create a permission check middleware for API routes
 */
export function createPermissionMiddleware(
  resource: string,
  action: string,
  contextExtractor?: (req: any) => Record<string, any>
) {
  return (req: any, res: any, next: any) => {
    const userRole = req.user?.role as UserRole
    const userId = req.user?.id
    const userSiteId = req.user?.siteId
    
    if (!userRole) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const context = contextExtractor ? contextExtractor(req) : {}
    
    if (!hasPermission(userRole, resource, action, context)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: { resource, action },
        userRole
      })
    }
    
    next()
  }
}

/**
 * Audit log entry for permission checks
 */
export interface AuditEntry {
  id: string
  userId: string
  userRole: UserRole
  action: string
  resource: string
  resourceId?: string
  siteId?: string
  success: boolean
  reason?: string
  timestamp: Date
  metadata?: Record<string, any>
}

/**
 * Log permission check for audit trail
 */
export function logPermissionCheck(
  userId: string,
  userRole: UserRole,
  action: string,
  resource: string,
  success: boolean,
  reason?: string,
  metadata?: Record<string, any>
): AuditEntry {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userRole,
    action,
    resource,
    success,
    reason,
    timestamp: new Date(),
    metadata
  }
}
