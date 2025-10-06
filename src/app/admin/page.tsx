'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatTimeInTimezone, getRelativeTime, getCompanyTimezone } from '@/lib/timezone'
import { Breadcrumb, breadcrumbConfigs } from '@/components/breadcrumb'

interface ActivityLog {
  id: string
  action: string
  resource: string
  resourceId: string | null
  timestamp: string
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
  site: {
    id: string
    name: string
    timezone: string
  } | null
  changes: any
  metadata: any
}

export default function SiteAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    } else {
      fetchRecentActivity()
    }
  }, [session, status, router])

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/activity?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbConfigs.admin} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {session.user.role === 'SUPERADMIN' ? 'Super Admin Dashboard' : 'Site Admin Dashboard'}
          </h1>
          <p className="text-gray-600">
            {session.user.role === 'SUPERADMIN' 
              ? 'Manage all sites, users, and system settings' 
              : 'Manage your restaurant\'s content and settings'
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Welcome, {session.user.name || session.user.email} ({session.user.role})
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Specials</h3>
            <p className="text-3xl font-bold text-orange-600">12</p>
            <p className="text-sm text-gray-500">Currently featured</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Events</h3>
            <p className="text-3xl font-bold text-purple-600">3</p>
            <p className="text-sm text-gray-500">This week</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Menu Items</h3>
            <p className="text-3xl font-bold text-blue-600">45</p>
            <p className="text-sm text-gray-500">Total items</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Edits</h3>
            <p className="text-3xl font-bold text-green-600">8</p>
            <p className="text-sm text-gray-500">Last 7 days</p>
          </div>
        </div>

        {/* Main CMS Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Company Info & Settings */}
          <a 
            href="/admin/settings"
            className="block bg-white p-8 rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Company Info & Settings
              </h3>
              <p className="text-gray-600 text-sm">
                Business hours, contact info, site appearance, activity log, and user management
              </p>
            </div>
          </a>

          {/* Menu Management */}
          <a 
            href="/admin/menu"
            className="block bg-white p-8 rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                Menu Management
              </h3>
              <p className="text-gray-600 text-sm">
                Menu items, categories, images, and preview
              </p>
            </div>
          </a>

          {/* Specials & Events */}
          <a 
            href="/admin/specials-events"
            className="block bg-white p-8 rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Specials & Events
              </h3>
              <p className="text-gray-600 text-sm">
                Daily specials, events, entertainment, and Broncos games
              </p>
            </div>
          </a>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <button 
                onClick={fetchRecentActivity}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="animate-pulse bg-gray-200 w-8 h-8 rounded-full"></div>
                    <div className="flex-1">
                      <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                      <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((log) => {
                  const timezone = log.site?.timezone || getCompanyTimezone()
                  const relativeTime = getRelativeTime(log.timestamp, timezone)
                  const fullTime = formatTimeInTimezone(log.timestamp, timezone)
                  
                  return (
                    <div key={log.id} className="flex items-center space-x-4 group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          log.resource === 'specials' ? 'bg-orange-100' :
                          log.resource === 'events' ? 'bg-purple-100' :
                          log.resource === 'menu' ? 'bg-blue-100' :
                          log.resource === 'hours' ? 'bg-green-100' :
                          log.resource === 'users' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          <span className={`text-sm ${
                            log.resource === 'specials' ? 'text-orange-600' :
                            log.resource === 'events' ? 'text-purple-600' :
                            log.resource === 'menu' ? 'text-blue-600' :
                            log.resource === 'hours' ? 'text-green-600' :
                            log.resource === 'users' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {log.resource === 'specials' ? '🍽️' :
                             log.resource === 'events' ? '🎉' :
                             log.resource === 'menu' ? '📝' :
                             log.resource === 'hours' ? '🕒' :
                             log.resource === 'users' ? '👤' :
                             '📄'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{log.user.name || log.user.email}</span> ({log.user.role})
                          {' '}
                          <span className="capitalize">{log.action}d</span>
                          {' '}
                          <span className="font-medium">{log.resource}</span>
                          {log.resourceId && (
                            <span className="text-gray-500"> #{log.resourceId.slice(-6)}</span>
                          )}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span title={fullTime}>{relativeTime}</span>
                          <span>•</span>
                          <span>{timezone}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Activity will appear here as you make changes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
