'use client'

import { useState, useEffect } from 'react'
import { getActionableErrorInfo } from '../lib/domain-telemetry'

interface TelemetryStats {
  totalEvents: number
  failuresByType: Record<string, number>
  failuresBySeverity: Record<string, number>
  recentFailures: Array<{
    id: string
    domainId: string
    eventType: string
    severity: string
    message: string
    details?: Record<string, any>
    timestamp: string
    resolved: boolean
    resolvedAt?: string
    resolvedBy?: string
  }>
  domainsWithIssues: number
  averageResolutionTime?: number
}

interface FailureSummary {
  domainId: string
  hostname: string
  totalFailures: number
  lastFailure?: string
  failureTypes: Record<string, number>
  actionableErrors: string[]
  suggestedActions: string[]
  canRetry: boolean
  nextRetryAt?: string
}

export default function TelemetryDashboard() {
  const [stats, setStats] = useState<TelemetryStats | null>(null)
  const [failureSummaries, setFailureSummaries] = useState<Record<string, FailureSummary>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  useEffect(() => {
    loadTelemetryData()
  }, [])

  const loadTelemetryData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load overall stats
      const statsResponse = await fetch('/api/superadmin/domains/telemetry?action=stats')
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        setStats(statsData.stats)
        
        // Load failure summaries for domains with recent failures
        const summaries: Record<string, FailureSummary> = {}
        for (const failure of statsData.stats.recentFailures) {
          if (!summaries[failure.domainId]) {
            const summaryResponse = await fetch(`/api/superadmin/domains/telemetry?action=failure-summary&domainId=${failure.domainId}`)
            const summaryData = await summaryResponse.json()
            if (summaryData.success) {
              summaries[failure.domainId] = summaryData.summary
            }
          }
        }
        setFailureSummaries(summaries)
      } else {
        setError('Failed to load telemetry data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const resolveEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/superadmin/domains/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve-event', eventId })
      })
      
      if (response.ok) {
        await loadTelemetryData() // Refresh data
      }
    } catch (err) {
      console.error('Failed to resolve event:', err)
    }
  }

  const resolveDomainEvents = async (domainId: string) => {
    try {
      const response = await fetch('/api/superadmin/domains/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve-domain-events', domainId })
      })
      
      if (response.ok) {
        await loadTelemetryData() // Refresh data
      }
    } catch (err) {
      console.error('Failed to resolve domain events:', err)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'error': return 'text-red-500 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'info': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading telemetry data</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <button
                  onClick={loadTelemetryData}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">No telemetry data available</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Domain Verification Telemetry</h2>
        <button
          onClick={loadTelemetryData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm font-medium text-gray-500">Total Events</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalEvents}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm font-medium text-gray-500">Domains with Issues</div>
          <div className="text-2xl font-bold text-red-600">{stats.domainsWithIssues}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm font-medium text-gray-500">Critical Issues</div>
          <div className="text-2xl font-bold text-red-600">{stats.failuresBySeverity.critical || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm font-medium text-gray-500">Avg Resolution Time</div>
          <div className="text-2xl font-bold text-gray-900">{formatDuration(stats.averageResolutionTime)}</div>
        </div>
      </div>

      {/* Failure Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Failures by Type</h3>
          <div className="space-y-2">
            {Object.entries(stats.failuresByType).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="text-sm text-gray-600">{type.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Failures by Severity</h3>
          <div className="space-y-2">
            {Object.entries(stats.failuresBySeverity).map(([severity, count]) => (
              <div key={severity} className="flex justify-between">
                <span className={`text-sm px-2 py-1 rounded ${getSeverityColor(severity)}`}>
                  {severity}
                </span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Failures */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Failures</h3>
        </div>
        <div className="divide-y">
          {stats.recentFailures.map((failure) => {
            const summary = failureSummaries[failure.domainId]
            const errorInfo = getActionableErrorInfo(failure.eventType as any, failure.message, failure.details)
            
            return (
              <div key={failure.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(failure.severity)}`}>
                      {failure.severity}
                    </span>
                    <span className="text-sm text-gray-600">{failure.eventType.replace(/_/g, ' ')}</span>
                    <span className="text-sm text-gray-500">{formatTimestamp(failure.timestamp)}</span>
                  </div>
                  <div className="flex space-x-2">
                    {!failure.resolved && (
                      <button
                        onClick={() => resolveEvent(failure.id)}
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                      >
                        Resolve
                      </button>
                    )}
                    {summary && (
                      <button
                        onClick={() => setSelectedDomain(selectedDomain === failure.domainId ? null : failure.domainId)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                      >
                        {selectedDomain === failure.domainId ? 'Hide' : 'Details'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-900 mb-2">
                  <strong>{summary?.hostname || failure.domainId}</strong>: {failure.message}
                </div>

                {selectedDomain === failure.domainId && summary && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <h4 className="font-medium text-sm mb-2">Failure Summary</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Total Failures:</strong> {summary.totalFailures}</div>
                      <div><strong>Last Failure:</strong> {summary.lastFailure ? formatTimestamp(summary.lastFailure) : 'N/A'}</div>
                      <div><strong>Can Retry:</strong> {summary.canRetry ? 'Yes' : 'No'}</div>
                      {summary.nextRetryAt && (
                        <div><strong>Next Retry:</strong> {formatTimestamp(summary.nextRetryAt)}</div>
                      )}
                    </div>
                    
                    {errorInfo.actionable && (
                      <div className="mt-3">
                        <h5 className="font-medium text-sm mb-1">Suggested Actions:</h5>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {errorInfo.actions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {summary.suggestedActions.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium text-sm mb-1">Additional Actions:</h5>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {summary.suggestedActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-3 flex space-x-2">
                      {summary.canRetry && (
                        <button
                          onClick={() => {
                            // TODO: Implement retry functionality
                            console.log('Retry verification for', failure.domainId)
                          }}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                          Retry Verification
                        </button>
                      )}
                      <button
                        onClick={() => resolveDomainEvents(failure.domainId)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Resolve All Events
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
