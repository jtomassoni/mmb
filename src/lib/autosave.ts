/**
 * Optimistic Autosave System
 * 
 * Provides automatic saving functionality with conflict resolution,
 * offline support, and audit logging for restaurant management.
 */

import { UserRole } from './rbac'

export interface AutosaveConfig {
  debounceMs: number
  maxRetries: number
  retryDelayMs: number
  conflictResolution: 'last-write-wins' | 'manual' | 'merge'
  enableOfflineMode: boolean
  enableAuditLog: boolean
}

export interface AutosaveState {
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  lastError: string | null
  pendingChanges: Record<string, any>
  conflictData: ConflictData | null
  offlineQueue: OfflineChange[]
}

export interface ConflictData {
  localChanges: Record<string, any>
  serverChanges: Record<string, any>
  conflictFields: string[]
  resolution: 'pending' | 'resolved' | 'overridden'
}

export interface OfflineChange {
  id: string
  resource: string
  resourceId: string
  action: 'create' | 'update' | 'delete'
  data: Record<string, any>
  timestamp: Date
  retryCount: number
}

export interface AutosaveOptions {
  resource: string
  resourceId: string
  userId: string
  userRole: UserRole
  siteId: string
  endpoint: string
  config?: Partial<AutosaveConfig>
}

const defaultConfig: AutosaveConfig = {
  debounceMs: 2000, // 2 seconds
  maxRetries: 3,
  retryDelayMs: 1000,
  conflictResolution: 'last-write-wins',
  enableOfflineMode: true,
  enableAuditLog: true
}

/**
 * Autosave manager class
 */
export class AutosaveManager {
  private config: AutosaveConfig
  private state: AutosaveState
  private debounceTimer: NodeJS.Timeout | null = null
  private retryTimer: NodeJS.Timeout | null = null
  private options: AutosaveOptions
  private listeners: Map<string, (state: AutosaveState) => void> = new Map()

  constructor(options: AutosaveOptions) {
    this.options = options
    this.config = { ...defaultConfig, ...options.config }
    this.state = this.initializeState()
  }

  private initializeState(): AutosaveState {
    return {
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      lastError: null,
      pendingChanges: {},
      conflictData: null,
      offlineQueue: []
    }
  }

  /**
   * Update data and trigger autosave
   */
  updateData(changes: Record<string, any>): void {
    this.state.isDirty = true
    this.state.pendingChanges = { ...this.state.pendingChanges, ...changes }
    this.state.lastError = null

    this.notifyListeners()
    this.scheduleSave()
  }

