'use client'

import React, { useState, useEffect } from 'react'
import { useAuditLog } from '../lib/audit-log'

interface UndoRollbackProps {
  resource: string
  resourceId: string
  siteId: string
  userId: string
  userRole: string
  onRollback?: (success: boolean, error?: string) => void
  className?: string
}

interface RecentChange {
  id: string
  action: string
  resource: string
  resourceId: string
  timestamp: Date
  timeRemaining: number
  canRollback: boolean
  changes: Record<string, { old: any; new: any }>
}

export default function UndoRollback({
  resource,
  resourceId,
  siteId,
  userId,
  userRole,
  onRollback,
  className = ''
}: UndoRollbackProps) {
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const auditLog = useAuditLog()

  // Fetch recent changes for this resource
  useEffect(() => {
    const fetchRecentChanges = async () => {
      try {
        const params = new URLSearchParams({
          resource,
          resourceId,
          siteId,
          limit: '5'
        })

        const response = await fetch(`/api/audit/recent?${params}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        
        const changes: RecentChange[] = result.changes.map((entry: any) => ({
          id: entry.id,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId || '',
          timestamp: new Date(entry.timestamp),
          timeRemaining: entry.timeRemaining,
          canRollback: entry.canRollback,
          changes: entry.changes || {}
        }))

        setRecentChanges(changes)
      } catch (err) {
        console.error('Failed to fetch recent changes:', err)
        setError('Failed to load recent changes')
      }
    }

    fetchRecentChanges()
    
    // Refresh every 30 seconds to update timers
    const interval = setInterval(fetchRecentChanges, 30000)
    return () => clearInterval(interval)
  }, [resource, resourceId, siteId])

  // Update timers every second
  useEffect(() => {
    const timer = setInterval(() => {
      setRecentChanges(prev => 
        prev.map(change => {
          const now = new Date()
          const entryTime = new Date(change.timestamp)
          const timeDiffMs = now.getTime() - entryTime.getTime()
          const timeDiffMinutes = timeDiffMs / (1000 * 60)
          const timeRemaining = Math.max(0, 20 - timeDiffMinutes)

          return {
            ...change,
            timeRemaining,
            canRollback: timeRemaining > 0
          }
        }).filter(change => change.canRollback)
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRollback = async (changeId: string, reason: string = 'User requested rollback') => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await auditLog.rollbackAction({
        auditLogId: changeId,
        userId,
        userRole: userRole as any,
        reason,
        notifyUsers: false
      })

      if (result.success) {
        // Remove the rolled back change from the list
        setRecentChanges(prev => prev.filter(change => change.id !== changeId))
        onRollback?.(true)
      } else {
        setError(result.error || 'Rollback failed')
        onRollback?.(false, result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onRollback?.(false, errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes <= 0) return 'Expired'
    
    const wholeMinutes = Math.floor(minutes)
    const seconds = Math.floor((minutes - wholeMinutes) * 60)
    
    if (wholeMinutes > 0) {
      return `${wholeMinutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const getActionDescription = (action: string): string => {
    switch (action) {
      case 'create': return 'Created'
      case 'update': return 'Updated'
      case 'delete': return 'Deleted'
      default: return action
    }
  }

  if (recentChanges.length === 0) {
    return null
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-blue-900 mb-3">
        Recent Changes
      </h3>
      
      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {recentChanges.map((change) => (
          <div
            key={change.id}
            className="flex items-center justify-between bg-white border border-blue-200 rounded p-3"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {getActionDescription(change.action)} {change.resource}
              </div>
              <div className="text-xs text-gray-500">
                {change.timestamp.toLocaleString()}
              </div>
              {Object.keys(change.changes).length > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  Changed: {Object.keys(change.changes).join(', ')}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                <span className={`font-medium ${
                  change.timeRemaining < 5 ? 'text-red-600' : 
                  change.timeRemaining < 10 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {formatTimeRemaining(change.timeRemaining)}
                </span>
                <span className="text-gray-400 ml-1">left</span>
              </div>
              
              <button
                onClick={() => handleRollback(change.id)}
                disabled={isLoading || !change.canRollback}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  change.canRollback && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Undoing...' : 'Undo'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Changes can be undone within 20 minutes of being made.
      </div>
    </div>
  )
}
