'use client'

import { useState, useEffect } from 'react'

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

export default function SpecialsPage() {
  const [specials, setSpecials] = useState<Special[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/specials')
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

    fetchSpecials()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Daily Specials</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Daily Specials</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to load specials</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Daily Specials</h1>
        
        {specials.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No specials available</h2>
            <p className="text-gray-600">Check back soon for our daily specials!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specials.map((special) => (
              <div key={special.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2 text-red-600">{special.title}</h3>
                {special.description && (
                  <p className="text-gray-600 mb-3">{special.description}</p>
                )}
                {special.price && (
                  <p className="text-xl font-bold text-red-600">{special.price}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
