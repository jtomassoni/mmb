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
    return null
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
