import { prisma } from './prisma'

export interface SiteData {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  timezone: string
  currency: string
  latitude?: number
  longitude?: number
  googlePlaceId?: string
  googleMapsUrl?: string
}

export async function getSiteData(): Promise<SiteData | null> {
  try {
    const site = await prisma.site.findFirst({
      where: { slug: 'monaghans-bargrill' }
    })

    if (!site) {
      return null
    }

    return {
      id: site.id,
      name: site.name,
      description: site.description || '',
      address: site.address || '',
      phone: site.phone || '',
      email: site.email || '',
      timezone: site.timezone,
      currency: site.currency,
      latitude: site.latitude || undefined,
      longitude: site.longitude || undefined,
      googlePlaceId: site.googlePlaceId || undefined,
      googleMapsUrl: site.googleMapsUrl || undefined
    }
  } catch (error) {
    console.error('Error fetching site data:', error)
    // Return default site data if database is not available during build
    return {
      id: 'default',
      name: "Monaghan's Bar & Grill",
      description: 'Your neighborhood bar and grill with great food, drinks, and atmosphere. Join us for live music, trivia nights, and daily specials!',
      address: '123 Main Street, Denver, CO 80202',
      phone: '(303) 555-0123',
      email: 'info@monaghans.com',
      timezone: 'America/Denver',
      currency: 'USD',
      latitude: 39.7392,
      longitude: -104.9903,
      googleMapsUrl: 'https://maps.app.goo.gl/LA2AYUTPUreV9KyJ8'
    }
  }
}

export async function getBusinessHours() {
  try {
    const site = await prisma.site.findFirst({
      where: { slug: 'monaghans-bargrill' }
    })

    if (!site) {
      return null
    }

    const hours = await prisma.hours.findMany({
      where: { siteId: site.id },
      orderBy: { dayOfWeek: 'asc' }
    })

    return hours
  } catch (error) {
    console.error('Error fetching business hours:', error)
    return null
  }
}
