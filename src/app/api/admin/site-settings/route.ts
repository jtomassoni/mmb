import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'
import { 
  validateBusinessName, 
  validateDescription, 
  validateAddress, 
  validatePhone, 
  validateEmail, 
  validateUrl,
  validateCoordinates
} from '@/lib/input-validation'

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
    const { name, description, address, phone, email, timezone, latitude, longitude, googlePlaceId, googleMapsUrl, homeTeam } = body

    // Validate all inputs
    const nameValidation = validateBusinessName(name)
    const descriptionValidation = validateDescription(description || '')
    const addressValidation = validateAddress(address || '')
    const phoneValidation = validatePhone(phone || '')
    const emailValidation = validateEmail(email || '')
    const mapsUrlValidation = validateUrl(googleMapsUrl || '')
    
    // Check for validation errors
    const validationErrors: string[] = []
    if (!nameValidation.isValid) validationErrors.push(`Name: ${nameValidation.errors.join(', ')}`)
    if (!descriptionValidation.isValid) validationErrors.push(`Description: ${descriptionValidation.errors.join(', ')}`)
    if (!addressValidation.isValid) validationErrors.push(`Address: ${addressValidation.errors.join(', ')}`)
    if (!phoneValidation.isValid) validationErrors.push(`Phone: ${phoneValidation.errors.join(', ')}`)
    if (!emailValidation.isValid) validationErrors.push(`Email: ${emailValidation.errors.join(', ')}`)
    if (!mapsUrlValidation.isValid) validationErrors.push(`Google Maps URL: ${mapsUrlValidation.errors.join(', ')}`)
    
    // Validate coordinates if provided
    if (latitude && longitude) {
      const coordsValidation = validateCoordinates(latitude.toString(), longitude.toString())
      if (!coordsValidation.isValid) {
        validationErrors.push(`Coordinates: ${coordsValidation.errors.join(', ')}`)
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
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
        name: nameValidation.sanitizedValue,
        description: descriptionValidation.sanitizedValue,
        address: addressValidation.sanitizedValue,
        phone: phoneValidation.sanitizedValue,
        email: emailValidation.sanitizedValue,
        timezone: timezone || 'America/Denver',
        currency: 'USD', // Always USD for now
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        googlePlaceId: googlePlaceId || null,
        googleMapsUrl: mapsUrlValidation.sanitizedValue || null,
        homeTeam: homeTeam || null
      }
    })

    // Find only the fields that actually changed
    const changes: Record<string, any> = {}
    const previousValues: Record<string, any> = {}
    
    if (existingSite.name !== nameValidation.sanitizedValue) {
      changes.name = nameValidation.sanitizedValue
      previousValues.name = existingSite.name
    }
    
    if (existingSite.description !== descriptionValidation.sanitizedValue) {
      changes.description = descriptionValidation.sanitizedValue
      previousValues.description = existingSite.description
    }
    
    if (existingSite.address !== addressValidation.sanitizedValue) {
      changes.address = addressValidation.sanitizedValue
      previousValues.address = existingSite.address
    }
    
    if (existingSite.phone !== phoneValidation.sanitizedValue) {
      changes.phone = phoneValidation.sanitizedValue
      previousValues.phone = existingSite.phone
    }
    
    if (existingSite.email !== emailValidation.sanitizedValue) {
      changes.email = emailValidation.sanitizedValue
      previousValues.email = existingSite.email
    }
    
    const newTimezone = timezone || 'America/Denver'
    if (existingSite.timezone !== newTimezone) {
      changes.timezone = newTimezone
      previousValues.timezone = existingSite.timezone
    }
    
    const newLatitude = latitude ? parseFloat(latitude) : null
    if (existingSite.latitude !== newLatitude) {
      changes.latitude = newLatitude
      previousValues.latitude = existingSite.latitude
    }
    
    const newLongitude = longitude ? parseFloat(longitude) : null
    if (existingSite.longitude !== newLongitude) {
      changes.longitude = newLongitude
      previousValues.longitude = existingSite.longitude
    }
    
    const newGooglePlaceId = googlePlaceId || null
    if (existingSite.googlePlaceId !== newGooglePlaceId) {
      changes.googlePlaceId = newGooglePlaceId
      previousValues.googlePlaceId = existingSite.googlePlaceId
    }
    
    const newGoogleMapsUrl = mapsUrlValidation.sanitizedValue || null
    if (existingSite.googleMapsUrl !== newGoogleMapsUrl) {
      changes.googleMapsUrl = newGoogleMapsUrl
      previousValues.googleMapsUrl = existingSite.googleMapsUrl
    }
    
    const newHomeTeam = homeTeam || null
    if (existingSite.homeTeam !== newHomeTeam) {
      changes.homeTeam = newHomeTeam
      previousValues.homeTeam = existingSite.homeTeam
    }

    // Only log if there were actual changes
    if (Object.keys(changes).length > 0) {
      await logAuditEvent({
        action: 'UPDATE',
        resource: 'site_settings',
        resourceId: site.id,
        userId: session.user.id,
        changes,
        previousValues,
        metadata: { description: descriptionValidation.sanitizedValue }
      })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
