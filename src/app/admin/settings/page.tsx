'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Breadcrumb, breadcrumbConfigs } from '@/components/breadcrumb'

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

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSiteSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      })

      if (response.ok) {
        setSuccess('Site settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to save site settings')
      }
    } catch (error) {
      setError('Failed to save site settings')
    } finally {
      setSaving(false)
    }
  }

  const handleBusinessHoursSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/business-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessHours)
      })

      if (response.ok) {
        setSuccess('Business hours saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to save business hours')
      }
    } catch (error) {
      setError('Failed to save business hours')
    } finally {
      setSaving(false)
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
          <Breadcrumb items={breadcrumbConfigs.settings} />
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Company Info & Settings</h1>
          <p className="text-lg text-gray-600 max-w-3xl">Manage your business information, hours, and system settings. Changes here will be reflected on your public website.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Site Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">Site Information</h2>
            <form onSubmit={handleSiteSettingsSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name *
                </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.name}
                    onChange={(e) => setSiteSettings({ ...siteSettings, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                  <textarea
                    value={siteSettings.description}
                    onChange={(e) => setSiteSettings({ ...siteSettings, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                  <input
                    type="text"
                    value={siteSettings.address}
                    onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={siteSettings.phone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={siteSettings.email}
                    onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={siteSettings.timezone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="America/Denver">Mountain Time (Denver)</option>
                    <option value="America/New_York">Eastern Time (New York)</option>
                    <option value="America/Chicago">Central Time (Chicago)</option>
                    <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                  </select>
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={siteSettings.latitude || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="39.7392"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={siteSettings.longitude || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="-104.9903"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Google Maps Integration */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Google Maps Integration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google Maps Share URL
                    </label>
                    <input
                      type="url"
                      value={siteSettings.googleMapsUrl || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, googleMapsUrl: e.target.value })}
                      placeholder="https://maps.app.goo.gl/LA2AYUTPUreV9KyJ8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Paste the Google Maps share URL here. This makes it easy for bar owners to provide directions.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google Place ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.googlePlaceId || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, googlePlaceId: e.target.value })}
                      placeholder="ChIJ..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Advanced: Google Places API place ID for enhanced integration.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {saving ? 'Saving...' : 'Save Site Information'}
              </button>
            </form>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">Business Hours</h2>
            <form onSubmit={handleBusinessHoursSave} className="space-y-4">
              {Object.entries(businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-20">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => {
                        const newHours = { ...businessHours }
                        newHours[day as keyof BusinessHours] = {
                          ...hours,
                          closed: !e.target.checked
                        }
                        setBusinessHours(newHours)
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-500">Open</span>
                  </div>
                  {!hours.closed && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => {
                          const newHours = { ...businessHours }
                          newHours[day as keyof BusinessHours] = {
                            ...hours,
                            open: e.target.value
                          }
                          setBusinessHours(newHours)
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => {
                          const newHours = { ...businessHours }
                          newHours[day as keyof BusinessHours] = {
                            ...hours,
                            close: e.target.value
                          }
                          setBusinessHours(newHours)
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      />
                    </div>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
              >
                {saving ? 'Saving...' : 'Save Business Hours'}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/admin/users"
            className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                User Management
              </h3>
              <p className="text-sm text-gray-600 mt-1">Manage staff accounts and permissions</p>
            </div>
          </a>

          <button className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 group">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                Activity Log
              </h3>
              <p className="text-sm text-gray-600 mt-1">View recent changes and edits</p>
            </div>
          </button>

          <button className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 group">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                Site Appearance
              </h3>
              <p className="text-sm text-gray-600 mt-1">Customize colors and branding</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
