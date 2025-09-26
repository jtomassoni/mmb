'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAutosave } from '../lib/autosave'
import { useAuditLog } from '../lib/audit-log'
import { hasPermission, UserRole } from '../lib/rbac'
import UndoRollback from './undo-rollback'

interface SelfServeEditorProps {
  resource: string
  resourceId: string
  userId: string
  userRole: UserRole
  siteId: string
  initialData: Record<string, any>
  fields: EditorField[]
  onSave?: (data: Record<string, any>) => void
  onError?: (error: string) => void
  className?: string
}

interface EditorField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'checkbox' | 'url' | 'email'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: (value: any) => string | null
  disabled?: boolean
  helpText?: string
}

export default function SelfServeEditor({
  resource,
  resourceId,
  userId,
  userRole,
  siteId,
  initialData,
  fields,
  onSave,
  onError,
  className = ''
}: SelfServeEditorProps) {
  const [data, setData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Check permissions
  const canEdit = hasPermission(userRole, resource, 'update')
  const canCreate = hasPermission(userRole, resource, 'create')
  const canDelete = hasPermission(userRole, resource, 'delete')

  // Autosave configuration
  const autosaveOptions = {
    resource,
    resourceId,
    userId,
    userRole,
    siteId,
    endpoint: `/api/${resource}/${resourceId}`,
    config: {
      debounceMs: 2000,
      maxRetries: 3,
      retryDelayMs: 1000,
      conflictResolution: 'last-write-wins' as const,
      enableOfflineMode: true,
      enableAuditLog: true
    }
  }

  const autosaveState = useAutosave(autosaveOptions)
  const auditLog = useAuditLog()

  // Update autosave when data changes
  useEffect(() => {
    if (autosaveState.isDirty) {
      autosaveState.updateData(data)
    }
  }, [data, autosaveState])

  // Handle autosave success
  useEffect(() => {
    if (autosaveState.lastSaved && onSave) {
      onSave(data)
    }
  }, [autosaveState.lastSaved, data, onSave])

  // Handle autosave errors
  useEffect(() => {
    if (autosaveState.lastError && onError) {
      onError(autosaveState.lastError)
    }
  }, [autosaveState.lastError, onError])

  // Validate field
  const validateField = useCallback((field: EditorField, value: any): string | null => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`
    }

    if (field.validation) {
      return field.validation(value)
    }

    return null
  }, [])

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    setIsValidating(true)
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      const error = validateField(field, data[field.name])
      if (error) {
        newErrors[field.name] = error
      }
    })

    setErrors(newErrors)
    setIsValidating(false)
    return Object.keys(newErrors).length === 0
  }, [fields, data, validateField])

  // Handle field change
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setData(prev => ({ ...prev, [fieldName]: value }))
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }, [errors])

  // Handle manual save
  const handleManualSave = useCallback(async () => {
    if (!validateAllFields()) {
      return
    }

    try {
      await auditLog.logAction('manual_save', resource, {
        userId,
        userRole,
        resourceId,
        siteId,
        oldValue: initialData,
        newValue: data,
        success: true
      } as any)

      // Trigger autosave
      autosaveState.updateData(data)
    } catch (error) {
      console.error('Manual save error:', error)
      if (onError) {
        onError(error instanceof Error ? error.message : 'Save failed')
      }
    }
  }, [validateAllFields, auditLog, resource, userId, userRole, resourceId, siteId, initialData, data, autosaveState, onError])

  // Handle conflict resolution
  const handleConflictResolution = useCallback((resolution: 'local' | 'server' | 'merge') => {
    if (resolution === 'merge') {
      // For merge, we'd need to implement a merge strategy
      // For now, we'll just use local changes
      autosaveState.resolveConflict('local')
    } else {
      autosaveState.resolveConflict(resolution)
    }
  }, [autosaveState])

  if (!canEdit && !canCreate) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">You don't have permission to edit this resource.</p>
      </div>
    )
  }

  // Render field
  const renderField = useCallback((field: EditorField) => {
    const value = data[field.name] || ''
    const error = errors[field.name]
    const isDisabled = field.disabled || autosaveState.isSaving

    const baseClasses = `
      w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
      ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    `

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            key={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            className={`${baseClasses} min-h-[100px] resize-vertical`}
            rows={4}
          />
        )

      case 'number':
        return (
          <input
            key={field.name}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            className={baseClasses}
          />
        )

      case 'date':
        return (
          <input
            key={field.name}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={isDisabled}
            className={baseClasses}
          />
        )

      case 'time':
        return (
          <input
            key={field.name}
            type="time"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={isDisabled}
            className={baseClasses}
          />
        )

      case 'select':
        return (
          <select
            key={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={isDisabled}
            className={baseClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              disabled={isDisabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        )

      case 'url':
        return (
          <input
            key={field.name}
            type="url"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            className={baseClasses}
          />
        )

      case 'email':
        return (
          <input
            key={field.name}
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            className={baseClasses}
          />
        )

      default: // text
        return (
          <input
            key={field.name}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            className={baseClasses}
          />
        )
    }
  }, [data, errors, autosaveState.isSaving, handleFieldChange])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Undo Rollback Component */}
      <UndoRollback
        resource={resource}
        resourceId={resourceId}
        siteId={siteId}
        userId={userId}
        userRole={userRole}
        onRollback={(success, error) => {
          if (success) {
            // Refresh the editor data after successful rollback
            window.location.reload()
          } else if (error) {
            console.error('Rollback failed:', error)
          }
        }}
      />

      {/* Status Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {autosaveState.isSaving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              <span className="text-sm text-gray-600">
                {autosaveState.isSaving ? 'Saving...' : 
                 autosaveState.isDirty ? 'Unsaved changes' : 
                 autosaveState.lastSaved ? 'All changes saved' : 'Ready'}
              </span>
            </div>
            
            {autosaveState.lastSaved && (
              <span className="text-xs text-gray-500">
                Last saved: {autosaveState.lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          {autosaveState.lastError && (
            <div className="text-sm text-red-600">
              Error: {autosaveState.lastError}
            </div>
          )}
        </div>
      </div>

      {/* Conflict Resolution */}
      {autosaveState.conflictData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Conflict Detected
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            Another user has made changes to this resource. How would you like to resolve this conflict?
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => handleConflictResolution('local')}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Keep My Changes
            </button>
            <button
              onClick={() => handleConflictResolution('server')}
              className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
            >
              Use Server Changes
            </button>
            <button
              onClick={() => handleConflictResolution('merge')}
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              Merge Changes
            </button>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {renderField(field)}
            
            {errors[field.name] && (
              <p className="text-sm text-red-600">{errors[field.name]}</p>
            )}
            
            {field.helpText && (
              <p className="text-sm text-gray-500">{field.helpText}</p>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={handleManualSave}
            disabled={autosaveState.isSaving || isValidating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {autosaveState.isSaving ? 'Saving...' : 'Save Now'}
          </button>
          
          <button
            onClick={() => setData(initialData)}
            disabled={autosaveState.isSaving}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>

        {canDelete && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this item?')) {
                // Handle delete
                auditLog.logAction('delete', resource, {
                  userId,
                  userRole,
                  resourceId,
                  siteId,
                  oldValue: data,
                  success: true
                } as any)
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        )}
      </div>

      {/* Offline Queue */}
      {autosaveState.offlineQueue.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            Offline Changes
          </h3>
          <p className="text-sm text-blue-700">
            {autosaveState.offlineQueue.length} changes are queued for when you're back online.
          </p>
        </div>
      )}
    </div>
  )
}
