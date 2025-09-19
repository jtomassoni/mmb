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
  const [stats] = useState<HealthStats>({
    activeSites: 1,
    last7dEdits: 12,
    eventsThisWeek: 3,
    specialsCount: 30,
    uptimePings: {
      total: 1440, // 24 hours * 60 minutes
      successful: 1438,
      averageResponseTime: 245
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading health data
    const loadHealthData = async () => {
      try {
        // In a real implementation, this would fetch from the health API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load health data:', error)
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
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Active Sites */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sites</h3>
        <p className="text-3xl font-bold text-blue-600">{stats.activeSites}</p>
        <p className="text-sm text-gray-500">Monaghan&apos;s Bar & Grill</p>
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
