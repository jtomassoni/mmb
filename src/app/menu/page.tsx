'use client'

import { useState, useEffect } from 'react'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: string
  category: string
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
              Fresh ingredients, great flavors, and generous portions. 
              Everything is made to order with care.
            </p>
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
              Fresh ingredients, great flavors, and generous portions. 
              Everything is made to order with care.
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
            Fresh ingredients, great flavors, and generous portions. 
            Everything is made to order with care.
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
                  {category.items.map((item) => (
                    <div key={item.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                          )}
                        </div>
                        <span className="text-green-600 font-bold text-base ml-3">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Special Notes */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-yellow-800 mb-2">Special Notes</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• All prices subject to change</li>
            <li>• Please inform your server of any allergies</li>
            <li>• Substitutions may be available upon request</li>
            <li>• Happy Hour: 10am-12pm & 3pm-7pm daily</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
