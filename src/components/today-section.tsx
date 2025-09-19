'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { BusinessVariant } from '../lib/design-tokens'
import { getTodayPreset, customizeTodayPreset, TodaySection, TodayHighlight } from '../lib/today-presets'
import { useDesignTokens } from '../hooks/use-design-tokens'

interface TodaySectionProps {
  variant: BusinessVariant
  businessName?: string
  specialties?: string[]
  customHighlights?: TodayHighlight[]
  onHighlightClick?: (highlight: TodayHighlight) => void
}

export default function TodaySectionComponent({
  variant,
  businessName,
  specialties,
  customHighlights,
  onHighlightClick
}: TodaySectionProps) {
  const [preset, setPreset] = useState<TodaySection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { tokens, getCSS, isLoaded } = useDesignTokens({ variant })
  
  useEffect(() => {
    if (isLoaded) {
      let todayPreset = getTodayPreset(variant)
      
      // Customize with business-specific information
      if (businessName || specialties) {
        todayPreset = customizeTodayPreset(todayPreset, {
          businessName,
          specialties
        })
      }
      
      // Use custom highlights if provided
      if (customHighlights && customHighlights.length > 0) {
        todayPreset.highlights = customHighlights
      }
      
      setPreset(todayPreset)
      setIsLoading(false)
    }
  }, [variant, businessName, specialties, customHighlights, isLoaded])
  
  if (isLoading || !preset) {
    return (
      <div className="animate-pulse bg-gray-200 h-64 rounded-lg">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading today's highlights...</div>
        </div>
      </div>
    )
  }
  
  const handleHighlightClick = (highlight: TodayHighlight) => {
    if (onHighlightClick) {
      onHighlightClick(highlight)
    }
  }
  
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-500 bg-red-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-green-500 bg-green-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }
  
  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return '🔥'
      case 'medium':
        return '⭐'
      case 'low':
        return '💡'
      default:
        return '📌'
    }
  }
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'special':
        return '🎯'
      case 'event':
        return '🎉'
      case 'feature':
        return '✨'
      case 'announcement':
        return '📢'
      default:
        return '📌'
    }
  }
  
  const renderHighlight = (highlight: TodayHighlight, index: number) => (
    <div
      key={index}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${getUrgencyColor(highlight.urgency)}`}
      onClick={() => handleHighlightClick(highlight)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCategoryIcon(highlight.category)}</span>
          <span className="text-lg">{getUrgencyIcon(highlight.urgency)}</span>
        </div>
        {highlight.price && (
          <span className="text-sm font-semibold text-green-600">
            {highlight.price}
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold mb-2" style={getCSS('subheading')}>
        {highlight.title}
      </h3>
      
      <p className="text-sm mb-3" style={getCSS('body')}>
        {highlight.description}
      </p>
      
      {preset.layout.showTime && highlight.time && (
        <div className="flex items-center text-xs text-gray-600">
          <span className="mr-1">🕒</span>
          <span>{highlight.time}</span>
        </div>
      )}
    </div>
  )
  
  const renderLayout = () => {
    const highlights = preset.highlights.slice(0, preset.layout.maxItems)
    
    switch (preset.layout.style) {
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((highlight, index) => renderHighlight(highlight, index))}
          </div>
        )
        
      case 'list':
        return (
          <div className="space-y-4">
            {highlights.map((highlight, index) => renderHighlight(highlight, index))}
          </div>
        )
        
      case 'carousel':
        return (
          <div className="relative">
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-4">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex-shrink-0 w-80">
                    {renderHighlight(highlight, index)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
        
      case 'featured':
        return (
          <div className="space-y-4">
            {highlights.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                {renderHighlight(highlights[0], 0)}
              </div>
            )}
            {highlights.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highlights.slice(1).map((highlight, index) => renderHighlight(highlight, index + 1))}
              </div>
            )}
          </div>
        )
        
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((highlight, index) => renderHighlight(highlight, index))}
          </div>
        )
    }
  }
  
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📅</div>
      <h3 className="text-xl font-semibold mb-2" style={getCSS('subheading')}>
        {preset.messaging.noHighlights}
      </h3>
      <p className="text-gray-600 mb-6" style={getCSS('body')}>
        {preset.messaging.comingSoon}
      </p>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => handleHighlightClick({ title: 'View Menu', description: 'See our full menu', category: 'feature', urgency: 'low' })}
      >
        {preset.messaging.callToAction}
      </button>
    </div>
  )
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4" style={getCSS('heading')}>
            {preset.greeting}
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded"></div>
        </div>
        
        {preset.highlights.length > 0 ? renderLayout() : renderEmptyState()}
      </div>
    </section>
  )
}
