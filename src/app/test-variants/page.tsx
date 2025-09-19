'use client'

import { useState } from 'react'
import { BusinessVariant } from '../../lib/design-tokens'
import { VariantPageTest } from '../../components/variant-test-wrapper'
import { BusinessInfo } from '../../lib/json-ld-presets'

const testBusinessInfo: Record<BusinessVariant, BusinessInfo> = {
  dive_bar: {
    name: 'The Local Dive',
    description: 'Where locals come to unwind with cold beer and hot food',
    url: 'https://thelocaldive.com',
    address: {
      streetAddress: '123 Main St',
      addressLocality: 'Downtown Denver',
      addressRegion: 'CO',
      postalCode: '80202',
      addressCountry: 'US'
    },
    telephone: '+1-555-123-4567',
    email: 'info@thelocaldive.com',
    openingHours: ['Mo-Fr 16:00-02:00', 'Sa-Su 12:00-02:00'],
    priceRange: '$',
    servesCuisine: ['American', 'Bar Food'],
    acceptsReservations: false,
    hasMenu: 'https://thelocaldive.com/menu',
    paymentAccepted: ['Cash', 'Credit Card'],
    currenciesAccepted: 'USD'
  },
  fine_dining: {
    name: 'Chef\'s Table',
    description: 'An exquisite culinary experience with artisanal cuisine',
    url: 'https://chefstable.com',
    address: {
      streetAddress: '456 Uptown Ave',
      addressLocality: 'Uptown Denver',
      addressRegion: 'CO',
      postalCode: '80206',
      addressCountry: 'US'
    },
    telephone: '+1-555-234-5678',
    email: 'reservations@chefstable.com',
    openingHours: ['Tu-Sa 17:00-22:00'],
    priceRange: '$$$$',
    servesCuisine: ['Contemporary', 'Fine Dining'],
    acceptsReservations: true,
    hasMenu: 'https://chefstable.com/menu',
    paymentAccepted: ['Credit Card', 'Debit Card'],
    currenciesAccepted: 'USD'
  },
  cafe: {
    name: 'Morning Brew Café',
    description: 'Your daily dose of comfort with fresh coffee and homemade pastries',
    url: 'https://morningbrew.com',
    address: {
      streetAddress: '789 Capitol Hill Blvd',
      addressLocality: 'Capitol Hill',
      addressRegion: 'CO',
      postalCode: '80203',
      addressCountry: 'US'
    },
    telephone: '+1-555-345-6789',
    email: 'hello@morningbrew.com',
    openingHours: ['Mo-Fr 06:00-18:00', 'Sa-Su 07:00-17:00'],
    priceRange: '$$',
    servesCuisine: ['Coffee', 'Pastries', 'Light Meals'],
    acceptsReservations: false,
    hasMenu: 'https://morningbrew.com/menu',
    paymentAccepted: ['Cash', 'Credit Card', 'Mobile Payment'],
    currenciesAccepted: 'USD'
  },
  sports_bar: {
    name: 'Game Day Sports Bar',
    description: 'Game day headquarters with big screens and cold beer',
    url: 'https://gamedaysports.com',
    address: {
      streetAddress: '321 LoDo St',
      addressLocality: 'LoDo',
      addressRegion: 'CO',
      postalCode: '80202',
      addressCountry: 'US'
    },
    telephone: '+1-555-456-7890',
    email: 'info@gamedaysports.com',
    openingHours: ['Mo-Su 11:00-01:00'],
    priceRange: '$$',
    servesCuisine: ['American', 'Sports Bar Food'],
    acceptsReservations: true,
    hasMenu: 'https://gamedaysports.com/menu',
    paymentAccepted: ['Cash', 'Credit Card'],
    currenciesAccepted: 'USD'
  },
  family_restaurant: {
    name: 'Family Table Restaurant',
    description: 'Where families come together for homestyle cooking',
    url: 'https://familytable.com',
    address: {
      streetAddress: '654 Suburb Lane',
      addressLocality: 'Suburbs',
      addressRegion: 'CO',
      postalCode: '80220',
      addressCountry: 'US'
    },
    telephone: '+1-555-567-8901',
    email: 'info@familytable.com',
    openingHours: ['Mo-Su 07:00-21:00'],
    priceRange: '$$',
    servesCuisine: ['American', 'Homestyle', 'Family'],
    acceptsReservations: true,
    hasMenu: 'https://familytable.com/menu',
    paymentAccepted: ['Cash', 'Credit Card'],
    currenciesAccepted: 'USD'
  }
}

