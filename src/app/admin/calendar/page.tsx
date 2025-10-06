// src/app/admin/calendar/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Breadcrumb, breadcrumbConfigs } from '@/components/breadcrumb'

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  startTime?: string
  endTime?: string
  type: 'food' | 'drink' | 'entertainment' | 'broncos' | 'special'
  isRecurring: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  recurringDays?: number[]
  price?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CalendarAdmin() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterType, setFilterType] = useState<string>('all')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'food' as CalendarEvent['type'],
    isRecurring: false,
    recurringPattern: 'weekly' as CalendarEvent['recurringPattern'],
    recurringDays: [] as number[],
    price: '',
    isActive: true
  })

  useEffect(() => {
    fetchEvents()
  }, [selectedDate, filterType])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (selectedDate) {
        const startDate = new Date(selectedDate)
        startDate.setDate(1) // First day of month
        const endDate = new Date(selectedDate)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0) // Last day of month
        
        params.append('startDate', startDate.toISOString().split('T')[0])
        params.append('endDate', endDate.toISOString().split('T')[0])
      }
      if (filterType !== 'all') {
        params.append('type', filterType)
      }
      
      const response = await fetch(`/api/admin/calendar?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setEvents(data.events)
    } catch (error) {
      console.error('Failed to fetch calendar events:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch calendar events')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingEvent ? '/api/admin/calendar' : '/api/admin/calendar'
      const method = editingEvent ? 'PUT' : 'POST'
      const body = editingEvent 
        ? { id: editingEvent.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        fetchEvents()
        resetForm()
        setShowAddForm(false)
        setEditingEvent(null)
      } else {
        setError(data.error || 'Failed to save event')
      }
    } catch (error) {
      console.error('Failed to save event:', error)
      setError(error instanceof Error ? error.message : 'Failed to save event')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/admin/calendar?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        fetchEvents()
      } else {
        setError(data.error || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete event')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'food',
      isRecurring: false,
      recurringPattern: 'weekly',
      recurringDays: [],
      price: '',
      isActive: true
    })
  }

  const handleEdit = (event: CalendarEvent) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      type: event.type,
      isRecurring: event.isRecurring,
      recurringPattern: event.recurringPattern || 'weekly',
      recurringDays: event.recurringDays || [],
      price: event.price || '',
      isActive: event.isActive
    })
    setEditingEvent(event)
    setShowAddForm(true)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'bg-orange-100 text-orange-800'
      case 'drink': return 'bg-green-100 text-green-800'
      case 'entertainment': return 'bg-purple-100 text-purple-800'
      case 'broncos': return 'bg-blue-100 text-blue-800'
      case 'special': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food': return '🍽️'
      case 'drink': return '🍺'
      case 'entertainment': return '🎵'
      case 'broncos': return '🏈'
      case 'special': return '⭐'
      default: return '📅'
    }
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading calendar events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbConfigs.calendar} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Calendar Management</h1>
          <p className="mt-2 text-gray-600">
            Manage events, specials, and Broncos games for your bar.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input
                  type="month"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Types</option>
                  <option value="food">Food</option>
                  <option value="drink">Drink</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="broncos">Broncos</option>
                  <option value="special">Special</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowAddForm(true)
                setEditingEvent(null)
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Add New Event
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="food">Food</option>
                    <option value="drink">Drink</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="broncos">Broncos</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., $9.99, BOGO, $1 off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Recurring Event</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recurring Days</label>
                  <div className="flex flex-wrap gap-2">
                    {dayNames.map((day, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.recurringDays.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, recurringDays: [...formData.recurringDays, index] })
                            } else {
                              setFormData({ ...formData, recurringDays: formData.recurringDays.filter(d => d !== index) })
                            }
                          }}
                          className="mr-1"
                        />
                        <span className="text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingEvent(null)
                    resetForm()
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Events ({events.length})
            </h2>
          </div>
          
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {events.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No events found for the selected criteria.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{getTypeIcon(event.type)}</span>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                          {event.startTime && (
                            <span className="text-sm text-gray-500">
                              {new Date(`2000-01-01T${event.startTime}`).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          )}
                          {event.price && (
                            <span className="text-sm font-semibold text-green-600">{event.price}</span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                          {event.isRecurring && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Recurring
                            </span>
                          )}
                          {!event.isActive && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
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
    </div>
  )
}
