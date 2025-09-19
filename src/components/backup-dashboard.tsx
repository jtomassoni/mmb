'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Backup {
  backupId: string
  timestamp: string
  size: number
}

interface BackupDashboardProps {
  className?: string
}

export default function BackupDashboard({ className = '' }: BackupDashboardProps) {
  const { data: session } = useSession()
  const [backups, setBackups] = useState<Backup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isRestoring, setIsRestoring] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check if user has backup permissions
  const canManageBackups = session?.user && (session.user as any).role === 'SUPERADMIN'

  useEffect(() => {
    if (canManageBackups) {
      fetchBackups()
    }
  }, [canManageBackups])

  const fetchBackups = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/backup')
      const data = await response.json()
      
      if (data.success) {
        setBackups(data.backups)
      } else {
        setError(data.error || 'Failed to fetch backups')
      }
    } catch (err) {
      setError('Failed to fetch backups')
    } finally {
      setIsLoading(false)
    }
  }

  const createBackup = async () => {
    setIsCreating(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      
      if (data.success) {
        setSuccess(`Backup created successfully: ${data.backupId}`)
        fetchBackups() // Refresh the list
      } else {
        setError(data.error || 'Failed to create backup')
      }
    } catch (err) {
      setError('Failed to create backup')
    } finally {
      setIsCreating(false)
    }
  }

  const restoreBackup = async (backupId: string) => {
    setIsRestoring(backupId)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupId }),
      })
      const data = await response.json()
      
      if (data.success) {
        setSuccess(`Backup restored successfully: ${data.backupId}`)
      } else {
        setError(data.error || 'Failed to restore backup')
      }
    } catch (err) {
      setError('Failed to restore backup')
    } finally {
      setIsRestoring(null)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  if (!canManageBackups) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
        <p className="text-red-700">You don't have permission to manage backups.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Backup Management</h2>
        
        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Create Backup Button */}
        <div className="mb-6">
          <button
            onClick={createBackup}
            disabled={isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Backup...' : 'Create New Backup'}
          </button>
        </div>

        {/* Backups List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Backups</h3>
          
          {isLoading ? (
            <p className="text-gray-500">Loading backups...</p>
          ) : backups.length === 0 ? (
            <p className="text-gray-500">No backups found.</p>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.backupId}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{backup.backupId}</h4>
                    <p className="text-sm text-gray-600">
                      Created: {formatDate(backup.timestamp)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Size: {formatFileSize(backup.size)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => restoreBackup(backup.backupId)}
                      disabled={isRestoring === backup.backupId}
                      className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isRestoring === backup.backupId ? 'Restoring...' : 'Restore'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Backup Information */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Backup Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Backups include database and all media files</li>
            <li>• Automated backups run nightly via cron job</li>
            <li>• Backups are stored in cloud storage (S3/Backblaze)</li>
            <li>• Restore operations replace current data with backup data</li>
            <li>• Always test restores in a staging environment first</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
