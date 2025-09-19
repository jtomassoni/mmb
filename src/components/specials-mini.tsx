'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getImageAlt } from '../lib/image-alt'

interface Special {
  id: string
  title: string
  description: string | null
  price: string | null
  isActive: boolean
}

export default function SpecialsMini() {
  const [specials, setSpecials] = useState<Special[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        const response = await fetch('/api/public/specials')
        if (response.ok) {
          const data = await response.json()
          // Only show first 3 active specials
          setSpecials(data.specials.filter((s: Special) => s.isActive).slice(0, 3))
        }
      } catch (error) {
        console.error('Failed to fetch specials:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpecials()
  }, [])

  // Default specials if none are loaded
  const defaultSpecials = [
    {
      id: 'default-1',
      title: 'Fish & Chips',
      description: 'Beer-battered cod with crispy fries',
      price: '$11.99',
      image: '/pics/monaghans-fish-n-chips.jpg'
    },
    {
      id: 'default-2', 
      title: 'Taco Platter',
      description: 'Fresh tacos with all the fixings',
      price: '$13.99',
      image: '/pics/monaghans-taco-platter.jpg'
    },
    {
      id: 'default-3',
      title: 'Chicken Quesadilla', 
      description: 'Grilled cheese and chicken quesadilla',
      price: '$10.99',
      image: '/pics/monaghans-quesadilla.jpg'
    }
  ]

  const displaySpecials = isLoading || specials.length === 0 ? defaultSpecials : specials

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Today&apos;s Specials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySpecials.map((special, index) => (
            <div key={special.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={special.image || `/pics/monaghans-fish-n-chips.jpg`}
                  alt={special.image ? getImageAlt(special.image.split('/').pop() || '') : `${special.title} - ${special.description || ''}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">{special.title}</h2>
                {special.description && (
                  <p className="text-gray-600 mb-2">{special.description}</p>
                )}
                {special.price && (
                  <p className="text-red-600 font-semibold">{special.price}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href="/specials" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
            View All Specials
          </a>
        </div>
      </div>
    </section>
  )
}
