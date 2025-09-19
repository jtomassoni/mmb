'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: string
  category: string
  isAvailable: boolean
  allergens: string
  calories?: number
  imageUrl?: string
  source: string
  createdAt: string
  updatedAt: string
}

interface MenuSection {
  name: string
  items: MenuItem[]
}

export default function MenuManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sections, setSections] = useState<Record<string, MenuItem[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadForm, setShowUploadForm] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchMenu()
    }
  }, [session])

  const fetchMenu = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Get site ID from URL params or use default
      const urlParams = new URLSearchParams(window.location.search)
      const siteId = urlParams.get('site') || 'default'
      
      const response = await fetch(`/api/menu/parse?siteId=${siteId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setSections(data.sections)
    } catch (error) {
      console.error('Failed to fetch menu:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch menu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File

    if (!file) {
      alert('Please select a file')
      return
    }

    // Get site ID from URL params or use default
    const urlParams = new URLSearchParams(window.location.search)
    const siteId = urlParams.get('site') || 'default'

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('siteId', siteId)

      const response = await fetch('/api/menu/parse', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadProgress(100)
      
      alert(`Successfully parsed ${result.createdItems} menu items!`)
      setShowUploadForm(false)
      fetchMenu() // Refresh the menu
    } catch (error) {
      console.error('Upload failed:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/menu/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable })
      })

      if (!response.ok) {
        throw new Error('Failed to update item')
      }

      // Update local state
      setSections(prev => {
        const newSections = { ...prev }
        Object.keys(newSections).forEach(category => {
          newSections[category] = newSections[category].map(item =>
            item.id === itemId ? { ...item, isAvailable } : item
          )
        })
        return newSections
      })
    } catch (error) {
      console.error('Failed to update item:', error)
      alert('Failed to update item availability')
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="mt-2 text-gray-600">Manage your restaurant menu items</p>
            </div>
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Menu
            </button>
          </div>
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Upload Menu</h2>
              <form onSubmit={handleFileUpload}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Menu File
                  </label>
                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: PDF, JPG, PNG, GIF
                  </p>
                </div>
                
                {isUploading && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Processing menu... {uploadProgress}%
                    </p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Processing...' : 'Upload & Parse'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    disabled={isUploading}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
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
              onClick={fetchMenu}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : Object.keys(sections).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Menu Items</h2>
            <p className="text-gray-600 mb-4">Upload a menu file to get started</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Menu
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(sections).map(([category, items]) => (
              <div key={category} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
                  <p className="text-gray-600">{items.length} items</p>
                </div>
                
                <div className="p-6">
                  <div className="grid gap-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-lg ${
                          item.isAvailable ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              <span className="text-lg font-semibold text-green-600">
                                {item.price}
                              </span>
                              {item.source === 'ocr' && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  OCR
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                            )}
                            {item.allergens && item.allergens !== '[]' && (
                              <p className="text-red-600 text-xs mt-1">
                                Allergens: {JSON.parse(item.allergens).join(', ')}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={item.isAvailable}
                                onChange={(e) => toggleItemAvailability(item.id, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-600">Available</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
