import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the Monaghan's site (for now, we'll use the first site)
    const site = await prisma.site.findFirst({
      where: { slug: 'monaghans-bargrill' }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, address, phone, email, timezone, latitude, longitude, googlePlaceId, googleMapsUrl } = body

    if (!name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the current site
    const existingSite = await prisma.site.findFirst({
      where: { slug: 'monaghans-bargrill' }
    })

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    const site = await prisma.site.update({
      where: { id: existingSite.id },
      data: {
        name,
        description: description || '',
        address: address || '',
        phone: phone || '',
        email: email || '',
        timezone: timezone || 'America/Denver',
        currency: 'USD', // Always USD for now
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        googlePlaceId: googlePlaceId || null,
        googleMapsUrl: googleMapsUrl || null
      }
    })

    // Log the update
    await logAuditEvent({
      action: 'UPDATE',
      resource: 'site_settings',
      resourceId: site.id,
      userId: session.user.id,
      changes: { name, address, phone, email, timezone, latitude, longitude, googlePlaceId, googleMapsUrl },
      metadata: { description },
      previousValues: {
        name: existingSite.name,
        address: existingSite.address,
        phone: existingSite.phone,
        email: existingSite.email,
        timezone: existingSite.timezone,
        latitude: existingSite.latitude,
        longitude: existingSite.longitude,
        googlePlaceId: existingSite.googlePlaceId,
        googleMapsUrl: existingSite.googleMapsUrl
      }
    })

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
