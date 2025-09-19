'use client'

import { useState, useEffect } from 'react'

interface HealthStats {
  activeSites: number
  last7dEdits: number
  eventsThisWeek: number
  specialsCount: number
  uptimePings: {
    total: number
    successful: number
    averageResponseTime: number
  }
}

export function HealthDashboard() {
  const [stats, setStats] = useState<HealthStats>({
    activeSites: 0,
    last7dEdits: 0,
    eventsThisWeek: 0,
    specialsCount: 0,
    uptimePings: {
      total: 0,
      successful: 0,
      averageResponseTime: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHealthData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/health/stats')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to load health data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load health data')
      } finally {
        setIsLoading(false)
      }
    }

    loadHealthData()
  }, [])

  const uptimePercentage = stats.uptimePings.total > 0 
    ? Math.round((stats.uptimePings.successful / stats.uptimePings.total) * 100)
    : 0

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Failed to load health data
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if we have any data
  const hasData = stats.activeSites > 0 || stats.last7dEdits > 0 || stats.eventsThisWeek > 0 || stats.specialsCount > 0 || stats.uptimePings.total > 0

  if (!hasData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              No health data available
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>Health monitoring data will appear here once sites are created and health checks are running.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Active Sites */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sites</h3>
        <p className="text-3xl font-bold text-blue-600">{stats.activeSites}</p>
        <p className="text-sm text-gray-500">
          {stats.activeSites === 1 ? 'Site' : 'Sites'} configured
        </p>
      </div>
      
      {/* Last 7d Edits */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Last 7d Edits</h3>
        <p className="text-3xl font-bold text-green-600">{stats.last7dEdits}</p>
        <p className="text-sm text-gray-500">Content updates</p>
      </div>
      
      {/* Events This Week */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Events This Week</h3>
        <p className="text-3xl font-bold text-purple-600">{stats.eventsThisWeek}</p>
        <p className="text-sm text-gray-500">Poker, Bingo, Broncos</p>
      </div>
      
      {/* Specials Count */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Specials Count</h3>
        <p className="text-3xl font-bold text-orange-600">{stats.specialsCount}</p>
        <p className="text-sm text-gray-500">Rotating specials</p>
      </div>

      {/* Uptime Pings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Uptime Pings</h3>
        <p className="text-3xl font-bold text-green-600">{uptimePercentage}%</p>
        <p className="text-sm text-gray-500">
          {stats.uptimePings.successful}/{stats.uptimePings.total} successful
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Avg response: {stats.uptimePings.averageResponseTime}ms
        </p>
      </div>
    </div>
  )
}
