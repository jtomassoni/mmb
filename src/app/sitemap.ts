import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getSiteByHostname, isPlatformHost } from '../lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const hostname = headersList.get('host') || 'localhost:3000'
  const baseUrl = `https://${hostname}`
  
  // Platform host gets different sitemap
  if (isPlatformHost(hostname)) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/resto-admin`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ]
  }

  // Try to get site data for tenant domains
  const site = await getSiteByHostname(hostname)
  
  if (!site) {
    // Unknown domain - return minimal sitemap
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]
  }

  // Build sitemap for active site
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: site.updatedAt,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: site.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/specials`,
      lastModified: site.updatedAt,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: site.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: site.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: site.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/visit`,
      lastModified: site.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Add individual event pages if there are upcoming events
  if (site.events && site.events.length > 0) {
    site.events.slice(0, 10).forEach(event => {
      sitemapEntries.push({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: event.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
  }

  return sitemapEntries
}
