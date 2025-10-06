'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Breadcrumb, breadcrumbConfigs } from '@/components/breadcrumb'

interface Special {
  id: string
  name: string
  description: string
  price?: number
  originalPrice?: number
  startDate: string
  endDate: string
  isActive: boolean
  image?: string
  createdAt: string
  updatedAt: string
}

interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  location?: string
  isActive: boolean
  image?: string
  createdAt: string
  updatedAt: string
}

export default function SpecialsEventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'specials' | 'events' | 'calendar'>('specials')

  const [specials, setSpecials] = useState<Special[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const [showCreateSpecial, setShowCreateSpecial] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [editingSpecial, setEditingSpecial] = useState<Special | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const [newSpecial, setNewSpecial] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    startDate: '',
    endDate: '',
    isActive: true,
    image: ''
  })

  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    isActive: true,
    image: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    } else {
      fetchData()
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [specialsRes, eventsRes, activityRes] = await Promise.all([
        fetch('/api/admin/specials'),
        fetch('/api/admin/events'),
        fetch('/api/admin/activity?limit=10&resource=specials,events')
      ])

      if (specialsRes.ok) {
        const specialsData = await specialsRes.json()
        setSpecials(specialsData.specials || [])
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData.events || [])
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setRecentActivity(activityData.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSpecial = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/admin/specials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSpecial,
          price: newSpecial.price ? parseFloat(newSpecial.price) : undefined,
          originalPrice: newSpecial.originalPrice ? parseFloat(newSpecial.originalPrice) : undefined
        })
      })

      if (response.ok) {
        setSuccess('Special created successfully!')
        setNewSpecial({ name: '', description: '', price: '', originalPrice: '', startDate: '', endDate: '', isActive: true, image: '' })
        setShowCreateSpecial(false)
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to create special')
      }
    } catch (error) {
      setError('Failed to create special')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      })

      if (response.ok) {
        setSuccess('Event created successfully!')
        setNewEvent({ name: '', description: '', startDate: '', endDate: '', startTime: '', endTime: '', location: '', isActive: true, image: '' })
        setShowCreateEvent(false)
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to create event')
      }
    } catch (error) {
      setError('Failed to create event')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSpecial = async (special: Special) => {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/specials/${special.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(special)
      })

      if (response.ok) {
        setSuccess('Special updated successfully!')
        setEditingSpecial(null)
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update special')
      }
    } catch (error) {
      setError('Failed to update special')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateEvent = async (event: Event) => {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })

      if (response.ok) {
        setSuccess('Event updated successfully!')
        setEditingEvent(null)
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update event')
      }
    } catch (error) {
      setError('Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSpecial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this special?')) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/specials/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Special deleted successfully!')
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to delete special')
      }
    } catch (error) {
      setError('Failed to delete special')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Event deleted successfully!')
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to delete event')
      }
    } catch (error) {
      setError('Failed to delete event')
    } finally {
      setSaving(false)
    }
  }

  const toggleSpecialStatus = async (special: Special) => {
    const updatedSpecial = { ...special, isActive: !special.isActive }
    await handleUpdateSpecial(updatedSpecial)
  }

  const toggleEventStatus = async (event: Event) => {
    const updatedEvent = { ...event, isActive: !event.isActive }
    await handleUpdateEvent(updatedEvent)
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
          <Breadcrumb items={breadcrumbConfigs.specials} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Specials & Events</h1>
          <p className="text-gray-600">Manage daily specials, events, and entertainment</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-800">{success}</div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'specials', name: 'Daily Specials', count: specials.length },
                { id: 'events', name: 'Events', count: events.length },
                { id: 'calendar', name: 'Calendar View', count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count !== null && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Specials Tab */}
        {activeTab === 'specials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Daily Specials</h2>
              <button
                onClick={() => setShowCreateSpecial(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Special
              </button>
            </div>

            {/* Create Special Form */}
            {showCreateSpecial && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Add New Special</h3>
                <form onSubmit={handleCreateSpecial} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newSpecial.name}
                        onChange={(e) => setNewSpecial({ ...newSpecial, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={newSpecial.image}
                        onChange={(e) => setNewSpecial({ ...newSpecial, image: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSpecial.price}
                        onChange={(e) => setNewSpecial({ ...newSpecial, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Original Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSpecial.originalPrice}
                        onChange={(e) => setNewSpecial({ ...newSpecial, originalPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={newSpecial.startDate}
                        onChange={(e) => setNewSpecial({ ...newSpecial, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={newSpecial.endDate}
                        onChange={(e) => setNewSpecial({ ...newSpecial, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newSpecial.description}
                      onChange={(e) => setNewSpecial({ ...newSpecial, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newSpecial.isActive}
                      onChange={(e) => setNewSpecial({ ...newSpecial, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label className="text-sm text-gray-700">Active</label>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Creating...' : 'Create Special'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateSpecial(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Specials List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">All Specials</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Special
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {specials.map((special) => (
                      <tr key={special.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {special.image && (
                              <img className="h-10 w-10 rounded-lg object-cover mr-3" src={special.image} alt={special.name} />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{special.name}</div>
                              <div className="text-sm text-gray-500">{special.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {special.price && (
                            <div>
                              <span className="font-semibold text-green-600">${special.price.toFixed(2)}</span>
                              {special.originalPrice && (
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  ${special.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(special.startDate).toLocaleDateString()} - {new Date(special.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            special.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {special.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => setEditingSpecial(special)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleSpecialStatus(special)}
                            className={`${
                              special.isActive 
                                ? 'text-orange-600 hover:text-orange-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {special.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteSpecial(special.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Events & Entertainment</h2>
              <button
                onClick={() => setShowCreateEvent(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Event
              </button>
            </div>

            {/* Create Event Form */}
            {showCreateEvent && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Add New Event</h3>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newEvent.name}
                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={newEvent.image}
                        onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newEvent.isActive}
                      onChange={(e) => setNewEvent({ ...newEvent, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label className="text-sm text-gray-700">Active</label>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Creating...' : 'Create Event'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateEvent(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Events List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">All Events</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {event.image && (
                              <img className="h-10 w-10 rounded-lg object-cover mr-3" src={event.image} alt={event.name} />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{event.name}</div>
                              <div className="text-sm text-gray-500">{event.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{new Date(event.startDate).toLocaleDateString()}</div>
                            {event.startTime && event.endTime && (
                              <div className="text-gray-500 text-xs">
                                {event.startTime} - {event.endTime}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.location || 'Main Dining Room'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {event.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => setEditingEvent(event)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleEventStatus(event)}
                            className={`${
                              event.isActive 
                                ? 'text-orange-600 hover:text-orange-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {event.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Calendar View</h2>
              <a
                href="/admin/calendar"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Open Full Calendar
              </a>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 mb-4">View all your specials and events in a calendar format:</p>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar Management</h3>
                <p className="text-gray-600 mb-4">Use the full calendar view to see all your specials and events organized by date.</p>
                <a
                  href="/admin/calendar"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Open Calendar
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <button
                onClick={fetchData}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center space-x-4 group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100">
                        <span className="text-sm text-purple-600">
                          {log.resource === 'specials' ? '🍽️' : '🎉'}
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
                      <p className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
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