  /**
   * Schedule autosave with debouncing
   */
  private scheduleSave(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.performSave()
    }, this.config.debounceMs)
  }

  /**
   * Perform the actual save operation
   */
  private async performSave(): Promise<void> {
    if (!this.state.isDirty || this.state.isSaving) {
      return
    }

    this.state.isSaving = true
    this.notifyListeners()

    try {
      const response = await this.sendToServer(this.state.pendingChanges)
      
      if (response.success) {
        this.handleSaveSuccess(response.data)
      } else if (response.conflict && response.conflictData) {
        this.handleConflict(response.conflictData)
      } else {
        this.handleSaveError(response.error || 'Unknown error')
      }
    } catch (error) {
      this.handleSaveError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Send data to server
   */
  private async sendToServer(data: Record<string, any>): Promise<{
    success: boolean
    data?: any
    conflict?: boolean
    conflictData?: ConflictData
    error?: string
  }> {
    const payload = {
      resource: this.options.resource,
      resourceId: this.options.resourceId,
      data,
      userId: this.options.userId,
      userRole: this.options.userRole,
      siteId: this.options.siteId,
      timestamp: new Date().toISOString()
    }

    try {
      const response = await fetch(this.options.endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        if (response.status === 409) {
          // Conflict detected
          const conflictData = await response.json()
          return {
            success: false,
            conflict: true,
            conflictData: conflictData.conflictData
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      // Handle offline mode
      if (this.config.enableOfflineMode && !navigator.onLine) {
        this.queueOfflineChange(data)
        return {
          success: true,
          data: { offline: true }
        }
      }

      throw error
    }
  }

  /**
   * Handle successful save
   */
  private handleSaveSuccess(data: any): void {
    this.state.isDirty = false
    this.state.isSaving = false
    this.state.lastSaved = new Date()
    this.state.lastError = null
    this.state.pendingChanges = {}
    this.state.conflictData = null

    this.notifyListeners()
    this.logAuditEvent('save_success', data)
  }

  /**
   * Handle save conflict
   */
  private handleConflict(conflictData: ConflictData): void {
    this.state.isSaving = false
    this.state.conflictData = conflictData

    this.notifyListeners()
    this.logAuditEvent('save_conflict', conflictData)
  }

  /**
   * Handle save error
   */
  private handleSaveError(error: string): void {
    this.state.isSaving = false
    this.state.lastError = error

    this.notifyListeners()
    this.logAuditEvent('save_error', { error })

    // Schedule retry if retries remaining
    if (this.state.pendingChanges && Object.keys(this.state.pendingChanges).length > 0) {
      this.scheduleRetry()
    }
  }

  /**
   * Schedule retry with exponential backoff
   */
  private scheduleRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }

    const retryCount = this.getRetryCount()
    if (retryCount >= this.config.maxRetries) {
      this.state.lastError = 'Max retries exceeded'
      this.notifyListeners()
      return
    }

    const delay = this.config.retryDelayMs * Math.pow(2, retryCount)
    this.retryTimer = setTimeout(() => {
      this.performSave()
    }, delay)
  }

  /**
   * Resolve conflict
   */
  resolveConflict(resolution: 'local' | 'server' | 'merge', mergedData?: Record<string, any>): void {
    if (!this.state.conflictData) return

    switch (resolution) {
      case 'local':
        this.state.conflictData.resolution = 'overridden'
        this.performSave()
        break
      
      case 'server':
        this.state.conflictData.resolution = 'resolved'
        this.state.pendingChanges = this.state.conflictData.serverChanges
        this.state.isDirty = true
        break
      
      case 'merge':
        if (mergedData) {
          this.state.conflictData.resolution = 'resolved'
          this.state.pendingChanges = mergedData
          this.state.isDirty = true
        }
        break
    }

    this.state.conflictData = null
    this.notifyListeners()
    this.logAuditEvent('conflict_resolved', { resolution })
  }

  /**
   * Queue change for offline processing
   */
  private queueOfflineChange(data: Record<string, any>): void {
    const offlineChange: OfflineChange = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resource: this.options.resource,
      resourceId: this.options.resourceId,
      action: 'update',
      data,
      timestamp: new Date(),
      retryCount: 0
    }

    this.state.offlineQueue.push(offlineChange)
    this.notifyListeners()
  }

  /**
   * Process offline queue when back online
   */
  async processOfflineQueue(): Promise<void> {
    if (!navigator.onLine || this.state.offlineQueue.length === 0) {
      return
    }

    const queue = [...this.state.offlineQueue]
    this.state.offlineQueue = []

    for (const change of queue) {
      try {
        await this.sendToServer(change.data)
        this.logAuditEvent('offline_sync_success', change)
      } catch (error) {
        // Re-queue failed changes
        change.retryCount++
        if (change.retryCount < this.config.maxRetries) {
          this.state.offlineQueue.push(change)
        } else {
          this.logAuditEvent('offline_sync_failed', { change, error })
        }
      }
    }

    this.notifyListeners()
  }

  /**
   * Get current state
   */
  getState(): AutosaveState {
    return { ...this.state }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listenerId: string, callback: (state: AutosaveState) => void): void {
    this.listeners.set(listenerId, callback)
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(listenerId: string): void {
    this.listeners.delete(listenerId)
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.getState())
      } catch (error) {
        console.error('Autosave listener error:', error)
      }
    })
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    // This would typically come from your auth system
    return localStorage.getItem('auth_token') || ''
  }

  /**
   * Get retry count from localStorage
   */
  private getRetryCount(): number {
    const key = `autosave_retry_${this.options.resource}_${this.options.resourceId}`
    return parseInt(localStorage.getItem(key) || '0')
  }

  /**
   * Set retry count in localStorage
   */
  private setRetryCount(count: number): void {
    const key = `autosave_retry_${this.options.resource}_${this.options.resourceId}`
    localStorage.setItem(key, count.toString())
  }

  /**
   * Log audit event
   */
  private logAuditEvent(event: string, data: any): void {
    if (!this.config.enableAuditLog) return

    const auditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.options.userId,
      userRole: this.options.userRole,
      action: event,
      resource: this.options.resource,
      resourceId: this.options.resourceId,
      siteId: this.options.siteId,
      success: event.includes('success'),
      timestamp: new Date(),
      metadata: data
    }

    // Send to audit API
    this.sendAuditLog(auditEntry)
  }

  /**
   * Send audit log to server
   */
  private async sendAuditLog(auditEntry: any): Promise<void> {
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(auditEntry)
      })
    } catch (error) {
      console.error('Failed to send audit log:', error)
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }
    this.listeners.clear()
  }
}

/**
 * Create autosave manager instance
 */
export function createAutosaveManager(options: AutosaveOptions): AutosaveManager {
  return new AutosaveManager(options)
}

/**
 * Hook for React components
 */
export function useAutosave(options: AutosaveOptions) {
  const [state, setState] = React.useState<AutosaveState>({
    isDirty: false,
    isSaving: false,
    lastSaved: null,
    lastError: null,
    pendingChanges: {},
    conflictData: null,
    offlineQueue: []
  })

  const managerRef = React.useRef<AutosaveManager | null>(null)

  React.useEffect(() => {
    managerRef.current = createAutosaveManager(options)
    
    const listenerId = 'react-hook'
    managerRef.current.subscribe(listenerId, setState)

    return () => {
      if (managerRef.current) {
        managerRef.current.unsubscribe(listenerId)
        managerRef.current.destroy()
      }
    }
  }, [options.resource, options.resourceId])

  const updateData = React.useCallback((changes: Record<string, any>) => {
    managerRef.current?.updateData(changes)
  }, [])

  const resolveConflict = React.useCallback((resolution: 'local' | 'server' | 'merge', mergedData?: Record<string, any>) => {
    managerRef.current?.resolveConflict(resolution, mergedData)
  }, [])

  return {
    ...state,
    updateData,
    resolveConflict
  }
}

// React import for the hook
import React from 'react'
