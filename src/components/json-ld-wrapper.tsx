'use client'

import { useEffect } from 'react'
import { BusinessVariant } from '../lib/design-tokens'
import { generateJsonLd, validateJsonLd, BusinessInfo } from '../lib/json-ld-presets'

interface JsonLdWrapperProps {
  variant: BusinessVariant
  businessInfo: BusinessInfo
  customFields?: Record<string, any>
  contentData?: {
    menu?: any
    events?: any[]
    specials?: any[]
    reviews?: any[]
  }
  onValidation?: (result: { isValid: boolean; issues: string[]; suggestions: string[] }) => void
}

export default function JsonLdWrapper({
  variant,
  businessInfo,
  customFields,
  contentData,
  onValidation
}: JsonLdWrapperProps) {
  
  useEffect(() => {
    // Generate structured data
    const structuredData = generateJsonLd(variant, businessInfo, customFields)
    
    // Validate the structured data
    const validation = validateJsonLd(structuredData)
    
    // Call validation callback if provided
    if (onValidation) {
      onValidation(validation)
    }
    
    // Add structured data to page
    structuredData.forEach((schema, index) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = `json-ld-${index}`
      script.textContent = JSON.stringify(schema, null, 2)
      
      // Remove existing script if it exists
      const existingScript = document.getElementById(`json-ld-${index}`)
      if (existingScript) {
        existingScript.remove()
      }
      
      // Add new script to head
      document.head.appendChild(script)
    })
    
    // Add content-specific structured data
    if (contentData) {
      if (contentData.menu) {
        const menuSchema = generateContentJsonLd(variant, businessInfo, 'menu', contentData.menu)
        if (menuSchema) {
          const script = document.createElement('script')
          script.type = 'application/ld+json'
          script.id = 'json-ld-menu'
          script.textContent = JSON.stringify(menuSchema, null, 2)
          
          const existingScript = document.getElementById('json-ld-menu')
          if (existingScript) {
            existingScript.remove()
          }
          
          document.head.appendChild(script)
        }
      }
      
      if (contentData.events && contentData.events.length > 0) {
        contentData.events.forEach((event, index) => {
          const eventSchema = generateContentJsonLd(variant, businessInfo, 'event', event)
          if (eventSchema) {
            const script = document.createElement('script')
            script.type = 'application/ld+json'
            script.id = `json-ld-event-${index}`
            script.textContent = JSON.stringify(eventSchema, null, 2)
            
            const existingScript = document.getElementById(`json-ld-event-${index}`)
            if (existingScript) {
              existingScript.remove()
            }
            
            document.head.appendChild(script)
          }
        })
      }
      
      if (contentData.specials && contentData.specials.length > 0) {
        contentData.specials.forEach((special, index) => {
          const specialSchema = generateContentJsonLd(variant, businessInfo, 'special', special)
          if (specialSchema) {
            const script = document.createElement('script')
            script.type = 'application/ld+json'
            script.id = `json-ld-special-${index}`
            script.textContent = JSON.stringify(specialSchema, null, 2)
            
            const existingScript = document.getElementById(`json-ld-special-${index}`)
            if (existingScript) {
              existingScript.remove()
            }
            
            document.head.appendChild(script)
          }
        })
      }
      
      if (contentData.reviews && contentData.reviews.length > 0) {
        contentData.reviews.forEach((review, index) => {
          const reviewSchema = generateContentJsonLd(variant, businessInfo, 'review', review)
          if (reviewSchema) {
            const script = document.createElement('script')
            script.type = 'application/ld+json'
            script.id = `json-ld-review-${index}`
            script.textContent = JSON.stringify(reviewSchema, null, 2)
            
            const existingScript = document.getElementById(`json-ld-review-${index}`)
            if (existingScript) {
              existingScript.remove()
            }
            
            document.head.appendChild(script)
          }
        })
      }
    }
    
    // Cleanup function
    return () => {
      // Remove all JSON-LD scripts when component unmounts
      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      scripts.forEach(script => {
        if (script.id?.startsWith('json-ld-')) {
          script.remove()
        }
      })
    }
  }, [variant, businessInfo, customFields, contentData, onValidation])
  
  // This component doesn't render anything visible
  return null
}

// Helper function to generate content-specific JSON-LD
function generateContentJsonLd(
  variant: BusinessVariant,
  businessInfo: BusinessInfo,
  contentType: 'menu' | 'event' | 'special' | 'review',
  contentData: any
): any {
  switch (contentType) {
    case 'menu':
      return {
        '@context': 'https://schema.org',
        '@type': 'Menu',
        'name': `${businessInfo.name} Menu`,
        'description': `Complete menu for ${businessInfo.name}`,
        'url': `${businessInfo.url}/menu`,
        'hasMenuSection': contentData.sections || [],
        'offers': contentData.items?.map((item: any) => ({
          '@type': 'Offer',
          'name': item.name,
          'description': item.description,
          'price': item.price,
          'priceCurrency': 'USD'
        })) || []
      }
      
    case 'event':
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        'name': contentData.name,
        'description': contentData.description,
        'startDate': contentData.startDate,
        'endDate': contentData.endDate,
        'location': {
          '@type': 'Place',
          'name': businessInfo.name,
          'address': {
            '@type': 'PostalAddress',
            ...businessInfo.address
          }
        },
        'organizer': {
          '@type': 'Organization',
          'name': businessInfo.name
        },
        'offers': contentData.price ? {
          '@type': 'Offer',
          'price': contentData.price,
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock'
        } : undefined
      }
      
    case 'special':
      return {
        '@context': 'https://schema.org',
        '@type': 'Offer',
        'name': contentData.name,
        'description': contentData.description,
        'price': contentData.price,
        'priceCurrency': 'USD',
        'availability': 'https://schema.org/InStock',
        'validFrom': contentData.startDate,
        'validThrough': contentData.endDate,
        'seller': {
          '@type': 'Restaurant',
          'name': businessInfo.name
        }
      }
      
    case 'review':
      return {
        '@context': 'https://schema.org',
        '@type': 'Review',
        'itemReviewed': {
          '@type': 'Restaurant',
          'name': businessInfo.name
        },
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': contentData.rating,
          'bestRating': '5',
          'worstRating': '1'
        },
        'author': {
          '@type': 'Person',
          'name': contentData.author
        },
        'reviewBody': contentData.text,
        'datePublished': contentData.date
      }
      
    default:
      return null
  }
}