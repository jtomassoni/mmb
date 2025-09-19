'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { BusinessVariant } from '../lib/design-tokens'
import { getHeroPreset, customizeHeroPreset, HeroPreset } from '../lib/hero-presets'
import { useDesignTokens } from '../hooks/use-design-tokens'

interface HeroSectionProps {
  variant: BusinessVariant
  businessName?: string
  location?: string
  specialties?: string[]
  customImage?: string
  onCallToAction?: (action: string) => void
}

export default function HeroSection({
  variant,
  businessName,
  location,
  specialties,
  customImage,
  onCallToAction
}: HeroSectionProps) {
  const [preset, setPreset] = useState<HeroPreset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { tokens, getCSS, isLoaded } = useDesignTokens({ variant })
  
  useEffect(() => {
    if (isLoaded) {
      let heroPreset = getHeroPreset(variant)
      
      // Customize with business-specific information
      if (businessName || location || specialties) {
        heroPreset = customizeHeroPreset(heroPreset, {
          businessName,
          location,
          specialties
        })
      }
      
      setPreset(heroPreset)
      setIsLoading(false)
    }
  }, [variant, businessName, location, specialties, isLoaded])
  
  if (isLoading || !preset) {
    return (
      <div className="animate-pulse bg-gray-200 h-96 rounded-lg">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading hero section...</div>
        </div>
      </div>
    )
  }
  
  const handleCallToAction = (action: string) => {
    if (onCallToAction) {
      onCallToAction(action)
    }
  }
  
  const getImageStyle = () => {
    switch (preset.layout.imageStyle) {
      case 'rounded':
        return 'rounded-lg'
      case 'square':
        return 'rounded-none'
      case 'full-width':
        return 'w-full h-full object-cover'
      case 'overlay':
        return 'absolute inset-0 w-full h-full object-cover'
      default:
        return 'rounded-lg'
    }
  }
  
  const getTextAlignment = () => {
    switch (preset.layout.textAlignment) {
      case 'left':
        return 'text-left'
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }
  
  const getSpacing = () => {
    switch (preset.layout.spacing) {
      case 'compact':
        return 'p-4'
      case 'comfortable':
        return 'p-6'
      case 'spacious':
        return 'p-8'
      default:
        return 'p-6'
    }
  }
  
  const getButtonStyle = () => {
    const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200'
    
    switch (preset.layout.buttonStyle) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 shadow-lg`
      case 'secondary':
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700`
      case 'outline':
        return `${baseClasses} border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white`
      case 'ghost':
        return `${baseClasses} text-blue-600 hover:bg-blue-50`
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`
    }
  }
  
  const renderImage = () => {
    if (customImage) {
      return (
        <Image
          src={customImage}
          alt={preset.content.headline}
          width={600}
          height={400}
          className={getImageStyle()}
          priority
        />
      )
    }
    
    // Use suggested image or placeholder
    const imageUrl = preset.imageSuggestions[0] 
      ? `/images/${preset.imageSuggestions[0]}.jpg`
      : '/images/placeholder-hero.jpg'
    
    return (
      <Image
        src={imageUrl}
        alt={preset.content.headline}
        width={600}
        height={400}
        className={getImageStyle()}
        priority
      />
    )
  }
  
  const renderContent = () => (
    <div className={`${getSpacing()} ${getTextAlignment()}`}>
      <h1 
        className="text-4xl md:text-5xl font-bold mb-4"
        style={getCSS('heading')}
      >
        {preset.content.headline}
      </h1>
      
      <h2 
        className="text-xl md:text-2xl mb-6 opacity-90"
        style={getCSS('subheading')}
      >
        {preset.content.subheadline}
      </h2>
      
      <p 
        className="text-lg mb-8 max-w-2xl"
        style={getCSS('body')}
      >
        {preset.content.description}
      </p>
      
      {preset.content.features && preset.content.features.length > 0 && (
        <ul className="mb-8 space-y-2">
          {preset.content.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              <span style={getCSS('body')}>{feature}</span>
            </li>
          ))}
        </ul>
      )}
      
      {preset.content.socialProof && (
        <p className="text-sm mb-8 opacity-75" style={getCSS('caption')}>
          {preset.content.socialProof}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className={getButtonStyle()}
          onClick={() => handleCallToAction(preset.content.callToAction.primary)}
        >
          {preset.content.callToAction.primary}
        </button>
        
        {preset.content.callToAction.secondary && (
          <button
            className="px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            onClick={() => handleCallToAction(preset.content.callToAction.secondary!)}
          >
            {preset.content.callToAction.secondary}
          </button>
        )}
      </div>
    </div>
  )
  
  const renderLayout = () => {
    switch (preset.layout.imagePosition) {
      case 'left':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {renderImage()}
            {renderContent()}
          </div>
        )
        
      case 'right':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {renderContent()}
            {renderImage()}
          </div>
        )
        
      case 'center':
        return (
          <div className="text-center">
            {renderImage()}
            <div className="mt-8">
              {renderContent()}
            </div>
          </div>
        )
        
      case 'background':
        return (
          <div className="relative min-h-[500px] flex items-center">
            <div className="absolute inset-0 z-0">
              {renderImage()}
            </div>
            <div className="relative z-10 bg-black bg-opacity-50 text-white min-h-[500px] flex items-center">
              <div className="container mx-auto px-6">
                {renderContent()}
              </div>
            </div>
          </div>
        )
        
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {renderContent()}
            {renderImage()}
          </div>
        )
    }
  }
  
  return (
    <section 
      className="py-16 bg-gradient-to-br from-gray-50 to-gray-100"
      style={{ backgroundColor: preset.colorScheme.background }}
    >
      <div className="container mx-auto px-6">
        {renderLayout()}
      </div>
    </section>
  )
}