const variants: BusinessVariant[] = ['dive_bar', 'fine_dining', 'cafe', 'sports_bar', 'family_restaurant']
const pageTypes = ['home', 'about', 'menu', 'events', 'specials', 'reviews', 'visit'] as const

export default function TestVariantsPage() {
  const [selectedVariant, setSelectedVariant] = useState<BusinessVariant>('dive_bar')
  const [selectedPageType, setSelectedPageType] = useState<typeof pageTypes[number]>('home')
  const [showComparison, setShowComparison] = useState(false)
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold mb-4">Variant Testing Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Variant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Variant:
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value as BusinessVariant)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {variants.map(variant => (
                  <option key={variant} value={variant}>
                    {variant.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Page Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Page Type:
              </label>
              <select
                value={selectedPageType}
                onChange={(e) => setSelectedPageType(e.target.value as typeof pageTypes[number])}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {pageTypes.map(pageType => (
                  <option key={pageType} value={pageType}>
                    {pageType.charAt(0).toUpperCase() + pageType.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Comparison Toggle */}
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show Comparison View
                </span>
              </label>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedVariant('dive_bar')
                setSelectedPageType('home')
              }}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
            >
              Dive Bar Home
            </button>
            <button
              onClick={() => {
                setSelectedVariant('fine_dining')
                setSelectedPageType('home')
              }}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
            >
              Fine Dining Home
            </button>
            <button
              onClick={() => {
                setSelectedVariant('cafe')
                setSelectedPageType('home')
              }}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
            >
              Café Home
            </button>
            <button
              onClick={() => {
                setSelectedVariant('sports_bar')
                setSelectedPageType('home')
              }}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
            >
              Sports Bar Home
            </button>
            <button
              onClick={() => {
                setSelectedVariant('family_restaurant')
                setSelectedPageType('home')
              }}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm hover:bg-purple-200"
            >
              Family Restaurant Home
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {showComparison ? (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold">Variant Comparison</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {variants.slice(0, 2).map(variant => (
                <div key={variant} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h3 className="font-medium">
                      {variant.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                  </div>
                  <div className="h-96 overflow-auto">
                    <VariantPageTest
                      variant={variant}
                      businessInfo={testBusinessInfo[variant]}
                      pageType={selectedPageType}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">
                Current Selection: {selectedVariant.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - {selectedPageType.charAt(0).toUpperCase() + selectedPageType.slice(1)}
              </h2>
              <p className="text-gray-600 text-sm">
                Business: {testBusinessInfo[selectedVariant].name}
              </p>
              <p className="text-gray-600 text-sm">
                Location: {testBusinessInfo[selectedVariant].address.addressLocality}
              </p>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <VariantPageTest
                variant={selectedVariant}
                businessInfo={testBusinessInfo[selectedVariant]}
                pageType={selectedPageType}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 border-t">
        <div className="container mx-auto px-6 py-4">
          <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Use the dropdowns above to switch between different variants and page types</li>
            <li>• Enable "Show Comparison View" to see two variants side by side</li>
            <li>• Use the quick action buttons to quickly jump to specific variant combinations</li>
            <li>• Check the browser's developer tools to see the applied CSS custom properties</li>
            <li>• Use this page to manually verify that design tokens are working correctly</li>
            <li>• Run Playwright tests to capture automated snapshots of each variant</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
