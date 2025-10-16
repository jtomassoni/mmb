'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AdminSubNav } from '@/components/admin-sub-nav'
import { useToast } from '@/components/toast'
import { scrollToFirstError } from '@/lib/smooth-scroll'
import { ProperTimePicker } from '@/components/proper-time-picker'
import { formatTimeInTimezone, getRelativeTime, getCompanyTimezone } from '@/lib/timezone'

interface SiteSettings {
  name: string
  description: string
  address: string
  phone: string
  email: string
  timezone: string
  latitude?: number
  longitude?: number
  googlePlaceId?: string
  googleMapsUrl?: string
}

interface BusinessHours {
  monday: { open: string; close: string; closed: boolean }
  tuesday: { open: string; close: string; closed: boolean }
  wednesday: { open: string; close: string; closed: boolean }
  thursday: { open: string; close: string; closed: boolean }
  friday: { open: string; close: string; closed: boolean }
  saturday: { open: string; close: string; closed: boolean }
  sunday: { open: string; close: string; closed: boolean }
}

interface SpecialDay {
  id: string
  date: string // YYYY-MM-DD format
  reason: string
  closed: boolean
  openTime?: string
  closeTime?: string
  createdAt: string
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

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [savingSite, setSavingSite] = useState(false)
  const [savingHours, setSavingHours] = useState(false)
  const [savingSpecialDays, setSavingSpecialDays] = useState(false)
  const [activityLoading, setActivityLoading] = useState(false)
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])

  // Error state for inline validation errors
  const [siteErrors, setSiteErrors] = useState<Record<string, string[]>>({})
  const [hoursErrors, setHoursErrors] = useState<Record<string, string[]>>({})
  const [specialDaysErrors, setSpecialDaysErrors] = useState<Record<string, string[]>>({})

  // Special days state
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([])
  const [showAddSpecialDay, setShowAddSpecialDay] = useState(false)
  const [editingSpecialDay, setEditingSpecialDay] = useState<SpecialDay | null>(null)
  const [newSpecialDay, setNewSpecialDay] = useState({
    date: new Date().toISOString().split('T')[0], // Default to today
    reason: '',
    closed: true,
    openTime: '11:00',
    closeTime: '02:00'
  })

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    timezone: 'America/Denver',
    latitude: undefined,
    longitude: undefined,
    googlePlaceId: '',
    googleMapsUrl: ''
  })

  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { open: '11:00', close: '22:00', closed: false },
    tuesday: { open: '11:00', close: '22:00', closed: false },
    wednesday: { open: '11:00', close: '22:00', closed: false },
    thursday: { open: '11:00', close: '22:00', closed: false },
    friday: { open: '11:00', close: '23:00', closed: false },
    saturday: { open: '10:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    } else {
      fetchSettings()
    }
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      // Fetch site settings
      const siteResponse = await fetch('/api/admin/site-settings')
      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        setSiteSettings({
          name: siteData.name || '',
          description: siteData.description || '',
          address: siteData.address || '',
          phone: siteData.phone || '',
          email: siteData.email || '',
          timezone: siteData.timezone || 'America/Denver',
          latitude: siteData.latitude || undefined,
          longitude: siteData.longitude || undefined,
          googlePlaceId: siteData.googlePlaceId || '',
          googleMapsUrl: siteData.googleMapsUrl || ''
        })
      }

      // Fetch business hours
      const hoursResponse = await fetch('/api/admin/business-hours')
      if (hoursResponse.ok) {
        const hoursData = await hoursResponse.json()
        setBusinessHours(hoursData)
      }

      // Fetch special days
      await fetchSpecialDays()
      
      // Fetch company activity
      await fetchCompanyActivity()
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanyActivity = async () => {
    try {
      setActivityLoading(true)
      const response = await fetch('/api/admin/activity?limit=5&filter=all')
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data.logs)
      }
    } catch (error) {
      console.error('Error fetching company activity:', error)
    } finally {
      setActivityLoading(false)
    }
  }

  const handleSiteSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSite(true)
    setSiteErrors({}) // Clear previous errors

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      })

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Settings Saved!',
          message: 'Your restaurant information has been updated successfully.',
          duration: 4000
        })
      } else {
        const errorData = await response.json()
        
        // Handle validation errors with field-specific messages
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors: Record<string, string[]> = {}
          errorData.details.forEach((detail: string) => {
            const [field, ...errorParts] = detail.split(': ')
            const errorMessage = errorParts.join(': ')
            if (!fieldErrors[field.toLowerCase()]) {
              fieldErrors[field.toLowerCase()] = []
            }
            fieldErrors[field.toLowerCase()].push(errorMessage)
          })
          setSiteErrors(fieldErrors)
          
          // Scroll to first error field with smooth animation
          setTimeout(() => {
            scrollToFirstError({
              duration: 800,
              offset: -50, // Slight offset above center
              focusAfterScroll: true,
              easing: 'easeInOutCubic'
            })
          }, 150)
        } else {
          addToast({
            type: 'error',
            title: 'Save Failed',
            message: errorData.error || 'Failed to save settings. Please try again.',
            duration: 6000
          })
        }
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Network error. Please check your connection and try again.',
        duration: 6000
      })
    } finally {
      setSavingSite(false)
    }
  }

  const handleBusinessHoursSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingHours(true)
    setHoursErrors({}) // Clear previous errors

    try {
      const response = await fetch('/api/admin/business-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessHours)
      })

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Business Hours Saved!',
          message: 'Your operating hours have been updated successfully.',
          duration: 4000
        })
      } else {
        const errorData = await response.json()
        
        // Handle validation errors with field-specific messages
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors: Record<string, string[]> = {}
          errorData.details.forEach((detail: string) => {
            const [field, ...errorParts] = detail.split(': ')
            const errorMessage = errorParts.join(': ')
            if (!fieldErrors[field.toLowerCase()]) {
              fieldErrors[field.toLowerCase()] = []
            }
            fieldErrors[field.toLowerCase()].push(errorMessage)
          })
          setHoursErrors(fieldErrors)
          
          // Scroll to first error field with smooth animation
          setTimeout(() => {
            scrollToFirstError({
              duration: 800,
              offset: -50, // Slight offset above center
              focusAfterScroll: true,
              easing: 'easeInOutCubic'
            })
          }, 150)
        } else {
          addToast({
            type: 'error',
            title: 'Save Failed',
            message: errorData.error || 'Failed to save business hours. Please try again.',
            duration: 6000
          })
        }
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Network error. Please check your connection and try again.',
        duration: 6000
      })
    } finally {
      setSavingHours(false)
    }
  }

  // Special Days Functions
  const fetchSpecialDays = async () => {
    try {
      const response = await fetch('/api/admin/special-days')
      if (response.ok) {
        const data = await response.json()
        setSpecialDays(data.specialDays || [])
      }
    } catch (error) {
      console.error('Failed to fetch special days:', error)
    }
  }

  const handleAddSpecialDay = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSpecialDays(true)
    setSpecialDaysErrors({})

    try {
      const response = await fetch('/api/admin/special-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpecialDay)
      })

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Special Day Added!',
          message: 'The special day has been added successfully.',
          duration: 4000
        })
        await fetchSpecialDays()
        setShowAddSpecialDay(false)
        setNewSpecialDay({
          date: new Date().toISOString().split('T')[0], // Reset to today
          reason: '',
          closed: true,
          openTime: '11:00',
          closeTime: '02:00'
        })
      } else {
        const errorData = await response.json()
        
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors: Record<string, string[]> = {}
          errorData.details.forEach((detail: string) => {
            const [field, ...errorParts] = detail.split(': ')
            const errorMessage = errorParts.join(': ')
            if (!fieldErrors[field.toLowerCase()]) {
              fieldErrors[field.toLowerCase()] = []
            }
            fieldErrors[field.toLowerCase()].push(errorMessage)
          })
          setSpecialDaysErrors(fieldErrors)
          
          setTimeout(() => {
            scrollToFirstError({
              duration: 800,
              offset: -50,
              focusAfterScroll: true,
              easing: 'easeInOutCubic'
            })
          }, 150)
        } else {
          addToast({
            type: 'error',
            title: 'Save Failed',
            message: errorData.error || 'Failed to add special day. Please try again.',
            duration: 6000
          })
        }
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to add special day. Please try again.',
        duration: 6000
      })
    } finally {
      setSavingSpecialDays(false)
    }
  }

  const handleUpdateSpecialDay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSpecialDay) return
    
    setSavingSpecialDays(true)
    setSpecialDaysErrors({})

    try {
      const response = await fetch(`/api/admin/special-days/${editingSpecialDay.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editingSpecialDay.date.split('T')[0], // Ensure date is in YYYY-MM-DD format
          reason: editingSpecialDay.reason,
          closed: editingSpecialDay.closed,
          openTime: editingSpecialDay.openTime,
          closeTime: editingSpecialDay.closeTime
        })
      })

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Special Day Updated!',
          message: 'The special day has been updated successfully.',
          duration: 4000
        })
        await fetchSpecialDays()
        setEditingSpecialDay(null)
      } else {
        const errorData = await response.json()
        
        // Handle validation errors with field-specific messages
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors: Record<string, string[]> = {}
          errorData.details.forEach((detail: string) => {
            const [field, ...errorParts] = detail.split(': ')
            const errorMessage = errorParts.join(': ')
            if (!fieldErrors[field.toLowerCase()]) {
              fieldErrors[field.toLowerCase()] = []
            }
            fieldErrors[field.toLowerCase()].push(errorMessage)
          })
          setSpecialDaysErrors(fieldErrors)
          
          setTimeout(() => {
            scrollToFirstError({
              duration: 800,
              offset: -50,
              focusAfterScroll: true,
              easing: 'easeInOutCubic'
            })
          }, 100)
        }
        
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: errorData.error || 'Failed to update special day. Please check your inputs.',
          duration: 6000
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'An error occurred while updating the special day.',
        duration: 6000
      })
    } finally {
      setSavingSpecialDays(false)
    }
  }

  const handleDeleteSpecialDay = async (id: string) => {
    if (!confirm('Are you sure you want to delete this special day?')) return
    
    try {
      const response = await fetch(`/api/admin/special-days/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Special Day Deleted!',
          message: 'The special day has been removed successfully.',
          duration: 4000
        })
        await fetchSpecialDays()
      } else {
        const errorData = await response.json()
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: errorData.error || 'Failed to delete special day. Please try again.',
          duration: 6000
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete special day. Please try again.',
        duration: 6000
      })
    }
  }


  // Helper component for displaying field errors
  const FieldError = ({ fieldName }: { fieldName: string }) => {
    const errors = siteErrors[fieldName.toLowerCase()]
    if (!errors || errors.length === 0) return null
    
    return (
      <div className="mt-1">
        {errors.map((error, index) => (
          <p key={index} className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        ))}
      </div>
    )
  }

  // Helper component for displaying hours errors
  const HoursFieldError = ({ dayName, timeType }: { dayName: string; timeType: 'open' | 'close' }) => {
    const fieldKey = `${dayName} ${timeType} time`
    const errors = hoursErrors[fieldKey.toLowerCase()]
    if (!errors || errors.length === 0) return null
    
    return (
      <div className="mt-1">
        {errors.map((error, index) => (
          <p key={index} className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        ))}
      </div>
    )
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
        {/* Header */}
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Info & Settings</h1>
            <p className="text-sm text-gray-600 max-w-3xl">Manage your business information, hours, and system settings. Changes here will be reflected on your public website.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Company Information - Horizontal Layout */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
              <button
                onClick={handleSiteSettingsSave}
                disabled={savingSite}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm"
              >
                {savingSite ? 'Saving...' : 'Save'}
              </button>
            </div>
            <form onSubmit={handleSiteSettingsSave} className="space-y-4">
              {/* Basic Info Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.name}
                    onChange={(e) => setSiteSettings({ ...siteSettings, name: e.target.value })}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
                      siteErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError fieldName="name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={siteSettings.phone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
                      siteErrors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError fieldName="phone" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={siteSettings.email}
                    onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
                      siteErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError fieldName="email" />
                </div>
              </div>

              {/* Address Row */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={siteSettings.address}
                  onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
                    siteErrors.address ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError fieldName="address" />
              </div>

              {/* Description Row */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={siteSettings.description}
                  onChange={(e) => setSiteSettings({ ...siteSettings, description: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
                    siteErrors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError fieldName="description" />
              </div>

              {/* Location & Maps Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={siteSettings.timezone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, timezone: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="America/Denver">Mountain Time (Denver)</option>
                    <option value="America/New_York">Eastern Time (New York)</option>
                    <option value="America/Chicago">Central Time (Chicago)</option>
                    <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={siteSettings.latitude || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="39.7392"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={siteSettings.longitude || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="-104.9903"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Google Maps Integration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Google Maps Share URL
                  </label>
                  <input
                    type="url"
                    value={siteSettings.googleMapsUrl || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/..."
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
                      siteErrors['google maps url'] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError fieldName="google maps url" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Google Place ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.googlePlaceId || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, googlePlaceId: e.target.value })}
                    placeholder="ChIJ..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Hours Management Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Hours Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your regular business hours and special operating days</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Regular Business Hours */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">Regular Business Hours</h3>
                  <button
                    onClick={handleBusinessHoursSave}
                    disabled={savingHours}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm"
                  >
                    {savingHours ? 'Saving...' : 'Save'}
                  </button>
                </div>

                <form onSubmit={handleBusinessHoursSave} className="space-y-1.5">
                  {Object.entries(businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-2 py-1.5 px-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                      {/* Day Name */}
                      <div className="w-12 flex-shrink-0">
                        <span className="font-medium text-gray-900 capitalize text-xs">{day.slice(0, 3)}</span>
                      </div>
                      
                      {/* Open/Closed Toggle */}
                      <div className="flex-shrink-0">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => {
                              const newHours = { ...businessHours }
                              newHours[day as keyof BusinessHours] = {
                                ...hours,
                                closed: !e.target.checked,
                                open: !e.target.checked ? (hours.open || '11:00') : '',
                                close: !e.target.checked ? (hours.close || '02:00') : ''
                              }
                              setBusinessHours(newHours)
                            }}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">Open</span>
                        </label>
                      </div>

                      {/* Time Inputs */}
                      {!hours.closed ? (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1">
                            <ProperTimePicker
                              value={hours.open}
                              onChange={(value) => {
                                const newHours = { ...businessHours }
                                newHours[day as keyof BusinessHours] = {
                                  ...hours,
                                  open: value
                                }
                                setBusinessHours(newHours)
                              }}
                              error={!!hoursErrors[`${day} open time`]}
                            />
                          </div>
                          <span className="text-gray-400 text-xs">-</span>
                          <div className="flex-1">
                            <ProperTimePicker
                              value={hours.close}
                              onChange={(value) => {
                                const newHours = { ...businessHours }
                                newHours[day as keyof BusinessHours] = {
                                  ...hours,
                                  close: value
                                }
                                setBusinessHours(newHours)
                              }}
                              error={!!hoursErrors[`${day} close time`]}
                            />
                          </div>
                          {/* Duration inline */}
                          {hours.open && hours.close && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium ml-2">
                              {(() => {
                                const [openHour, openMinute] = hours.open.split(':')
                                const [closeHour, closeMinute] = hours.close.split(':')
                                const openNum = parseInt(openHour) + (parseInt(openMinute) / 60)
                                const closeNum = parseInt(closeHour) + (parseInt(closeMinute) / 60)
                                
                                let duration = closeNum - openNum
                                
                                // Handle 24-hour operation (00:00 to 23:59)
                                if (hours.open === '00:00' && hours.close === '23:59') {
                                  return '24h'
                                }
                                
                                // Handle overnight hours (e.g., 22:00 to 06:00)
                                if (duration < 0) {
                                  duration += 24
                                }
                                
                                return `${Math.round(duration)}h`
                              })()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center">
                          <span className="text-xs text-gray-500 italic">Closed</span>
                        </div>
                      )}
                    </div>
                  ))}
                </form>
              </div>

              {/* Special Days */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Special Days</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Override regular hours for holidays, closures, or events
                  </p>
                </div>

                {/* Add Special Day Button */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowAddSpecialDay(!showAddSpecialDay)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Special Day
                  </button>
                </div>

                {/* Add Special Day Form */}
                {showAddSpecialDay && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Add New Special Day</h4>
                    <form onSubmit={handleAddSpecialDay} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date *
                          </label>
                            <input
                              type="date"
                              required
                              min={new Date().toISOString().split('T')[0]}
                              value={newSpecialDay.date}
                              onChange={(e) => setNewSpecialDay({ ...newSpecialDay, date: e.target.value })}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-gray-900 ${
                                specialDaysErrors.date 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                              }`}
                            />
                          {specialDaysErrors.date && (
                            <div className="mt-2 space-y-1">
                              {specialDaysErrors.date.map((error, index) => (
                                <p key={index} className="text-sm text-red-700 flex items-center gap-2 bg-red-50 p-2 rounded border border-red-200">
                                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  {error}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reason */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason *
                          </label>
                          <input
                            type="text"
                            required
                            value={newSpecialDay.reason}
                            onChange={(e) => setNewSpecialDay({ ...newSpecialDay, reason: e.target.value })}
                            placeholder="e.g., Holiday closure, City water shutoff"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                              specialDaysErrors.reason ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {specialDaysErrors.reason && (
                            <div className="mt-1">
                              {specialDaysErrors.reason.map((error, index) => (
                                <p key={index} className="text-sm text-red-600 flex items-center gap-1">
                                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  {error}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Open/Closed Toggle */}
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newSpecialDay.closed}
                            onChange={(e) => setNewSpecialDay({
                              ...newSpecialDay,
                              closed: e.target.checked,
                              openTime: !e.target.checked ? '11:00' : newSpecialDay.openTime,
                              closeTime: !e.target.checked ? '02:00' : newSpecialDay.closeTime
                            })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Closed all day</span>
                        </label>
                      </div>

                      {/* Time Inputs (only show if not closed) */}
                      {!newSpecialDay.closed && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Open From</label>
                            <ProperTimePicker
                              value={newSpecialDay.openTime}
                              onChange={(value) => setNewSpecialDay({ ...newSpecialDay, openTime: value })}
                              error={!!specialDaysErrors.openTime}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Close At</label>
                            <ProperTimePicker
                              value={newSpecialDay.closeTime}
                              onChange={(value) => setNewSpecialDay({ ...newSpecialDay, closeTime: value })}
                              error={!!specialDaysErrors.closeTime}
                            />
                          </div>
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddSpecialDay(false)
                            setNewSpecialDay({
                              date: '',
                              reason: '',
                              closed: true,
                              openTime: '11:00',
                              closeTime: '02:00'
                            })
                            setSpecialDaysErrors({})
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingSpecialDays}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingSpecialDays ? 'Adding...' : 'Add Special Day'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Special Days List */}
                <div className="space-y-3">
                  {specialDays.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm">No special days configured</p>
                      <p className="text-xs text-gray-400">Add special days for holidays, closures, or events</p>
                    </div>
                  ) : (
                    specialDays.map((day) => (
                      editingSpecialDay?.id === day.id ? (
                        // Edit Form
                        <div key={day.id} className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Edit Special Day</h4>
                          <form onSubmit={handleUpdateSpecialDay} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                <input
                                  type="date"
                                  required
                                  min={new Date().toISOString().split('T')[0]}
                                  value={editingSpecialDay.date.split('T')[0]}
                                  onChange={(e) => setEditingSpecialDay({ ...editingSpecialDay, date: e.target.value })}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-gray-900 ${
                                    specialDaysErrors.date 
                                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                  }`}
                                />
                                {specialDaysErrors.date && (
                                  <div className="mt-2 space-y-1">
                                    {specialDaysErrors.date.map((error, index) => (
                                      <p key={index} className="text-sm text-red-700 flex items-center gap-2 bg-red-50 p-2 rounded border border-red-200">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                                <input
                                  type="text"
                                  required
                                  value={editingSpecialDay.reason}
                                  onChange={(e) => setEditingSpecialDay({ ...editingSpecialDay, reason: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  placeholder="e.g., Holiday closure, Early opening for Broncos game"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editingSpecialDay.closed}
                                  onChange={(e) => setEditingSpecialDay({ 
                                    ...editingSpecialDay, 
                                    closed: e.target.checked,
                                    openTime: !e.target.checked ? (editingSpecialDay.openTime || '11:00') : editingSpecialDay.openTime,
                                    closeTime: !e.target.checked ? (editingSpecialDay.closeTime || '02:00') : editingSpecialDay.closeTime
                                  })}
                                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Closed all day</span>
                              </label>
                            </div>
                            {!editingSpecialDay.closed && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Open At</label>
                                  <ProperTimePicker
                                    value={editingSpecialDay.openTime || '11:00'}
                                    onChange={(value) => setEditingSpecialDay({ ...editingSpecialDay, openTime: value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Close At</label>
                                  <ProperTimePicker
                                    value={editingSpecialDay.closeTime || '02:00'}
                                    onChange={(value) => setEditingSpecialDay({ ...editingSpecialDay, closeTime: value })}
                                  />
                                </div>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-4">
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingSpecialDay) {
                                    handleDeleteSpecialDay(editingSpecialDay.id)
                                    setEditingSpecialDay(null)
                                  }
                                }}
                                className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
                              >
                                Delete
                              </button>
                              <div className="flex space-x-3">
                                <button
                                  type="button"
                                  onClick={() => setEditingSpecialDay(null)}
                                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={savingSpecialDays}
                                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {savingSpecialDays ? 'Updating...' : 'Update'}
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      ) : (
                        // Display Mode
                        <div key={day.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(day.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </div>
                              <div className="text-sm text-gray-600">{day.reason}</div>
                              <div className="flex items-center space-x-2">
                                {day.closed ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                                    Closed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                    {day.openTime} - {day.closeTime}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingSpecialDay(day)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit special day"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSpecialDay(day.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete special day"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Activity Log */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Company Activity</h2>
                <button 
                  onClick={fetchCompanyActivity}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="p-6">
              {activityLoading ? (
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
                            'bg-gray-100'
                          }`}>
                            <span className={`text-sm ${
                              log.resource === 'site_settings' ? 'text-indigo-600' :
                              log.resource === 'business_hours' ? 'text-green-600' :
                              log.resource === 'special_day' ? 'text-yellow-600' :
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
                            <span className="lowercase">{log.action.toLowerCase() === 'update' ? 'updated' : log.action.toLowerCase()}</span>
                            {' '}
                            <span className="font-medium capitalize">
                              {log.resource === 'site_settings' ? 'Company Info' : log.resource.replace('_', ' ')}
                            </span>
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
                                
                            // Handle business hours format (single object with all days)
                            if (key === 'businessHours' && typeof value === 'object' && value !== null && !('old' in value) && !('new' in value)) {
                              const oldBusinessHours = log.oldValue && typeof log.oldValue === 'object' && log.oldValue !== null ? log.oldValue[key] : null
                              
                              if (!oldBusinessHours || typeof oldBusinessHours !== 'object') {
                                return null
                              }
                              
                              // Find days that actually changed
                              const changedDays = Object.entries(value).filter(([day, newDayHours]) => {
                                const oldDayHours = (oldBusinessHours as any)[day]
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
                  <p className="mt-2 text-sm text-gray-500">No company activity found.</p>
                  <p className="text-xs text-gray-400">Changes to company settings will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
