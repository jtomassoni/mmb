'use client'

import { useEffect, useState } from 'react'
import { getSiteByHostname } from '../lib/site'

interface JsonLdProps {
  hostname: string
}

export default function JsonLd({ hostname }: JsonLdProps) {
  const [jsonLd, setJsonLd] = useState<string>('')

  useEffect(() => {
    async function generateJsonLd() {
      const site = await getSiteByHostname(hostname)
      
      if (!site) {
        return
      }

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: site.name,
        description: site.description || `${site.name} - Local restaurant`,
        url: `https://${hostname}`,
        telephone: site.phone,
        email: site.email,
        address: site.address ? {
          '@type': 'PostalAddress',
          streetAddress: site.address
        } : undefined,
        openingHours: site.hours?.map(hour => {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const dayName = days[hour.dayOfWeek]
          
          if (hour.isClosed) {
            return `${dayName} closed`
          }
          
          if (hour.openTime && hour.closeTime) {
            return `${dayName} ${hour.openTime}-${hour.closeTime}`
          }
          
          return undefined
        }).filter(Boolean),
        servesCuisine: 'American', // Default, could be made configurable
        priceRange: '$$', // Default, could be made configurable
        hasMenu: `https://${hostname}/menu`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.5', // Default, could be calculated from reviews
          reviewCount: '0' // Default, could be calculated from reviews
        }
      }

      // Add events if available
      if (site.events && site.events.length > 0) {
        structuredData.event = site.events.slice(0, 5).map(event => ({
          '@type': 'Event',
          name: event.title,
          description: event.description,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate?.toISOString(),
          location: {
            '@type': 'Place',
            name: site.name,
            address: site.address
          }
        }))
      }

      // Add specials if available
      if (site.specials && site.specials.length > 0) {
        structuredData.hasMenu = {
          '@type': 'Menu',
          name: `${site.name} Menu`,
          url: `https://${hostname}/menu`,
          hasMenuSection: [
            {
              '@type': 'MenuSection',
              name: 'Specials',
              hasMenuItem: site.specials.slice(0, 10).map(special => ({
                '@type': 'MenuItem',
                name: special.title,
                description: special.description,
                offers: {
                  '@type': 'Offer',
                  price: special.price || 'Contact for price',
                  priceCurrency: 'USD'
                }
              }))
            }
          ]
        }
      }

      setJsonLd(JSON.stringify(structuredData, null, 2))
    }

    generateJsonLd()
  }, [hostname])

  if (!jsonLd) {
    return null
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  )
}
