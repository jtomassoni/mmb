'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface AnalyticsData {
  siteId: string
  date: string
  period: string
  pageviews: number
  uniqueVisitors: number
  sessions: number
  avgSessionDuration: number
  ctaClicks: number
  specialViews: number
  menuViews: number
  eventViews: number
  topPages: Array<{ page: string; views: number }>
  topSpecials: Array<{ specialId: string; views: number }>
  topEvents: Array<{ eventId: string; views: number }>
  deviceTypes: Array<{ type: string; count: number }>
  browsers: Array<{ browser: string; count: number }>
}

interface RealtimeData {
  pageviews: number
  uniqueVisitors: number
  topPages: Array<{ page: string; views: number }>
  topSpecials: Array<{ specialId: string; views: number }>
  topEvents: Array<{ eventId: string; views: number }>
}

interface AnalyticsDashboardProps {
  siteId: string
  className?: string
}

interface FilterOptions {
  eventTypes: string[]
  pages: string[]
  devices: string[]
  browsers: string[]
}

export default function AnalyticsDashboard({ siteId, className = '' }: AnalyticsDashboardProps) {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [realtime, setRealtime] = useState<RealtimeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  })
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [filters, setFilters] = useState<FilterOptions>({
    eventTypes: [],
    pages: [],
    devices: [],
    browsers: []
  })
  const [showFilters, setShowFilters] = useState(false)
  const [presetRange, setPresetRange] = useState<string>('custom')

  // Check if user has analytics permissions
  const canViewAnalytics = session?.user && 
    ((session.user as any).role === 'SUPERADMIN' || 
     (session.user as any).role === 'OWNER' || 
     (session.user as any).role === 'MANAGER')

  useEffect(() => {
    if (canViewAnalytics) {
      fetchAnalytics()
    }
  }, [siteId, dateRange, period, canViewAnalytics])

  // Handle preset date ranges
  const handlePresetRange = (preset: string) => {
    setPresetRange(preset)
    const today = new Date()
    const start = new Date()

    switch (preset) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        break
      case 'yesterday':
        start.setDate(today.getDate() - 1)
        start.setHours(0, 0, 0, 0)
        today.setDate(today.getDate() - 1)
        today.setHours(23, 59, 59, 999)
        break
      case '7days':
        start.setDate(today.getDate() - 7)
        break
      case '30days':
        start.setDate(today.getDate() - 30)
        break
      case '90days':
        start.setDate(today.getDate() - 90)
        break
      case 'thisMonth':
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        break
      case 'lastMonth':
        start.setMonth(today.getMonth() - 1, 1)
        start.setHours(0, 0, 0, 0)
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0)
        today.setMonth(today.getMonth() - 1, lastDay.getDate())
        today.setHours(23, 59, 59, 999)
        break
      case 'thisYear':
        start.setMonth(0, 1)
        start.setHours(0, 0, 0, 0)
        break
      default:
        return // Keep custom range
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    })
  }

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        siteId,
        startDate: dateRange.start,
        endDate: dateRange.end,
        period
      })

      const response = await fetch(`/api/analytics/dashboard?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
        setRealtime(data.realtime)
      } else {
        setError(data.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError('Failed to fetch analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!canViewAnalytics) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
        <p className="text-red-700">You don't have permission to view analytics.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
        
        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Preset Date Ranges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Date Ranges</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: 'Today' },
                { key: 'yesterday', label: 'Yesterday' },
                { key: '7days', label: 'Last 7 days' },
                { key: '30days', label: 'Last 30 days' },
                { key: '90days', label: 'Last 90 days' },
                { key: 'thisMonth', label: 'This month' },
                { key: 'lastMonth', label: 'Last month' },
                { key: 'thisYear', label: 'This year' },
                { key: 'custom', label: 'Custom range' }
              ].map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => handlePresetRange(preset.key)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    presetRange === preset.key
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {presetRange === 'custom' && (
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Period and Filters */}
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-md border ${
                  showFilters
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            <div>
              <button
                onClick={fetchAnalytics}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Types</label>
                  <div className="space-y-1">
                    {['pageview', 'cta_click', 'special_view', 'menu_view', 'event_view'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.eventTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                eventTypes: [...prev.eventTypes, type]
                              }))
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                eventTypes: prev.eventTypes.filter(t => t !== type)
                              }))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                  <div className="space-y-1">
                    {['/', '/specials', '/menu', '/events', '/about'].map((page) => (
                      <label key={page} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.pages.includes(page)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                pages: [...prev.pages, page]
                              }))
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                pages: prev.pages.filter(p => p !== page)
                              }))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{page}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Types</label>
                  <div className="space-y-1">
                    {['desktop', 'mobile', 'tablet'].map((device) => (
                      <label key={device} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.devices.includes(device)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                devices: [...prev.devices, device]
                              }))
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                devices: prev.devices.filter(d => d !== device)
                              }))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{device}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Browsers</label>
                  <div className="space-y-1">
                    {['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'].map((browser) => (
                      <label key={browser} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.browsers.includes(browser)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                browsers: [...prev.browsers, browser]
                              }))
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                browsers: prev.browsers.filter(b => b !== browser)
                              }))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{browser}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setFilters({ eventTypes: [], pages: [], devices: [], browsers: [] })}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={fetchAnalytics}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Real-time Stats */}
        {realtime && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Real-time (Last 24 Hours)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800">Pageviews</h4>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(realtime.pageviews)}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800">Unique Visitors</h4>
                <p className="text-2xl font-bold text-green-900">{formatNumber(realtime.uniqueVisitors)}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-800">Top Page</h4>
                <p className="text-lg font-bold text-purple-900">
                  {realtime.topPages[0]?.page || 'N/A'}
                </p>
                <p className="text-sm text-purple-700">
                  {realtime.topPages[0]?.views || 0} views
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Historical Data */}
        {analytics.length > 0 ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-800">Total Pageviews</h4>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(analytics.reduce((sum, day) => sum + day.pageviews, 0))}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-800">Total Visitors</h4>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(analytics.reduce((sum, day) => sum + day.uniqueVisitors, 0))}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-800">CTA Clicks</h4>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(analytics.reduce((sum, day) => sum + day.ctaClicks, 0))}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-800">Avg Session</h4>
                  <p className="text-xl font-bold text-gray-900">
                    {formatDuration(Math.round(analytics.reduce((sum, day) => sum + day.avgSessionDuration, 0) / analytics.length))}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Pages */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Top Pages</h4>
                <div className="space-y-2">
                  {realtime?.topPages.slice(0, 5).map((page, index) => (
                    <div key={page.page} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{page.page}</span>
                      <span className="text-sm font-medium text-gray-900">{page.views}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Specials */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Top Specials</h4>
                <div className="space-y-2">
                  {realtime?.topSpecials.slice(0, 5).map((special, index) => (
                    <div key={special.specialId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Special {special.specialId}</span>
                      <span className="text-sm font-medium text-gray-900">{special.views}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Events */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Top Events</h4>
                <div className="space-y-2">
                  {realtime?.topEvents.slice(0, 5).map((event, index) => (
                    <div key={event.eventId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Event {event.eventId}</span>
                      <span className="text-sm font-medium text-gray-900">{event.views}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pageviews</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitors</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTA Clicks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.map((day) => (
                      <tr key={day.date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(day.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(day.pageviews)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(day.uniqueVisitors)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(day.sessions)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(day.avgSessionDuration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(day.ctaClicks)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No analytics data available for the selected period.</p>
          </div>
        )}
      </div>
    </div>
  )
}
