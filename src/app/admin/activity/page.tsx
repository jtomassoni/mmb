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
  oldValue?: any
  newValue?: any
}

export default function ActivityLogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    } else {
      fetchActivityLogs()
    }
  }, [session, status, router, page])

  const fetchActivityLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/activity?limit=20&offset=${(page - 1) * 20}&filter=all`)
      if (response.ok) {
        const data = await response.json()
        if (page === 1) {
          setActivityLogs(data.logs)
        } else {
          setActivityLogs(prev => [...prev, ...data.logs])
        }
        setHasMore(data.hasMore)
        setTotal(data.total || data.logs.length)
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  const refreshLogs = () => {
    setPage(1)
    setActivityLogs([])
    fetchActivityLogs()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Breadcrumb items={breadcrumbConfigs.activityLog} />
          </div>
        </div>
      </div>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
              <p className="text-sm text-gray-600 mt-2">
                Complete audit trail of all actions performed in your system
              </p>
            </div>
          <button
            onClick={refreshLogs}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Actions</p>
                <p className="text-2xl font-semibold text-gray-900">{total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last Activity</p>
                <p className="text-sm font-semibold text-gray-900">
                  {activityLogs.length > 0 ? getRelativeTime(activityLogs[0].timestamp, activityLogs[0].site?.timezone || getCompanyTimezone()) : 'None'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Set(activityLogs.map(log => log.user.id)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600 mt-1">
              Detailed log of all system actions and changes
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {loading && activityLogs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-500">Loading activity logs...</p>
              </div>
            ) : activityLogs.length > 0 ? (
              <>
                {activityLogs.map((log) => {
                  const timezone = log.site?.timezone || getCompanyTimezone()
                  const relativeTime = getRelativeTime(log.timestamp, timezone)
                  const fullTime = formatTimeInTimezone(log.timestamp, timezone)
                  
                  return (
                    <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            log.resource === 'specials' ? 'bg-orange-100' :
                            log.resource === 'events' ? 'bg-purple-100' :
                            log.resource === 'menu' ? 'bg-blue-100' :
                            log.resource === 'menu_category' ? 'bg-cyan-100' :
                            log.resource === 'business_hours' ? 'bg-green-100' :
                            log.resource === 'users' ? 'bg-red-100' :
                            log.resource === 'site_settings' ? 'bg-indigo-100' :
                            log.resource === 'special_day' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            <span className={`text-lg ${
                              log.resource === 'specials' ? 'text-orange-600' :
                              log.resource === 'events' ? 'text-purple-600' :
                              log.resource === 'menu' ? 'text-blue-600' :
                              log.resource === 'menu_category' ? 'text-cyan-600' :
                              log.resource === 'business_hours' ? 'text-green-600' :
                              log.resource === 'users' ? 'text-red-600' :
                              log.resource === 'site_settings' ? 'text-indigo-600' :
                              log.resource === 'special_day' ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}>
                              {log.resource === 'specials' ? '🍽️' :
                               log.resource === 'events' ? '🎉' :
                               log.resource === 'menu' ? '📝' :
                               log.resource === 'menu_category' ? '📂' :
                               log.resource === 'business_hours' ? '🕒' :
                               log.resource === 'users' ? '👤' :
                               log.resource === 'site_settings' ? '⚙️' :
                               log.resource === 'special_day' ? '📅' :
                               '📄'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-base text-gray-900">
                                <span className="font-medium">{log.user.name || log.user.email}</span>
                                {' '}
                                <span className="lowercase">
                                  {log.action.toLowerCase() === 'update' ? 'updated' : 
                                   log.action.toLowerCase() === 'reorder' ? 'reordered' :
                                   log.action.toLowerCase() === 'create' ? 'created' :
                                   log.action.toLowerCase() === 'delete' ? 'deleted' :
                                   log.action.toLowerCase()}
                                </span>
                                {' '}
                              <span className="font-medium capitalize">
                                {log.resource === 'site_settings' ? 'Company Info' : 
                                 log.resource === 'menu' ? 'menu item' :
                                 log.resource === 'menu_category' ? 'menu category' :
                                 log.resource.replace('_', ' ')}
                              </span>
                              </p>
                              
                              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                <span title={`${fullTime} (${timezone})`}>{relativeTime}</span>
                                <span>•</span>
                                <span>{timezone}</span>
                                <span>•</span>
                                <span className="capitalize">{log.user.role.toLowerCase()}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Show specific changes if available */}
                          {log.changes && Object.keys(log.changes).length > 0 && (
                            <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">
                              <div className="font-medium text-gray-700 mb-2">Changes:</div>
                              {log.changes && Object.entries(log.changes).map(([key, value]) => {
                                // Try to show before/after if we have oldValue data
                                const oldValue = log.oldValue && typeof log.oldValue === 'object' ? log.oldValue[key] : null
                                const newValue = value
                                
                                // Skip if values are the same (no actual change)
                                if (oldValue && oldValue === newValue) {
                                  return null
                                }
                                
       // Handle reorder actions
       if (log.action === 'REORDER' && log.resource === 'menu_category') {
         return (
           <div key={key} className="mb-2">
             <div className="font-medium text-gray-700 mb-1">Category Reordered:</div>
             <div className="text-sm text-gray-600">
               <span className="font-medium">{log.changes?.categoryName}</span> moved from position{' '}
               <span className="font-medium text-red-600">{log.changes?.oldPosition}</span> to position{' '}
               <span className="font-medium text-green-600">{log.changes?.newPosition}</span>
             </div>
             <div className="text-xs text-gray-500 mt-1">
               Total categories: {log.changes?.totalCategories}
             </div>
           </div>
         )
       }

       if (log.action === 'REORDER' && log.resource === 'menu') {
         return (
           <div key={key} className="mb-2">
             <div className="font-medium text-gray-700 mb-1">Menu Item Reordered:</div>
             <div className="text-sm text-gray-600">
               <span className="font-medium">{log.changes?.itemName}</span> in{' '}
               <span className="font-medium">{log.changes?.category}</span> moved from position{' '}
               <span className="font-medium text-red-600">{log.changes?.oldPosition}</span> to position{' '}
               <span className="font-medium text-green-600">{log.changes?.newPosition}</span>
             </div>
             <div className="text-xs text-gray-500 mt-1">
               Total items in category: {log.changes?.totalItemsInCategory}
             </div>
           </div>
         )
       }
                                
                                // Handle business hours format (single object with all days)
                                if (key === 'businessHours' && typeof value === 'object' && value !== null && !('old' in value) && !('new' in value)) {
                                  console.log('Business Hours Debug:', { key, value, oldValue: log.oldValue, newValue: log.newValue })
                                  
                                  // Get old business hours from oldValue.businessHours
                                  const oldBusinessHours = log.oldValue && typeof log.oldValue === 'object' && log.oldValue !== null ? log.oldValue.businessHours : null
                                  console.log('oldBusinessHours:', oldBusinessHours)
                                  
                                  if (!oldBusinessHours || typeof oldBusinessHours !== 'object') {
                                    console.log('No old business hours data - skipping')
                                    return null
                                  }
                                  
                                  // Find days that actually changed
                                  const changedDays = Object.entries(value).filter(([day, newDayHours]) => {
                                    const oldDayHours = (oldBusinessHours as any)[day]
                                    const hasChanged = !oldDayHours || JSON.stringify(oldDayHours) !== JSON.stringify(newDayHours)
                                    console.log(`Day ${day}:`, { oldDayHours, newDayHours, hasChanged })
                                    return hasChanged
                                  })
                                  console.log('Changed days:', changedDays)
                                  
                                  if (changedDays.length === 0) {
                                    console.log('No changed days found - skipping')
                                    return null
                                  }
                                  
                                  return (
                                    <div key={key} className="mb-2">
                                      <div className="font-medium text-gray-700 mb-1">Business Hours:</div>
                                      <div className="text-xs text-gray-500 mb-2">Found {changedDays.length} changed days</div>
                                      {changedDays.map(([day, newDayHours]) => {
                                        const oldDayHours = (oldBusinessHours as any)[day]
                                        const dayName = day.charAt(0).toUpperCase() + day.slice(1)
                                        
                                        // Format hours for display
                                        const formatHours = (hours: any) => {
                                          if (!hours || typeof hours !== 'object') return 'No data'
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
                                
                                // Handle specials formatting
                                if (log.resource === 'specials' && key === 'price') {
                                        const oldPrice = oldValue && typeof oldValue === 'number' ? `$${oldValue.toFixed(2)}` : 'No price'
                                        const newPrice = newValue && typeof newValue === 'number' ? `$${newValue.toFixed(2)}` : 'No price'
                                  
                                  return (
                                    <div key={key} className="flex items-start space-x-2 mb-2">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        Price:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-red-600 line-through text-sm bg-red-50 px-2 py-1 rounded">
                                            {oldPrice}
                                          </span>
                                          <span className="text-gray-400 text-sm">→</span>
                                          <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded">
                                            {newPrice}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                
                                if (log.resource === 'specials' && key === 'originalPrice') {
                                        const oldPrice = oldValue && typeof oldValue === 'number' ? `$${oldValue.toFixed(2)}` : 'No original price'
                                        const newPrice = newValue && typeof newValue === 'number' ? `$${newValue.toFixed(2)}` : 'No original price'
                                  
                                  return (
                                    <div key={key} className="flex items-start space-x-2 mb-2">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        Original Price:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-red-600 line-through text-sm bg-red-50 px-2 py-1 rounded">
                                            {oldPrice}
                                          </span>
                                          <span className="text-gray-400 text-sm">→</span>
                                          <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded">
                                            {newPrice}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                
                                if (log.resource === 'specials' && (key === 'startDate' || key === 'endDate')) {
                                        const oldDate = oldValue && (typeof oldValue === 'string' || oldValue instanceof Date) ? new Date(oldValue).toLocaleDateString() : 'No date'
                                        const newDate = newValue && (typeof newValue === 'string' || newValue instanceof Date) ? new Date(newValue).toLocaleDateString() : 'No date'
                                  const fieldName = key === 'startDate' ? 'Start Date' : 'End Date'
                                  
                                  return (
                                    <div key={key} className="flex items-start space-x-2 mb-2">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        {fieldName}:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-red-600 line-through text-sm bg-red-50 px-2 py-1 rounded">
                                            {oldDate}
                                          </span>
                                          <span className="text-gray-400 text-sm">→</span>
                                          <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded">
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
                                    <div key={key} className="flex items-start space-x-2 mb-2">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        Status:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className={`line-through text-sm px-2 py-1 rounded ${
                                            oldValue ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
                                          }`}>
                                            {oldStatus}
                                          </span>
                                          <span className="text-gray-400 text-sm">→</span>
                                          <span className={`font-medium text-sm px-2 py-1 rounded ${
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
                                  const oldPrice = oldValue ? `$${oldValue.toFixed(2)}` : 'No price'
                                  const newPrice = typeof newValue === 'number' ? `$${newValue.toFixed(2)}` : 'No price'
                                  
                                  return (
                                    <div key={key} className="flex items-start space-x-2 mb-2">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        Price:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-red-600 line-through text-sm bg-red-50 px-2 py-1 rounded">
                                            {oldPrice}
                                          </span>
                                          <span className="text-gray-400 text-sm">→</span>
                                          <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded">
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
                                    <div key={key} className="flex items-start space-x-2 mb-2">
                                      <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                        Status:
                                      </span>
                                      <div className="text-gray-500 break-words">
                                        <div className="flex items-center space-x-2">
                                          <span className={`line-through text-sm px-2 py-1 rounded ${
                                            oldValue ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
                                          }`}>
                                            {oldStatus}
                                          </span>
                                          <span className="text-gray-400 text-sm">→</span>
                                          <span className={`font-medium text-sm px-2 py-1 rounded ${
                                            newValue ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                          }`}>
                                            {newStatus}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                
                                return (
                                  <div key={key} className="flex items-start space-x-2 mb-2">
                                    <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                    </span>
                                    <div className="text-gray-500 break-words">
                                      {oldValue && oldValue !== newValue ? (
                                        <div className="flex items-center space-x-2">
                                          <span className="text-red-600 line-through text-sm bg-red-50 px-2 py-1 rounded">
                                            {String(oldValue)}
                                          </span>
                                          <span className="text-gray-400 text-sm">→</span>
                                          <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded">
                                            {String(newValue)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                      )}
                                    </div>
                                  </div>
                                )
                              }).filter(Boolean)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        'Load More Activity'
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="mt-2 text-sm text-gray-500">No activity logs found.</p>
                <p className="text-xs text-gray-400">Actions will appear here as users interact with the system.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
