'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AdminSubNav } from '@/components/admin-sub-nav'
import { Input, Textarea, Select, DateInput, TimeInput, ColorInput, Checkbox } from '@/components/shared-inputs'
import { CTAManager } from '@/components/cta-manager'
import { ImageUploadManager } from '@/components/image-upload-manager'
import { formatTimeInTimezone, getRelativeTime, getCompanyTimezone } from '@/lib/timezone'
import { BroncosCacheMonitor } from '@/components/broncos-cache-monitor'

interface Event {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  startTime: string | null
  endTime: string | null
  location: string | null
  isActive: boolean
  image?: string
  eventTypeId?: string
  price?: string
  createdAt: string
  updatedAt: string
  eventType?: {
    id: string
    name: string
    color?: string
    icon?: string
  }
  images?: Array<{
    id: string
    url: string
    alt: string
    caption: string
    sortOrder: number
  }>
  ctas?: Array<{
    id: string
    text: string
    url: string
    type: 'external' | 'facebook' | 'phone' | 'email'
    isActive: boolean
  }>
}

interface EventType {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

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
  changes?: any
  previousValues?: any
}

export default function EventsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'events' | 'event-types' | 'sports-teams' | 'calendar'>('events')
  const [events, setEvents] = useState<Event[]>([])
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null)
  const [showEventTypeForm, setShowEventTypeForm] = useState(false)
  const [syncingGames, setSyncingGames] = useState(false)
  
  // Sorting states
  const [eventTypeSortBy, setEventTypeSortBy] = useState<'name' | 'createdAt'>('name')
  const [eventTypeSortOrder, setEventTypeSortOrder] = useState<'asc' | 'desc'>('asc')
  const [eventSortBy, setEventSortBy] = useState<'name' | 'startDate' | 'createdAt'>('startDate')
  const [eventSortOrder, setEventSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Event type filtering states
  const [selectedEventTypes, setSelectedEventTypes] = useState<Set<string>>(new Set())
  
  // Event form states for CTAs and images
  const [eventCTAs, setEventCTAs] = useState<Array<{id?: string, text: string, url: string, type: 'external' | 'facebook' | 'phone' | 'email', isActive: boolean}>>([])
  const [eventImages, setEventImages] = useState<Array<{id?: string, url: string, alt: string, caption: string, sortOrder: number}>>([])
  const [selectedEventType, setSelectedEventType] = useState<string>('custom')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [recurringEndDate, setRecurringEndDate] = useState<string>('')

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    
    fetchEvents()
    fetchEventTypes()
    fetchActivityLogs()
  }, [session, router])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchEventTypes = async () => {
    try {
      const response = await fetch('/api/admin/event-types')
      if (response.ok) {
        const data = await response.json()
        setEventTypes(data.eventTypes || [])
      }
    } catch (error) {
      console.error('Error fetching event types:', error)
    }
  }

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch('/api/audit/recent')
      if (response.ok) {
        const data = await response.json()
        setActivityLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncBroncosGames = async () => {
    if (!confirm('This will sync Broncos games to your events calendar. The events will be created with default values. Make sure to review and update game times and any special menus or promotions after syncing. Continue?')) {
      return
    }

    setSyncingGames(true)
    
    try {
      const response = await fetch('/api/admin/sync-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Success! Synced ${data.syncedGames?.length || 0} Broncos games to events calendar.\n\n⚠️ IMPORTANT: Please review each game event to:\n- Verify game times are correct\n- Add any special menus or promotions\n- Update event details as needed`)
        await fetchEvents() // Refresh events list
      } else {
        alert(`Failed to sync games: ${data.message || data.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert('Failed to sync games. Please try again.')
    } finally {
      setSyncingGames(false)
    }
  }

  const sortEventTypes = (types: EventType[]) => {
    return [...types].sort((a, b) => {
      const aValue = eventTypeSortBy === 'name' ? a.name : a.createdAt
      const bValue = eventTypeSortBy === 'name' ? b.name : b.createdAt
      
      if (eventTypeSortOrder === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
  }

  const sortEvents = (eventsList: Event[]) => {
    return [...eventsList].sort((a, b) => {
      let aValue: string
      let bValue: string
      
      switch (eventSortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'startDate':
          aValue = a.startDate
          bValue = b.startDate
          break
        case 'createdAt':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        default:
          aValue = a.name
          bValue = b.name
      }
      
      if (eventSortOrder === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId))
      } else {
        alert('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Error deleting event')
    }
  }

  const handleDeleteEventType = async (eventTypeId: string) => {
    if (!confirm('Are you sure you want to delete this event type?')) return
    
    try {
      const response = await fetch(`/api/admin/event-types/${eventTypeId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setEventTypes(eventTypes.filter(type => type.id !== eventTypeId))
      } else {
        alert('Failed to delete event type')
      }
    } catch (error) {
      console.error('Error deleting event type:', error)
      alert('Error deleting event type')
    }
  }

  const handleToggleEventStatus = async (event: Event) => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !event.isActive
        })
      })
      
      if (response.ok) {
        setEvents(events.map(e => 
          e.id === event.id ? { ...e, isActive: !e.isActive } : e
        ))
      } else {
        alert('Failed to update event status')
      }
    } catch (error) {
      console.error('Error updating event status:', error)
      alert('Error updating event status')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSubNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSubNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="mt-2 text-gray-600">Manage your restaurant events and specials</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('event-types')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'event-types'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Event Types
            </button>
            <button
              onClick={() => setActiveTab('sports-teams')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sports-teams'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sports Teams
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'calendar'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Calendar Preview
            </button>
          </nav>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Events Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">All Events</h3>
                  <div className="text-sm text-gray-500">
                    {events.length} events
                  </div>
                </div>
                
                {/* Filtering and Sorting Controls */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Event Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                    <select
                      value={selectedEventTypes.size === 0 ? 'all' : Array.from(selectedEventTypes)[0]}
                      onChange={(e) => {
                        if (e.target.value === 'all') {
                          setSelectedEventTypes(new Set())
                        } else {
                          setSelectedEventTypes(new Set([e.target.value]))
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Types</option>
                      {eventTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value="all"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  {/* Sort Controls */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                    <div className="flex gap-1">
                      <select
                        value={eventSortBy}
                        onChange={(e) => setEventSortBy(e.target.value as 'name' | 'startDate' | 'createdAt')}
                        className="flex-1 px-2 py-2 border border-gray-300 rounded-l-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="name">Name</option>
                        <option value="startDate">Start Date</option>
                        <option value="createdAt">Created</option>
                      </select>
                      <button
                        onClick={() => setEventSortOrder(eventSortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-2 py-2 border border-gray-300 rounded-r-md text-sm text-gray-900 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-500"
                        title={`Sort ${eventSortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                      >
                        {eventSortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-end">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                    >
                      Add Event
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {events.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No events found
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Event Image */}
                          <div className="flex-shrink-0">
                            {event.image ? (
                              <img className="h-12 w-12 rounded-lg object-cover" src={event.image} alt={event.name} />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Event Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{event.name}</h3>
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                event.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {event.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>{event.eventType?.name || 'Custom'}</span>
                              <span>•</span>
                              <span>{new Date(event.startDate).toLocaleDateString()}</span>
                              {event.startTime && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {formatTimeInTimezone(event.startTime, 'America/Denver', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    {event.endTime && ` - ${formatTimeInTimezone(event.endTime, 'America/Denver', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                                  </span>
                                </>
                              )}
                              {event.location && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{event.location}</span>
                                </>
                              )}
                            </div>
                            {event.description && (
                              <p className="mt-1 text-sm text-gray-600 truncate max-w-xs">{event.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingEvent(event)
                              setShowCreateForm(true)
                            }}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleEventStatus(event)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                              event.isActive 
                                ? 'text-orange-700 bg-orange-100 hover:bg-orange-200' 
                                : 'text-green-700 bg-green-100 hover:bg-green-200'
                            }`}
                            title={event.isActive ? 'Disable' : 'Enable'}
                          >
                            {event.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Event Types Tab */}
        {activeTab === 'event-types' && (
          <div className="space-y-6">
            {/* Event Types Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">All Event Types</h3>
                  <div className="text-sm text-gray-500">
                    {eventTypes.length} types
                  </div>
                </div>
                
                {/* Filtering and Sorting Controls */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Sort Controls */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                    <div className="flex gap-1">
                      <select
                        value={eventTypeSortBy}
                        onChange={(e) => setEventTypeSortBy(e.target.value as 'name' | 'createdAt')}
                        className="flex-1 px-2 py-2 border border-gray-300 rounded-l-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="name">Name</option>
                        <option value="createdAt">Created</option>
                      </select>
                      <button
                        onClick={() => setEventTypeSortOrder(eventTypeSortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-2 py-2 border border-gray-300 rounded-r-md text-sm text-gray-900 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-500"
                        title={`Sort ${eventTypeSortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                      >
                        {eventTypeSortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Add Event Type Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() => setShowEventTypeForm(true)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                    >
                      Add Event Type
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {eventTypes.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No event types found
                  </div>
                ) : (
                  sortEventTypes(eventTypes).map((type) => (
                    <div key={type.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Color Indicator */}
                          <div className="flex-shrink-0">
                            {type.color ? (
                              <div 
                                className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                                style={{ backgroundColor: type.color }}
                              >
                                {type.icon ? (
                                  <span className="text-white text-lg">{type.icon}</span>
                                ) : (
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                )}
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Event Type Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{type.name}</h3>
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                type.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {type.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {type.description && (
                              <p className="mt-1 text-sm text-gray-600 truncate">{type.description}</p>
                            )}
                            {type.color && (
                              <p className="mt-1 text-xs text-gray-500">{type.color}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingEventType(type)
                              setShowEventTypeForm(true)
                            }}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEventType(type.id)}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sports Teams Tab */}
        {activeTab === 'sports-teams' && (
          <div className="space-y-6">
            {/* Broncos Data Cache Monitor */}
            <BroncosCacheMonitor />
            
            {/* Sports Teams Management */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Sports Teams Management</h3>
                <p className="text-sm text-gray-600 mt-1">Manage your sports team game syncing and watch parties</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Denver Broncos */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🏈</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Denver Broncos</h4>
                        <p className="text-sm text-gray-600">NFL Football</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSyncBroncosGames}
                      disabled={syncingGames}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {syncingGames ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Syncing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Sync Games to Calendar
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-xs text-blue-900 font-medium mb-1">Data Source</p>
                      <p className="text-sm text-blue-800">ESPN API with fallback schedule</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-xs text-green-900 font-medium mb-1">Auto Refresh</p>
                      <p className="text-sm text-green-800">Every 30 minutes via cron</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-xs text-orange-900 font-medium mb-1">Default Event Type</p>
                      <p className="text-sm text-orange-800">Sports Event 🏈</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-900">⚠️ Review Required After Sync</p>
                        <p className="text-xs text-yellow-800 mt-1">
                          Synced games are created with default values. Please review each game to:
                          <br />• Verify game times are correct for Denver timezone
                          <br />• Add any special menus or food/drink promotions
                          <br />• Update event descriptions and details as needed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Placeholder for Future Teams */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h4 className="text-base font-medium text-gray-900 mb-2">Add More Sports Teams</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Expand your sports coverage by adding more teams
                    <br />
                    <span className="text-xs text-gray-500">(Denver Nuggets, Colorado Avalanche, Colorado Rockies, etc.)</span>
                  </p>
                  <button
                    disabled
                    className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-500 rounded-md text-sm cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Preview Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Public Calendar Preview</h2>
              <p className="text-sm text-gray-600 mt-1">This is exactly how your calendar appears to customers</p>
            </div>
            <div className="p-6">
              <iframe
                src="/events"
                className="w-full h-screen border-0 rounded-lg"
                title="Calendar Preview"
              />
            </div>
          </div>
        )}
      </div>

      {/* Event Type Form Modal */}
      {showEventTypeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEventType ? 'Edit Event Type' : 'Add Event Type'}
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const data = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                color: formData.get('color') as string,
                icon: formData.get('icon') as string,
                isActive: formData.get('isActive') === 'on'
              }

              try {
                const url = editingEventType 
                  ? `/api/admin/event-types/${editingEventType.id}`
                  : '/api/admin/event-types'
                const method = editingEventType ? 'PUT' : 'POST'

                const response = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                })

                if (response.ok) {
                  await fetchEventTypes()
                  setShowEventTypeForm(false)
                  setEditingEventType(null)
                } else {
                  alert('Failed to save event type')
                }
              } catch (error) {
                console.error('Error saving event type:', error)
                alert('Error saving event type')
              }
            }}>
              <div className="space-y-4">
                <Input
                  name="name"
                  label="Event Type Name"
                  defaultValue={editingEventType?.name || ''}
                  required
                />
                <Textarea
                  name="description"
                  label="Description"
                  defaultValue={editingEventType?.description || ''}
                />
                <ColorInput
                  name="color"
                  label="Color"
                  defaultValue={editingEventType?.color || '#6B7280'}
                />
                <Input
                  name="icon"
                  label="Icon (emoji)"
                  defaultValue={editingEventType?.icon || ''}
                  placeholder="🎉"
                />
                <Checkbox
                  name="isActive"
                  label="Active"
                  checked={editingEventType?.isActive ?? true}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventTypeForm(false)
                    setEditingEventType(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  {editingEventType ? 'Update' : 'Create'} Event Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEvent ? 'Edit Event' : 'Add Event'}
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const data = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                startDate: formData.get('startDate') as string,
                endDate: formData.get('endDate') as string,
                startTime: formData.get('startTime') as string,
                endTime: formData.get('endTime') as string,
                location: formData.get('location') as string,
                price: formData.get('price') as string,
                eventTypeId: formData.get('eventTypeId') as string,
                isActive: formData.get('isActive') === 'on',
                ctas: eventCTAs,
                images: eventImages
              }

              try {
                const url = editingEvent 
                  ? `/api/admin/events/${editingEvent.id}`
                  : '/api/admin/events'
                const method = editingEvent ? 'PUT' : 'POST'

                const response = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                })

                if (response.ok) {
                  await fetchEvents()
                  setShowCreateForm(false)
                  setEditingEvent(null)
                  setEventCTAs([])
                  setEventImages([])
                } else {
                  alert('Failed to save event')
                }
              } catch (error) {
                console.error('Error saving event:', error)
                alert('Error saving event')
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="name"
                  label="Event Name"
                  defaultValue={editingEvent?.name || ''}
                  required
                />
                <Select
                  name="eventTypeId"
                  label="Event Type"
                  defaultValue={editingEvent?.eventTypeId || selectedEventType}
                >
                  <option value="custom">Custom</option>
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </Select>
                <DateInput
                  name="startDate"
                  label="Start Date"
                  value={editingEvent?.startDate || ''}
                  required
                />
                <DateInput
                  name="endDate"
                  label="End Date"
                  value={editingEvent?.endDate || ''}
                  required
                />
                <TimeInput
                  name="startTime"
                  label="Start Time"
                  value={editingEvent?.startTime || ''}
                />
                <TimeInput
                  name="endTime"
                  label="End Time"
                  value={editingEvent?.endTime || ''}
                />
                <Input
                  name="location"
                  label="Location"
                  defaultValue={editingEvent?.location || ''}
                />
                <Input
                  name="price"
                  label="Price"
                  defaultValue={editingEvent?.price || ''}
                  placeholder="Free or $10"
                />
              </div>
              
              <div className="mt-4">
                <Textarea
                  name="description"
                  label="Description"
                  defaultValue={editingEvent?.description || ''}
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <Checkbox
                  name="isActive"
                  label="Active"
                  checked={editingEvent?.isActive ?? true}
                />
              </div>

              <div className="mt-6">
                <CTAManager
                  ctas={eventCTAs}
                  onChange={setEventCTAs}
                />
              </div>

              <div className="mt-6">
                <ImageUploadManager
                  images={eventImages}
                  onChange={setEventImages}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingEvent(null)
                    setEventCTAs([])
                    setEventImages([])
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  {editingEvent ? 'Update' : 'Create'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
