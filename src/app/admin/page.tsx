'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatTimeInTimezone, getRelativeTime, getCompanyTimezone } from '@/lib/timezone'
import { AdminSubNav } from '@/components/admin-sub-nav'

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
  oldValue?: any
  newValue?: any
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
    } else if (session.user.mustResetPassword) {
      // User needs to reset their password first
      router.push('/reset-password')
    } else {
      fetchRecentActivity()
    }
  }, [session, status, router])

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/activity?limit=5&filter=all')
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
      <AdminSubNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Events */}
          <a 
            href="/admin/events"
            className="block bg-white p-8 rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
          </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Events
              </h3>
              <p className="text-gray-600 text-sm">
                Manage events, specials, and calendar preview
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
                          log.resource === 'site_settings' ? 'bg-indigo-100' :
                          log.resource === 'business_hours' ? 'bg-green-100' :
                          log.resource === 'special_day' ? 'bg-yellow-100' :
                          log.resource === 'menu' ? 'bg-blue-100' :
                          log.resource === 'menu_category' ? 'bg-cyan-100' :
                          log.resource === 'specials' ? 'bg-orange-100' :
                          log.resource === 'events' ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          <span className={`text-sm ${
                            log.resource === 'site_settings' ? 'text-indigo-600' :
                            log.resource === 'business_hours' ? 'text-green-600' :
                            log.resource === 'special_day' ? 'text-yellow-600' :
                            log.resource === 'menu' ? 'text-blue-600' :
                            log.resource === 'menu_category' ? 'text-cyan-600' :
                            log.resource === 'specials' ? 'text-orange-600' :
                            log.resource === 'events' ? 'text-purple-600' :
                            'text-gray-600'
                          }`}>
                            {(() => {
                              const iconClass = "w-5 h-5"
                              switch (log.resource) {
                                case 'site_settings':
                                  return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                case 'business_hours':
                                  return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                case 'special_day':
                                  return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                case 'menu':
                                  return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                case 'menu_category':
                                  return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                case 'specials':
                                  return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                case 'events':
                                  return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                default:
                                  return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              }
                            })()}
                          </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                            <span className="font-medium">{log.user.name || log.user.email}</span>
                            {' '}
                            <span className="lowercase">
                              {(() => {
                                const action = log.action.toLowerCase()
                                if (action === 'create') return 'created'
                                if (action === 'update') return 'updated'
                                if (action === 'delete') return 'deleted'
                                return action
                              })()}
                            </span>
                            {' '}
                            <span className="font-medium capitalize">
                              {log.resource === 'site_settings' ? 'Company Info' : log.resource.replace('_', ' ')}
                            </span>
                            {log.resource === 'menu' && log.metadata?.itemName && (
                              <span className="text-gray-600 ml-1">"{log.metadata.itemName}"</span>
                            )}
                            {log.resource === 'specials' && log.metadata?.specialName && (
                              <span className="text-gray-600 ml-1">"{log.metadata.specialName}"</span>
                            )}
                          </p>
                        
                        {/* Show specific changes if available */}
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                            <div className="font-medium text-gray-700 mb-1">Changes:</div>
                            {Object.entries(log.changes).map(([key, value]) => {
                              // Try to show before/after if we have oldValue data
                              const oldValue = log.oldValue && typeof log.oldValue === 'object' ? log.oldValue[key] : null
                              const newValue = value
                              
                              // Skip if values are the same (no actual change)
                              if (oldValue && oldValue === newValue) {
                                return null
                              }
                              
                              // Special handling for business hours (individual days)
                              if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(key) && typeof value === 'object' && value && 'old' in value && 'new' in value) {
                                const dayName = key.charAt(0).toUpperCase() + key.slice(1)
                                const oldHours = (value as any).old
                                const newHours = (value as any).new
                                
                                // Format hours for display
                                const formatHours = (hours: any) => {
                                  if (!hours) return 'No data'
                                  if (hours.closed) return 'Closed'
                                  if (!hours.open || !hours.close) return 'No hours set'
                                  return `${hours.open} - ${hours.close}`
                                }
                                
                                const oldFormatted = formatHours(oldHours)
                                const newFormatted = formatHours(newHours)
                                
                                return (
                                  <div key={key} className="flex items-start space-x-2 mb-1">
                                    <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                      {dayName}:
                                    </span>
                                    <div className="text-gray-500 break-words">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-red-600 line-through text-xs bg-red-50 px-1 rounded">
                                          {oldFormatted}
                                        </span>
                                        <span className="text-gray-400 text-xs">→</span>
                                        <span className="text-green-600 font-medium text-xs bg-green-50 px-1 rounded">
                                          {newFormatted}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              
                                // Handle specials formatting
                                if (log.resource === 'specials' && key === 'price') {
                                  const oldPrice = oldValue ? `$${(oldValue as number).toFixed(2)}` : 'No price'
                                  const newPrice = newValue ? `$${(newValue as number).toFixed(2)}` : 'No price'
                                  
                                  return (
                                    <div key={key} className="flex items-start space-x-2 mb-1">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        Price:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-red-600 line-through text-xs bg-red-50 px-1 rounded">
                                            {oldPrice}
                                          </span>
                                          <span className="text-gray-400 text-xs">→</span>
                                          <span className="text-green-600 font-medium text-xs bg-green-50 px-1 rounded">
                                            {newPrice}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                
                                if (log.resource === 'specials' && key === 'originalPrice') {
                                  const oldPrice = oldValue ? `$${(oldValue as number).toFixed(2)}` : 'No original price'
                                  const newPrice = newValue ? `$${(newValue as number).toFixed(2)}` : 'No original price'
                                  
                                  return (
                                    <div key={key} className="flex items-start space-x-2 mb-1">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        Original Price:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-red-600 line-through text-xs bg-red-50 px-1 rounded">
                                            {oldPrice}
                                          </span>
                                          <span className="text-gray-400 text-xs">→</span>
                                          <span className="text-green-600 font-medium text-xs bg-green-50 px-1 rounded">
                                            {newPrice}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                
                                if (log.resource === 'specials' && (key === 'startDate' || key === 'endDate')) {
                                  const oldDate = oldValue ? new Date(oldValue as string | number | Date).toLocaleDateString() : 'No date'
                                  const newDate = newValue ? new Date(newValue as string | number | Date).toLocaleDateString() : 'No date'
                                  const fieldName = key === 'startDate' ? 'Start Date' : 'End Date'
                                  
                                  return (
                                    <div key={key} className="flex items-start space-x-2 mb-1">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        {fieldName}:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-red-600 line-through text-xs bg-red-50 px-1 rounded">
                                            {oldDate}
                                          </span>
                                          <span className="text-gray-400 text-xs">→</span>
                                          <span className="text-green-600 font-medium text-xs bg-green-50 px-1 rounded">
                                            {newDate}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                
                                if (log.resource === 'specials' && key === 'isActive') {
                                  const oldStatus = oldValue ? 'Active' : 'Inactive'
                                  const newStatus = newValue ? 'Active' : 'Inactive'
                                  
                                  return (
                                    <div key={key} className="flex items-start space-x-2 mb-1">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        Status:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className={`line-through text-xs px-1 rounded ${
                                            oldValue ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
                                          }`}>
                                            {oldStatus}
                                          </span>
                                          <span className="text-gray-400 text-xs">→</span>
                                          <span className={`font-medium text-xs px-1 rounded ${
                                            newValue ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                          }`}>
                                            {newStatus}
                                          </span>
                                        </div>
                </div>
              </div>
                                  )
                                }
                                
                                // Handle menu item formatting
                                if (log.resource === 'menu' && key === 'price') {
                                  const oldPrice = oldValue ? `$${(oldValue as number).toFixed(2)}` : 'No price'
                                  const newPrice = `$${(newValue as number).toFixed(2)}`
                                  
                                  return (
                                    <div key={key} className="flex items-start space-x-2 mb-1">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        Price:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-red-600 line-through text-xs bg-red-50 px-1 rounded">
                                            {oldPrice}
                                          </span>
                                          <span className="text-gray-400 text-xs">→</span>
                                          <span className="text-green-600 font-medium text-xs bg-green-50 px-1 rounded">
                                            {newPrice}
                                          </span>
                                        </div>
                  </div>
                </div>
                                  )
                                }
                                
                                if (log.resource === 'menu' && key === 'isAvailable') {
                                  const oldStatus = oldValue ? 'Available' : 'Unavailable'
                                  const newStatus = newValue ? 'Available' : 'Unavailable'
                                  
                                  return (
                                    <div key={key} className="flex items-start space-x-2 mb-1">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        Status:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className={`line-through text-xs px-1 rounded ${
                                            oldValue ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
                                          }`}>
                                            {oldStatus}
                                          </span>
                                          <span className="text-gray-400 text-xs">→</span>
                                          <span className={`font-medium text-xs px-1 rounded ${
                                            newValue ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                          }`}>
                                            {newStatus}
                                          </span>
                </div>
              </div>
            </div>
                                  )
                                }
                                
                                // Handle business hours format (single object with all days)
                                if (key === 'businessHours' && typeof value === 'object' && value && !('old' in value) && !('new' in value)) {
                                // This is the current format - parse individual day changes
                                const oldBusinessHours = log.oldValue && typeof log.oldValue === 'object' ? log.oldValue[key] : null
                                
                                if (!oldBusinessHours) {
                                  // No old data to compare - skip
                                  return null
                                }
                                
                                // Find days that actually changed
                                const changedDays = Object.entries(value as Record<string, any>).filter(([day, newDayHours]) => {
                                  const oldDayHours = oldBusinessHours[day]
                                  return !oldDayHours || JSON.stringify(oldDayHours) !== JSON.stringify(newDayHours)
                                })
                                
                                if (changedDays.length === 0) {
                                  return null
                                }
                                
                                return (
                                  <div key={key} className="mb-2">
                                    <div className="font-medium text-gray-700 mb-1">Business Hours:</div>
                                    {changedDays.map(([day, newDayHours]) => {
                                      const oldDayHours = oldBusinessHours[day]
                                      const dayName = day.charAt(0).toUpperCase() + day.slice(1)
                                      
                                      // Format hours for display
                                      const formatHours = (hours: any) => {
                                        if (!hours) return 'No data'
                                        if (hours.closed) return 'Closed'
                                        if (!hours.open || !hours.close) return 'No hours set'
                                        return `${hours.open} - ${hours.close}`
                                      }
                                      
                                      const oldFormatted = formatHours(oldDayHours)
                                      const newFormatted = formatHours(newDayHours)
                                      
                                      return (
                                        <div key={day} className="ml-2 text-gray-600 mb-1">
                                          <span className="font-medium">{dayName}:</span>
                                          <div className="flex items-center space-x-2 ml-2">
                                            <span className="text-red-600 line-through text-xs bg-red-50 px-1 rounded">
                                              {oldFormatted}
                                            </span>
                                            <span className="text-gray-400 text-xs">→</span>
                                            <span className="text-green-600 font-medium text-xs bg-green-50 px-1 rounded">
                                              {newFormatted}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )
                              }
                              
                              return (
                                <div key={key} className="flex items-start space-x-2 mb-1">
                                  <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                  </span>
                                  <div className="text-gray-500 break-words">
                                    {oldValue && oldValue !== newValue ? (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-red-600 line-through text-xs bg-red-50 px-1 rounded">
                                          {String(oldValue)}
                                        </span>
                                        <span className="text-gray-400 text-xs">→</span>
                                        <span className="text-green-600 font-medium text-xs bg-green-50 px-1 rounded">
                                          {String(newValue)}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                    )}
          </div>
        </div>
                              )
                            }).filter(Boolean)}
                          </div>
                        )}
                        
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <span title={`${fullTime} (${timezone})`}>{relativeTime}</span>
                            <span>•</span>
                            <span>{timezone}</span>
                          </div>
            </div>
            
            {/* Navigation Arrow - only show if not deleted */}
            {log.action !== 'DELETE' && (() => {
              const getNavigationLink = () => {
                switch (log.resource) {
                  case 'site_settings':
                    return '/admin/settings'
                  case 'business_hours':
                    return '/admin/settings'
                  case 'special_day':
                    return '/admin/settings'
                  case 'menu':
                  case 'menu_category':
                    return log.resourceId ? `/admin/menu?editItem=${log.resourceId}` : '/admin/menu'
                  case 'specials':
                    return log.resourceId ? `/admin/specials?edit=${log.resourceId}` : '/admin/specials'
                  case 'events':
                    return log.resourceId ? `/admin/events?edit=${log.resourceId}` : '/admin/events'
                  default:
                    return null
                }
              }
              
              const link = getNavigationLink()
              if (!link) return null
              
              return (
                <a 
                  href={link}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-blue-600"
                  title="Go to this item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              )
            })()}
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
