'use client'

import { BusinessType } from '../lib/ai-intake'

interface SitePreviewProps {
  data: Record<string, any>
  businessType: BusinessType
}

export default function SitePreview({ data, businessType }: SitePreviewProps) {
  const getBusinessTypeIcon = (type: BusinessType) => {
    switch (type) {
      case 'dive_bar': return '🍺'
      case 'cafe': return '☕'
      case 'fine_dining': return '🍽️'
      case 'sports_bar': return '🏈'
      case 'family_restaurant': return '👨‍👩‍👧‍👦'
      case 'brewery': return '🍺'
      case 'pizzeria': return '🍕'
      case 'food_truck': return '🚚'
      default: return '🍽️'
    }
  }

  const getBusinessTypeDescription = (type: BusinessType) => {
    switch (type) {
      case 'dive_bar': return 'Where locals gather for cold beer and good times'
      case 'cafe': return 'Fresh coffee, homemade pastries, and friendly service'
      case 'fine_dining': return 'Upscale dining with locally sourced ingredients'
      case 'sports_bar': return 'Where sports fans gather for the big game'
      case 'family_restaurant': return 'Family-friendly dining for all ages'
      case 'brewery': return 'Craft beer and great food in a welcoming atmosphere'
      case 'pizzeria': return 'Fresh, handmade pizzas made with love'
      case 'food_truck': return 'Gourmet street food on wheels'
      default: return 'Great food and drinks in a welcoming atmosphere'
    }
  }

  const formatHours = (hours: string) => {
    // Simple formatting for demo - in real implementation, this would be more sophisticated
    return hours || 'Hours vary by day'
  }

  const formatPhone = (phone: string) => {
    return phone || '(555) 123-4567'
  }

  const formatEmail = (email: string) => {
    return email || 'info@restaurant.com'
  }

  const formatAddress = (address: string) => {
    return address || '123 Main Street, City, State 12345'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-4">{getBusinessTypeIcon(businessType)}</span>
          <div>
            <h1 className="text-3xl font-bold">{data.name || 'Your Restaurant'}</h1>
            <p className="text-blue-100 text-lg">{data.description || getBusinessTypeDescription(businessType)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <span className="mr-2">📍</span>
            <span>{formatAddress(data.address)}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">📞</span>
            <span>{formatPhone(data.phone)}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">✉️</span>
            <span>{formatEmail(data.email)}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-100 px-8 py-4">
        <div className="flex space-x-8">
          <a href="#home" className="text-blue-600 font-medium">Home</a>
          <a href="#menu" className="text-gray-600 hover:text-blue-600">Menu</a>
          <a href="#events" className="text-gray-600 hover:text-blue-600">Events</a>
          <a href="#specials" className="text-gray-600 hover:text-blue-600">Specials</a>
          <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
          <a href="#contact" className="text-gray-600 hover:text-blue-600">Contact</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-6">
            <span className="text-gray-500 text-lg">Hero Image Placeholder</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to {data.name || 'Your Restaurant'}</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {data.description || getBusinessTypeDescription(businessType)}
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">What Makes Us Special</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.pool_tables && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎱</span>
                </div>
                <h4 className="font-medium text-gray-900">Pool Tables</h4>
                <p className="text-gray-600 text-sm">
                  {data.pool_table_count ? `${data.pool_table_count} pool tables` : 'Pool tables available'}
                </p>
              </div>
            )}
            
            {data.tvs && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📺</span>
                </div>
                <h4 className="font-medium text-gray-900">Sports TVs</h4>
                <p className="text-gray-600 text-sm">
                  {data.tv_count ? `${data.tv_count} TVs` : 'Multiple TVs for sports'}
                </p>
              </div>
            )}
            
            {data.wifi && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📶</span>
                </div>
                <h4 className="font-medium text-gray-900">Free WiFi</h4>
                <p className="text-gray-600 text-sm">Complimentary internet access</p>
              </div>
            )}
            
            {data.outdoor_seating && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌞</span>
                </div>
                <h4 className="font-medium text-gray-900">Outdoor Seating</h4>
                <p className="text-gray-600 text-sm">Patio and outdoor dining</p>
              </div>
            )}
            
            {data.reservations && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📅</span>
                </div>
                <h4 className="font-medium text-gray-900">Reservations</h4>
                <p className="text-gray-600 text-sm">Call ahead to reserve your table</p>
              </div>
            )}
            
            {data.live_music && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎵</span>
                </div>
                <h4 className="font-medium text-gray-900">Live Music</h4>
                <p className="text-gray-600 text-sm">Live entertainment and music</p>
              </div>
            )}
          </div>
        </div>

        {/* Specials Section */}
        {(data.happy_hour || data.signature_drink || data.signature_dish) && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Specials & Signatures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.happy_hour && (
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Happy Hour</h4>
                  <p className="text-gray-600">{data.happy_hour_times || 'Check with us for current times'}</p>
                </div>
              )}
              
              {data.signature_drink && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Signature Drink</h4>
                  <p className="text-gray-600">{data.signature_drink}</p>
                </div>
              )}
              
              {data.signature_dish && (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Signature Dish</h4>
                  <p className="text-gray-600">{data.signature_dish}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hours Section */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Hours</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-600">{formatHours(data.hours)}</p>
            <p className="text-gray-500 text-sm mt-2">Hours may vary on holidays</p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 p-8 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Get In Touch</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Visit Us</h4>
              <p className="text-gray-600">{formatAddress(data.address)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Call Us</h4>
              <p className="text-gray-600">{formatPhone(data.phone)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-8">
        <div className="text-center">
          <p className="text-gray-300">© 2025 {data.name || 'Your Restaurant'}. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2">Powered by Byte by Bite</p>
        </div>
      </footer>
    </div>
  )
}
