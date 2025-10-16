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
  image?: string
  isAvailable: boolean
}

interface MenuCategory {
  id: string
  name: string
  description?: string
  items: MenuItem[]
}

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  const isAdmin = session?.user?.role && ['SUPERADMIN', 'OWNER', 'MANAGER'].includes(session.user.role)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/public/menu')
        if (!response.ok) {
          throw new Error('Failed to fetch menu')
        }
        const data = await response.json()
        setCategories(data.categories)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load menu')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Our Menu</h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Good food, cold drinks, and great times. 
              Everything is made fresh when you order it.
            </p>
          </div>

          {/* Notices Section - Hidden for now */}
          <div className="mb-8 space-y-4 hidden">
            {/* Online Ordering Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <h2 className="text-lg font-semibold text-blue-800">Online Ordering Temporarily Unavailable</h2>
              </div>
              <p className="text-blue-700 mb-4">
                We're working on bringing you online ordering! For now, please call us to place your order.
              </p>
              <a 
                href="tel:3035550123"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call (303) 555-0123
              </a>
            </div>

            {/* Special Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-yellow-800">Special Notes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-yellow-700 text-sm">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  All prices subject to change
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Please inform your server of any allergies
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Substitutions may be available upon request
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Happy Hour: 10am-12pm & 3pm-7pm daily
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading menu...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Our Menu</h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Good food, cold drinks, and great times. 
              Everything is made fresh when you order it.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">Sorry, we're having trouble loading our menu. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Our Menu</h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Good food, cold drinks, and great times. 
            Everything is made fresh when you order it.
          </p>
        </div>
        
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-green-600 text-white p-3">
                <h2 className="text-lg font-bold">{category.name}</h2>
                {category.description && (
                  <p className="text-green-100 text-sm mt-1">{category.description}</p>
                )}
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item, index) => {
                    const isLastRow = index >= category.items.length - 2 && category.items.length % 2 === 0
                    const isLastItem = index === category.items.length - 1
                    return (
                      <div 
                        key={item.id} 
                        className={`pb-3 ${isLastRow || isLastItem ? '' : 'border-b border-gray-200'} ${isAdmin ? 'relative group' : ''}`}
                      >
                        <div className="flex gap-3 items-start mb-1">
                          {/* Image thumbnail if available */}
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                              onError={(e) => {
                                // Hide image if it fails to load
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                            )}
                          </div>
                          <span className="text-green-600 font-bold text-base ml-3 flex-shrink-0">
                            {item.price}
                          </span>
                        </div>
                        
                        {/* Admin Edit Button */}
                        {isAdmin && (
                          <button
                            onClick={() => router.push(`/admin/menu?editItem=${item.id}`)}
                            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg flex items-center gap-1"
                            title={`Edit ${item.name}`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
