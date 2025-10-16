'use client'

import { useState, useEffect } from 'react'

interface CacheStatus {
  success: boolean
  data: any
  source: string
  lastUpdated: string
  cacheAge: number
}

export function BroncosCacheMonitor() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchCacheStatus = async () => {
    try {
      const response = await fetch('/api/broncos?type=games')
      const data = await response.json()
      setCacheStatus(data)
    } catch (error) {
      console.error('Failed to fetch cache status:', error)
    }
  }

  const refreshCache = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/broncos?action=refresh', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        // Refresh the status
        await fetchCacheStatus()
      }
    } catch (error) {
      console.error('Failed to refresh cache:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCacheStatus()
    // Refresh status every 5 minutes
    const interval = setInterval(fetchCacheStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (!cacheStatus) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const isStale = cacheStatus.cacheAge > 30 // 30 minutes

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Broncos Data Cache</h3>
        <button
          onClick={refreshCache}
          disabled={isRefreshing}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            isRefreshing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isStale ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {isStale ? 'Stale' : 'Fresh'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">Source:</span>
          <span className="text-sm text-gray-900 font-medium capitalize">
            {cacheStatus.source || 'Unknown'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">Games Count:</span>
          <span className="text-sm text-gray-900 font-semibold">
            {cacheStatus.data?.length || cacheStatus.total || 0}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">Last Updated:</span>
          <span className="text-sm text-gray-900 font-medium">
            {cacheStatus.lastUpdated ? 
              new Date(cacheStatus.lastUpdated).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }) : 
              'Never'
            }
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-700">Cache Age:</span>
          <span className="text-sm text-gray-900 font-medium">
            {cacheStatus.cacheAge !== null && cacheStatus.cacheAge !== undefined ? 
              `${Math.round(cacheStatus.cacheAge)} min` : 
              'Unknown'
            }
          </span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex items-start">
            <span className="font-semibold text-blue-900 min-w-[110px]">Auto-refresh:</span>
            <span>Every 30 minutes via Vercel Cron</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold text-blue-900 min-w-[110px]">API Limit:</span>
            <span>No limit (ESPN public API)</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold text-blue-900 min-w-[110px]">Data Source:</span>
            <span>ESPN API with fallback to hardcoded schedule</span>
          </div>
        </div>
      </div>
    </div>
  )
}
