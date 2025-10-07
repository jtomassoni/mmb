'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Breadcrumb, breadcrumbConfigs } from '@/components/breadcrumb'
import { Input, Textarea, Select, DateInput, TimeInput, ColorInput, Checkbox } from '@/components/shared-inputs'
import { CTAManager } from '@/components/cta-manager'
import { ImageUploadManager } from '@/components/image-upload-manager'
import { formatTimeInTimezone, getRelativeTime, getCompanyTimezone } from '@/lib/timezone'

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
  const [activeTab, setActiveTab] = useState<'events' | 'calendar'>('events')
  const [events, setEvents] = useState<Event[]>([])
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null)
  const [showEventTypeForm, setShowEventTypeForm] = useState(false)
  
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
  const [isRecurring, setIsRecurring] = useState<boolean>(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'weekdays' | 'weekends'>('weekly')
  const [recurringEndDate, setRecurringEndDate] = useState<string>('')
  const [recurringDays, setRecurringDays] = useState<string[]>([])
  const [recurringInterval, setRecurringInterval] = useState<number>(1)

  // Redirect if not authenticated
  useEffect(() => {
    if (session === null) {
      router.push('/login')
    }
  }, [session, router])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch events
      const eventsResponse = await fetch('/api/admin/events')
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.events || [])
      }

      // Fetch event types
      const eventTypesResponse = await fetch('/api/admin/event-types?siteId=cmgfjti600004meoa7n4vy3o8')
      if (eventTypesResponse.ok) {
        const eventTypesData = await eventTypesResponse.json()
        setEventTypes(eventTypesData.eventTypes || [])
      }

      // Fetch activity logs
      const activityResponse = await fetch('/api/admin/activity?resource=events&limit=10')
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setActivityLogs(activityData.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      setEvents(events.filter(event => event.id !== eventId))
      await fetchData() // Refresh data
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event')
    }
  }

  const handleDeleteEventType = async (eventTypeId: string) => {
    if (!confirm('Are you sure you want to delete this event type?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/event-types/${eventTypeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete event type')
      }

      setEventTypes(eventTypes.filter(type => type.id !== eventTypeId))
      await fetchData() // Refresh data
    } catch (error) {
      console.error('Failed to delete event type:', error)
      alert('Failed to delete event type')
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'bg-orange-100 text-orange-800'
      case 'drink': return 'bg-green-100 text-green-800'
      case 'entertainment': return 'bg-purple-100 text-purple-800'
      case 'sports': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Sorting functions
  const sortEventTypes = (types: EventType[]) => {
    return [...types].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number
      
      if (eventTypeSortBy === 'name') {
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
      } else {
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
      }
      
      if (eventTypeSortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  const sortEvents = (events: Event[]) => {
    return [...events].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number
      
      if (eventSortBy === 'name') {
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
      } else if (eventSortBy === 'startDate') {
        aValue = new Date(a.startDate).getTime()
        bValue = new Date(b.startDate).getTime()
      } else {
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
      }
      
      if (eventSortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  // Event type filtering functions
  const toggleEventTypeFilter = (eventTypeId: string) => {
    const newSelected = new Set(selectedEventTypes)
    if (newSelected.has(eventTypeId)) {
      newSelected.delete(eventTypeId)
    } else {
      newSelected.add(eventTypeId)
    }
    setSelectedEventTypes(newSelected)
  }

  const clearAllFilters = () => {
    setSelectedEventTypes(new Set())
  }

  const selectAllFilters = () => {
    setSelectedEventTypes(new Set(eventTypes.map(type => type.id)))
  }

  const filterAndSortEvents = (events: Event[]) => {
    let filteredEvents = events

    // Filter by event types if any are selected
    if (selectedEventTypes.size > 0) {
      filteredEvents = events.filter(event => 
        event.eventTypeId && selectedEventTypes.has(event.eventTypeId)
      )
    }

    // Sort the filtered events
    return sortEvents(filteredEvents)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food': return '🍽️'
      case 'drink': return '🍺'
      case 'entertainment': return '🎵'
      case 'sports': return '🏈'
      default: return '📅'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbConfigs.events} />
        
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
              Events & Types
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
          <div className="space-y-8">
            {/* Event Types Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Event Types</h2>
                  <button
                    onClick={() => setShowEventTypeForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Event Type
                  </button>
                </div>
                
                {/* Event Types Sorting Toolbar */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Sort by:</label>
                    <select
                      value={eventTypeSortBy}
                      onChange={(e) => setEventTypeSortBy(e.target.value as 'name' | 'createdAt')}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="name">Name</option>
                      <option value="createdAt">Created Date</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Order:</label>
                    <button
                      onClick={() => setEventTypeSortOrder(eventTypeSortOrder === 'asc' ? 'desc' : 'asc')}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-500"
                    >
                      {eventTypeSortOrder === 'asc' ? '↑' : '↓'} {eventTypeSortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortEventTypes(eventTypes).map((type) => (
                    <div key={type.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingEventType(type)
                              setShowEventTypeForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEventType(type.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {type.description && (
                        <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                      )}
                      {type.color && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: type.color }}
                          ></div>
                          <span className="text-xs text-gray-500">{type.color}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Events Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Events</h2>
                  <button
                    onClick={() => {
                      const today = new Date()
                      const todayString = today.toISOString().split('T')[0]
                      setEditingEvent({
                        id: '',
                        name: '',
                        description: '',
                        startDate: todayString,
                        endDate: todayString,
                        startTime: '16:00', // 4:00 PM
                        endTime: '23:00',   // 11:00 PM
                        location: '',
                        isActive: true,
                        eventTypeId: '',
                        price: '',
                        createdAt: '',
                        updatedAt: ''
                      })
                      setEventCTAs([])
                      setEventImages([])
                      setSelectedEventType('custom')
                      setIsRecurring(false)
                      setRecurringFrequency('weekly')
                      setRecurringEndDate('')
                      setShowCreateForm(true)
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Event
                  </button>
                </div>
                
                {/* Events Sorting Toolbar */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Sort by:</label>
                    <select
                      value={eventSortBy}
                      onChange={(e) => setEventSortBy(e.target.value as 'name' | 'startDate' | 'createdAt')}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="name">Name</option>
                      <option value="startDate">Start Date</option>
                      <option value="createdAt">Created Date</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Order:</label>
                    <button
                      onClick={() => setEventSortOrder(eventSortOrder === 'asc' ? 'desc' : 'asc')}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-500"
                    >
                      {eventSortOrder === 'asc' ? '↑' : '↓'} {eventSortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                  </div>
                </div>
                
                {/* Event Type Filter */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Filter by Event Type:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllFilters}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {eventTypes.map((type) => (
                      <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEventTypes.has(type.id)}
                          onChange={() => toggleEventTypeFilter(type.id)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{type.name}</span>
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: type.color || '#FF6B35' }}
                        ></span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filterAndSortEvents(events).length} of {events.length} events
                  {selectedEventTypes.size > 0 && (
                    <span className="ml-2 text-green-600">
                      (filtered by {selectedEventTypes.size} event type{selectedEventTypes.size > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  {filterAndSortEvents(events).map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{event.name}</h3>
                            {event.eventType && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(event.eventType.name.toLowerCase())}`}>
                                {event.eventType.name}
                              </span>
                            )}
                            {event.price && (
                              <span className="text-sm font-semibold text-green-600">{event.price}</span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                            {event.startTime && (
                              <span>🕐 {new Date(`2000-01-01T${event.startTime}`).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}</span>
                            )}
                            {event.location && (
                              <span>📍 {event.location}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingEvent(event)
                              setEventCTAs(event.ctas || [])
                              setEventImages(event.images || [])
                              setShowCreateForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">
                        <strong>{log.user.name || log.user.email}</strong> {
                          log.action.toLowerCase() === 'create' && log.resource === 'events' 
                            ? 'created an event'
                            : `${log.action.toLowerCase()}d ${log.resource}`
                        }
                      </span>
                      <span className="text-gray-400">
                        {getRelativeTime(log.timestamp)}
                      </span>
                    </div>
                  ))}
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
              const eventTypeData = {
                siteId: 'cmgfjti600004meoa7n4vy3o8',
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                color: formData.get('color') as string,
                isActive: true
              }

              try {
                const url = editingEventType 
                  ? `/api/admin/event-types/${editingEventType.id}`
                  : '/api/admin/event-types'
                const method = editingEventType ? 'PUT' : 'POST'

                const response = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(eventTypeData)
                })

                if (!response.ok) {
                  throw new Error('Failed to save event type')
                }

                setShowEventTypeForm(false)
                setEditingEventType(null)
                await fetchData()
              } catch (error) {
                console.error('Failed to save event type:', error)
                alert('Failed to save event type')
              }
            }}>
              <div className="space-y-4">
                <Input
                  name="name"
                  label="Name"
                  required
                  placeholder="e.g., Food Special, Sports Event"
                  defaultValue={editingEventType?.name || ''}
                />
                <Textarea
                  name="description"
                  label="Description"
                  placeholder="Describe this event type..."
                  defaultValue={editingEventType?.description || ''}
                />
                <ColorInput
                  name="color"
                  label="Color"
                  defaultValue={editingEventType?.color || '#FF6B35'}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventTypeForm(false)
                    setEditingEventType(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
              const eventData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                startDate: formData.get('startDate') as string,
                endDate: formData.get('endDate') as string,
                startTime: formData.get('startTime') as string,
                endTime: formData.get('endTime') as string,
                location: formData.get('location') as string,
                eventTypeId: formData.get('eventTypeId') as string,
                price: formData.get('price') as string,
                isActive: formData.get('isActive') === 'on',
                images: eventImages,
                ctas: eventCTAs,
                isRecurring,
                recurringFrequency,
                recurringEndDate,
                recurringDays,
                recurringInterval
              }

              try {
                const url = editingEvent 
                  ? `/api/admin/events/${editingEvent.id}`
                  : '/api/admin/events'
                const method = editingEvent ? 'PUT' : 'POST'

                const response = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(eventData)
                })

                if (!response.ok) {
                  throw new Error('Failed to save event')
                }

                setShowCreateForm(false)
                setEditingEvent(null)
                setEventCTAs([])
                setEventImages([])
                await fetchData()
              } catch (error) {
                console.error('Failed to save event:', error)
                alert('Failed to save event')
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Type Selection - Always at the top */}
                <Select
                  name="eventTypeId"
                  label="Event Type"
                  defaultValue={editingEvent?.eventTypeId || selectedEventType}
                  onChange={(value) => {
                    setSelectedEventType(value)
                    // Auto-fill based on event type
                    if (value === 'poker-night') {
                      setEditingEvent(prev => prev ? {
                        ...prev,
                        name: 'Poker Night',
                        startTime: '19:00', // 7:00 PM
                        endTime: '23:00',   // 11:00 PM
                        location: 'Main Dining Room',
                        eventTypeId: value
                      } : null)
                    } else if (value === 'broncos-game') {
                      setEditingEvent(prev => prev ? {
                        ...prev,
                        name: 'Broncos Game',
                        location: 'Main Dining Room',
                        eventTypeId: value
                      } : null)
                    } else {
                      setEditingEvent(prev => prev ? {
                        ...prev,
                        eventTypeId: value
                      } : null)
                    }
                  }}
                  className="md:col-span-2"
                >
                  <option value="">Select Event Type</option>
                  <option value="poker-night">Poker Night</option>
                  <option value="broncos-game">Broncos Game</option>
                  <option value="custom">Custom Event</option>
                  {eventTypes.filter(type => 
                    !['Poker Night', 'Broncos Game', 'Custom Event'].includes(type.name)
                  ).map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>

                {/* Recurring Event Options */}
                <div className="md:col-span-2">
                  <Checkbox
                    name="isRecurring"
                    label="Make this a recurring event"
                    checked={isRecurring}
                    onChange={(checked) => setIsRecurring(checked)}
                  />
                </div>

                {isRecurring && (
                  <>
                    <div className="md:col-span-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium mb-2">Recurring Event Settings</p>
                    </div>
                    
                    <Select
                      name="recurringFrequency"
                      label="Recurring Pattern"
                      value={recurringFrequency}
                      onChange={(value) => setRecurringFrequency(value as any)}
                    >
                      <option value="daily">Every Day</option>
                      <option value="weekdays">Weekdays Only (Mon-Fri)</option>
                      <option value="weekends">Weekends Only (Sat-Sun)</option>
                      <option value="weekly">Every Week</option>
                      <option value="biweekly">Every Other Week</option>
                      <option value="monthly">Every Month</option>
                    </Select>
                    
                    <Input
                      name="recurringInterval"
                      label="Every X (interval)"
                      type="number"
                      min="1"
                      max="12"
                      value={recurringInterval}
                      onChange={(value) => setRecurringInterval(parseInt(value) || 1)}
                    />

                    {(recurringFrequency === 'weekly' || recurringFrequency === 'biweekly') && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                        <div className="grid grid-cols-7 gap-2">
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                            <label key={day} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={recurringDays.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRecurringDays([...recurringDays, day])
                                  } else {
                                    setRecurringDays(recurringDays.filter(d => d !== day))
                                  }
                                }}
                                className="mr-1"
                              />
                              <span className="text-xs">{day.slice(0, 3)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <DateInput
                      name="recurringEndDate"
                      label="End Recurring On"
                      value={recurringEndDate}
                      onChange={setRecurringEndDate}
                    />
                    
                    <div className="md:col-span-2">
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Preview:</strong> {
                            recurringFrequency === 'daily' ? `Every ${recurringInterval} day(s)` :
                            recurringFrequency === 'weekdays' ? `Every ${recurringInterval} weekday(s)` :
                            recurringFrequency === 'weekends' ? `Every ${recurringInterval} weekend(s)` :
                            recurringFrequency === 'weekly' ? `Every ${recurringInterval} week(s) on ${recurringDays.length > 0 ? recurringDays.join(', ') : 'selected days'}` :
                            recurringFrequency === 'biweekly' ? `Every ${recurringInterval * 2} week(s) on ${recurringDays.length > 0 ? recurringDays.join(', ') : 'selected days'}` :
                            `Every ${recurringInterval} month(s)`
                          } {recurringEndDate ? `until ${recurringEndDate}` : ''}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Dynamic Fields Based on Event Type */}
                {selectedEventType === 'poker-night' && (
                  <>
                    <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Poker Night:</strong> This will create a weekly poker event at 7pm-11pm. 
                        Perfect for setting up recurring poker nights for the year!
                      </p>
                    </div>
                    <Input
                      name="name"
                      label="Event Name"
                      required
                      defaultValue="Poker Night"
                      className="md:col-span-2"
                    />
                    <DateInput
                      name="startDate"
                      label="Date"
                      required
                      value={editingEvent?.startDate ? editingEvent.startDate.split('T')[0] : ''}
                      onChange={(value) => setEditingEvent(prev => prev ? { ...prev, startDate: value, endDate: value } : null)}
                    />
                    <Input
                      name="location"
                      label="Location"
                      defaultValue="Main Dining Room"
                    />
                    <Input
                      name="startTime"
                      label="Start Time"
                      defaultValue="19:00"
                      readOnly
                    />
                    <Input
                      name="endTime"
                      label="End Time"
                      defaultValue="23:00"
                      readOnly
                    />
                    <Checkbox
                      name="isActive"
                      label="Active"
                      checked={editingEvent?.isActive !== false}
                      className="md:col-span-2"
                    />
                  </>
                )}

                {selectedEventType === 'broncos-game' && (
                  <>
                    <div className="md:col-span-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <strong>Broncos Game:</strong> Enter the game details and we'll automatically set up 
                        the watch party times (1 hour before and after game time).
                      </p>
                    </div>
                    <Input
                      name="name"
                      label="Event Name"
                      required
                      defaultValue="Broncos Game"
                      className="md:col-span-2"
                    />
                    <DateInput
                      name="startDate"
                      label="Game Date"
                      required
                      value={editingEvent?.startDate ? editingEvent.startDate.split('T')[0] : ''}
                      onChange={(value) => setEditingEvent(prev => prev ? { ...prev, startDate: value, endDate: value } : null)}
                    />
                    <Input
                      name="opponent"
                      label="Opponent Team"
                      required
                      placeholder="e.g., Kansas City Chiefs"
                    />
                    <TimeInput
                      name="gameTime"
                      label="Game Start Time"
                      required
                      value={editingEvent?.startTime || ''}
                      onChange={(value) => {
                        // Auto-calculate start and end times (1 hour before and after)
                        const gameTime = new Date(`2000-01-01T${value}`)
                        const startTime = new Date(gameTime.getTime() - 60 * 60 * 1000) // 1 hour before
                        const endTime = new Date(gameTime.getTime() + 60 * 60 * 1000)   // 1 hour after
                        
                        setEditingEvent(prev => prev ? {
                          ...prev,
                          startTime: startTime.toTimeString().slice(0, 5),
                          endTime: endTime.toTimeString().slice(0, 5)
                        } : null)
                      }}
                    />
                    <Select
                      name="mainDish"
                      label="Main Dish"
                      required
                    >
                      <option value="">Select Main Dish</option>
                      <option value="Taco Bar">Taco Bar</option>
                      <option value="Pulled Pork">Pulled Pork</option>
                      <option value="Pasta Bar">Pasta Bar</option>
                      <option value="BBQ Ribs">BBQ Ribs</option>
                      <option value="Chili Bar">Chili Bar</option>
                      <option value="Wing Bar">Wing Bar</option>
                      <option value="Burger Bar">Burger Bar</option>
                    </Select>
                    <Input
                      name="location"
                      label="Location"
                      defaultValue="Main Dining Room"
                    />
                    <Checkbox
                      name="isActive"
                      label="Active"
                      checked={editingEvent?.isActive !== false}
                      className="md:col-span-2"
                    />
                  </>
                )}

                {(selectedEventType === 'custom' || (!selectedEventType && editingEvent?.eventTypeId)) && (
                  <>
                    <Input
                      name="name"
                      label="Event Name"
                      required
                      placeholder="e.g., Taco Tuesday, Special Event"
                      defaultValue={editingEvent?.name || ''}
                      className="md:col-span-2"
                    />
                    <Textarea
                      name="description"
                      label="Description"
                      placeholder="Describe the event..."
                      defaultValue={editingEvent?.description || ''}
                      className="md:col-span-2"
                    />
                    <DateInput
                      name="startDate"
                      label="Start Date"
                      required
                      value={editingEvent?.startDate ? editingEvent.startDate.split('T')[0] : ''}
                      onChange={(value) => setEditingEvent(prev => prev ? { ...prev, startDate: value } : null)}
                    />
                    <DateInput
                      name="endDate"
                      label="End Date"
                      value={editingEvent?.endDate ? editingEvent.endDate.split('T')[0] : ''}
                      onChange={(value) => setEditingEvent(prev => prev ? { ...prev, endDate: value } : null)}
                    />
                    <TimeInput
                      name="startTime"
                      label="Start Time"
                      value={editingEvent?.startTime || ''}
                      onChange={(value) => setEditingEvent(prev => prev ? { ...prev, startTime: value } : null)}
                    />
                    <TimeInput
                      name="endTime"
                      label="End Time"
                      value={editingEvent?.endTime || ''}
                      onChange={(value) => setEditingEvent(prev => prev ? { ...prev, endTime: value } : null)}
                    />
                    <Input
                      name="location"
                      label="Location"
                      placeholder="e.g., Main Dining Room, Patio"
                      defaultValue={editingEvent?.location || ''}
                    />
                    <Input
                      name="price"
                      label="Price"
                      placeholder="e.g., $9.99, Free, BOGO"
                      defaultValue={editingEvent?.price || ''}
                    />
                    <Checkbox
                      name="isActive"
                      label="Active"
                      checked={editingEvent?.isActive !== false}
                      className="md:col-span-2"
                    />
                    
                    {/* CTAs and Images for Custom Events */}
                    <div className="md:col-span-2">
                      <CTAManager
                        ctas={eventCTAs}
                        onChange={setEventCTAs}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <ImageUploadManager
                        images={eventImages}
                        onChange={setEventImages}
                      />
                    </div>
                  </>
                )}
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
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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