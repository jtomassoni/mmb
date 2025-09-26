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
        
        const response = await fetch('/api/public/specials')
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
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Daily Specials at Monaghan's</h2>
              <p className="text-gray-600 mb-6">Join us for our weekly specials and happy hour deals!</p>
            </div>
            
            {/* Happy Hour Section */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-red-600 mb-4 text-center">🍺 Happy Hour</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Morning Happy Hour</h4>
                  <p className="text-gray-700 font-medium">10:00 AM - 12:00 PM</p>
                  <p className="text-sm text-gray-600">Daily</p>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Evening Happy Hour</h4>
                  <p className="text-gray-700 font-medium">3:00 PM - 7:00 PM</p>
                  <p className="text-sm text-gray-600">Daily</p>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-lg font-bold text-red-600">BOGO First Round</p>
                <p className="text-gray-700">Wine, Wells, or Drafts</p>
              </div>
            </div>
            
            {/* Daily Specials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-red-500">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🌯</span>
                  <h3 className="text-lg font-semibold text-red-600">Monday Special</h3>
                </div>
                <p className="text-gray-600 mb-3">Chimichangas</p>
                <p className="text-xl font-bold text-red-600">Special Price</p>
                <p className="text-sm text-gray-500 mt-2">Plus Poker Night at 7pm</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-orange-500">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🌮</span>
                  <h3 className="text-lg font-semibold text-orange-600">Tuesday - Taco Tuesday</h3>
                </div>
                <p className="text-gray-600 mb-3">All day special</p>
                <div className="space-y-1">
                  <p className="font-bold text-orange-600">Beef Tacos: $1.50</p>
                  <p className="font-bold text-orange-600">Chicken/Carnitas: $2.00</p>
                  <p className="font-bold text-orange-600">Fish Tacos: $3.00</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">+ Mexican beer specials!</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-amber-500">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🥃</span>
                  <h3 className="text-lg font-semibold text-amber-600">Wednesday - Whiskey Wednesday</h3>
                </div>
                <p className="text-gray-600 mb-3">$1 off all whiskey</p>
                <p className="text-xl font-bold text-amber-600">Southwest Eggrolls</p>
                <p className="text-sm text-gray-500 mt-2">With rice & beans</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🍺</span>
                  <h3 className="text-lg font-semibold text-blue-600">Thursday - Thirsty Thursday</h3>
                </div>
                <p className="text-gray-600 mb-3">$1 off all tequila</p>
                <p className="text-xl font-bold text-blue-600">Philly Cheesesteak</p>
                <p className="text-sm text-gray-500 mt-2">Or quesadilla + Music Bingo</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-green-500">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🍺</span>
                  <h3 className="text-lg font-semibold text-green-600">Mexican Beer Specials</h3>
                </div>
                <p className="text-gray-600 mb-3">Dos Equis, Modelo, Pacifico, Corona</p>
                <p className="text-xl font-bold text-green-600">$4 Each</p>
                <p className="text-sm text-gray-500 mt-2">Available during Taco Tuesday</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🎵</span>
                  <h3 className="text-lg font-semibold text-purple-600">Music Bingo</h3>
                </div>
                <p className="text-gray-600 mb-3">Thursday nights</p>
                <p className="text-xl font-bold text-purple-600">Cash Prizes</p>
                <p className="text-sm text-gray-500 mt-2">Join the fun!</p>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">More Than Just Great Deals</h3>
              <p className="text-gray-600">
                At Monaghan's, we're owned by someone who was the General Manager for over a decade. 
                The regulars and guests couldn't be happier for such a hard worker who knows 
                every detail of this place.
              </p>
            </div>
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
