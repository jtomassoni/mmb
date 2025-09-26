'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Define types locally since imports are commented out
type BusinessType = 'dive_bar' | 'cafe' | 'fine_dining' | 'sports_bar' | 'family_restaurant' | 'brewery' | 'pizzeria' | 'food_truck'

const getBusinessTypeDisplayName = (businessType: BusinessType): string => {
  const displayNames: Record<BusinessType, string> = {
    dive_bar: 'Dive Bar',
    cafe: 'Café',
    fine_dining: 'Fine Dining',
    sports_bar: 'Sports Bar',
    family_restaurant: 'Family Restaurant',
    brewery: 'Brewery',
    pizzeria: 'Pizzeria',
    food_truck: 'Food Truck'
  }
  return displayNames[businessType]
}

export default function AIIntakeWizard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const businessTypes: BusinessType[] = [
    'dive_bar',
    'cafe', 
    'fine_dining',
    'sports_bar',
    'family_restaurant',
    'brewery',
    'pizzeria',
    'food_truck'
  ]

  const handleBusinessTypeSelect = (businessType: BusinessType) => {
    setSelectedBusinessType(businessType)
  }

  const handlePreview = (answers: Record<string, unknown>) => {
    setPreviewData(answers)
    setShowPreview(true)
  }

  const handleComplete = async (answers: Record<string, unknown>) => {
    setIsCreating(true)
    try {
      // Create the site
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          businessType: selectedBusinessType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create site')
      }

      const site = await response.json()
      
      // Redirect to the new site's admin
      router.push(`/admin?site=${site.id}`)
    } catch (error) {
      console.error('Error creating site:', error)
      alert('Failed to create site. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleBack = () => {
    if (showPreview) {
      setShowPreview(false)
      setPreviewData(null)
    } else if (selectedBusinessType) {
      setSelectedBusinessType(null)
    }
  }

  if (showPreview && previewData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              ← Back to Chat
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Website Preview</h1>
            <p className="text-gray-600">Here's how your website will look to customers</p>
          </div>
          
          {/* <SitePreview data={previewData} businessType={selectedBusinessType!} /> */}
          <div className="p-8 text-center text-gray-500">
            Site preview component not available
          </div>
        </div>
      </div>
    )
  }

  if (selectedBusinessType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              ← Back to Business Type Selection
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Business Setup
            </h1>
            <p className="text-gray-600">Let's chat about your business and create your website</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* <AIIntakeChat
              businessType={selectedBusinessType}
              onPreview={handlePreview}
              onComplete={handleComplete}
            /> */}
            <div className="p-8 text-center text-gray-500">
              AI intake chat component not available
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Website Builder</h1>
          <p className="text-gray-600">Let's create your restaurant website in minutes with AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessTypes.map((businessType) => (
            <button
              key={businessType}
              onClick={() => handleBusinessTypeSelect(businessType)}
              className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">
                    {businessType === 'dive_bar' && '🍺'}
                    {businessType === 'cafe' && '☕'}
                    {businessType === 'fine_dining' && '🍽️'}
                    {businessType === 'sports_bar' && '🏈'}
                    {businessType === 'family_restaurant' && '👨‍👩‍👧‍👦'}
                    {businessType === 'brewery' && '🍺'}
                    {businessType === 'pizzeria' && '🍕'}
                    {businessType === 'food_truck' && '🚚'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {getBusinessTypeDisplayName(businessType)}
                </h3>
              </div>
              
              <p className="text-gray-600 text-sm">
                {businessType === 'dive_bar' && 'Casual bar with pool tables and local atmosphere'}
                {businessType === 'cafe' && 'Cozy coffee shop with WiFi and pastries'}
                {businessType === 'fine_dining' && 'Upscale restaurant with wine list and reservations'}
                {businessType === 'sports_bar' && 'Sports-focused bar with TVs and game specials'}
                {businessType === 'family_restaurant' && 'Family-friendly dining with kids menu'}
                {businessType === 'brewery' && 'Craft brewery with tasting room and tours'}
                {businessType === 'pizzeria' && 'Casual pizza restaurant with delivery'}
                {businessType === 'food_truck' && 'Mobile food service with unique locations'}
              </p>
              
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                Start Building →
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
              <h3 className="font-medium text-blue-900">Choose Your Type</h3>
              <p className="text-blue-700 text-sm">Select your business type for customized questions</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
              <h3 className="font-medium text-blue-900">Chat with AI</h3>
              <p className="text-blue-700 text-sm">Answer questions naturally in a conversation</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
              <h3 className="font-medium text-blue-900">Preview & Launch</h3>
              <p className="text-blue-700 text-sm">See your website and go live instantly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
