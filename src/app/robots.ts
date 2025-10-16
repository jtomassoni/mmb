import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getSiteByHostname } from '../lib/site'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const hostname = headersList.get('host') || 'localhost:3000'
  
  // Try to get site data
  const site = await getSiteByHostname(hostname)
  const baseUrl = `https://${hostname}`
  
  if (site) {
    // Active site - allow crawling
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    }
  } else {
    // Unknown domain - be more restrictive
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }
}
