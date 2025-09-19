'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Special {
  id: string
  title: string
  description: string | null
  price: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  site: {
    name: string
    slug: string
  }
}

export default function AdminSpecialsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [specials, setSpecials] = useState<Special[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSpecial, setEditingSpecial] = useState<Special | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchSpecials()
    }
  }, [session, showInactive])

  const fetchSpecials = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const url = `/api/specials${showInactive ? '?includeInactive=true' : ''}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setSpecials(data.specials)
    } catch (error) {
      console.error('Failed to fetch specials:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch specials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (specialId: string) => {
    if (!confirm('Are you sure you want to delete this special?')) {
      return
    }

    try {
      const response = await fetch(`/api/specials?id=${specialId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete special')
      }

      setSpecials(specials.filter(special => special.id !== specialId))
    } catch (error) {
      console.error('Failed to delete special:', error)
      alert('Failed to delete special')
    }
  }

  const handleToggleActive = async (special: Special) => {
    try {
      const response = await fetch('/api/specials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: special.id,
          title: special.title,
          description: special.description,
          price: special.price,
          isActive: !special.isActive
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update special')
      }

      const result = await response.json()
      setSpecials(specials.map(s => 
        s.id === special.id ? result.special : s
      ))
    } catch (error) {
      console.error('Failed to toggle special:', error)
      alert('Failed to update special')
    }
  }

  const handleEdit = (special: Special) => {
    setEditingSpecial(special)
    setShowForm(true)
  }

  const handleFormSubmit = async (formData: FormData) => {
    try {
      const specialData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: formData.get('price') as string,
        isActive: formData.get('isActive') === 'on'
      }

      let response
      if (editingSpecial) {
        // Update existing special
        response = await fetch('/api/specials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingSpecial.id, ...specialData })
        })
      } else {
        // Create new special
        response = await fetch('/api/specials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId: 'default', ...specialData })
        })
      }

      if (!response.ok) {
        throw new Error('Failed to save special')
      }

      const result = await response.json()
      
      if (editingSpecial) {
        setSpecials(specials.map(special => 
          special.id === editingSpecial.id ? result.special : special
        ))
      } else {
        setSpecials([...specials, result.special])
      }

      setShowForm(false)
      setEditingSpecial(null)
    } catch (error) {
      console.error('Failed to save special:', error)
      alert('Failed to save special')
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  }

  if (!session) {
    return null
  }

  const activeSpecials = specials.filter(s => s.isActive)
  const inactiveSpecials = specials.filter(s => !s.isActive)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Specials Management</h1>
          <p className="mt-2 text-gray-600">Manage your restaurant daily specials and rotating menu items</p>
        </div>

        <div className="mb-6 flex gap-4 items-center">
          <button
            onClick={() => {
              setEditingSpecial(null)
              setShowForm(true)
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Add New Special
          </button>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="mr-2"
            />
            Show inactive specials
          </label>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingSpecial ? 'Edit Special' : 'Add New Special'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleFormSubmit(new FormData(e.currentTarget))
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingSpecial?.title || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    placeholder="$12.99"
                    defaultValue={editingSpecial?.price || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingSpecial?.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="Describe the special, ingredients, or preparation..."
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingSpecial?.isActive !== false}
                    className="mr-2"
                  />
                  Active (visible to customers)
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {editingSpecial ? 'Update Special' : 'Create Special'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSpecial(null)
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchSpecials}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Specials */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Active Specials ({activeSpecials.length})
              </h2>
              {activeSpecials.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600">No active specials. Create your first special!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeSpecials.map((special) => (
                    <div key={special.id} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-red-600">{special.title}</h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                      {special.description && (
                        <p className="text-gray-600 mb-3 text-sm">{special.description}</p>
                      )}
                      {special.price && (
                        <p className="text-lg font-bold text-red-600 mb-4">{special.price}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(special)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(special)}
                          className="text-orange-600 hover:text-orange-900 text-sm"
                        >
                          Deactivate
                        </button>
                        <button
                          onClick={() => handleDelete(special.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inactive Specials */}
            {showInactive && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Inactive Specials ({inactiveSpecials.length})
                </h2>
                {inactiveSpecials.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow text-center">
                    <p className="text-gray-600">No inactive specials.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inactiveSpecials.map((special) => (
                      <div key={special.id} className="bg-gray-50 p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-600">{special.title}</h3>
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            Inactive
                          </span>
                        </div>
                        {special.description && (
                          <p className="text-gray-500 mb-3 text-sm">{special.description}</p>
                        )}
                        {special.price && (
                          <p className="text-lg font-bold text-gray-600 mb-4">{special.price}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(special)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(special)}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Activate
                          </button>
                          <button
                            onClick={() => handleDelete(special.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
