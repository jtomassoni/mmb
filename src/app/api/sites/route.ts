import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { BusinessType } from '../../../lib/ai-intake'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { businessType, ...siteData } = data

    // Validate required fields
    if (!siteData.name || !siteData.address || !siteData.phone || !siteData.email) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, address, phone, email' 
      }, { status: 400 })
    }

    // Generate slug from name
    const slug = siteData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if slug already exists
    const existingSite = await prisma.site.findUnique({
      where: { slug }
    })

    if (existingSite) {
      return NextResponse.json({ 
        error: 'A site with this name already exists' 
      }, { status: 409 })
    }

    // Create the site
    const site = await prisma.site.create({
      data: {
        name: siteData.name,
        slug,
        description: siteData.description || `${siteData.name} - Local restaurant`,
        address: siteData.address,
        phone: siteData.phone,
        email: siteData.email
      }
    })

    // Create default hours (7 days, closed by default)
    const defaultHours = Array.from({ length: 7 }, (_, i) => ({
      siteId: site.id,
      dayOfWeek: i,
      isClosed: true,
      openTime: null,
      closeTime: null
    }))

    await prisma.hours.createMany({
      data: defaultHours
    })

    // Create sample events based on business type
    const events = generateSampleEvents(site.id, businessType as BusinessType, siteData)
    if (events.length > 0) {
      await prisma.event.createMany({
        data: events
      })
    }

    // Create sample specials based on business type
    const specials = generateSampleSpecials(site.id, businessType as BusinessType, siteData)
    if (specials.length > 0) {
      await prisma.special.createMany({
        data: specials
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        siteId: site.id,
        action: 'CREATE_SITE',
        details: JSON.stringify({
          businessType,
          source: 'ai_intake',
          features: Object.keys(siteData).filter(key => 
            ['pool_tables', 'tvs', 'wifi', 'outdoor_seating', 'reservations', 'live_music'].includes(key)
          )
        })
      }
    })

    return NextResponse.json({ 
      site,
      message: 'Site created successfully',
      nextSteps: [
        'Configure business hours',
        'Add your domain',
        'Customize your content',
        'Add photos and menu items'
      ]
    })

  } catch (error) {
    console.error('Error creating site:', error)
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
  }
}

function generateSampleEvents(siteId: string, businessType: BusinessType, siteData: any) {
  const events = []

  switch (businessType) {
    case 'dive_bar':
      if (siteData.live_music) {
        events.push({
          siteId,
          title: 'Live Music Night',
          description: 'Local bands and musicians every Friday night',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next Friday
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
          isRecurring: true,
          dayOfWeek: 5, // Friday
          time: '20:00'
        })
      }
      if (siteData.pool_tables) {
        events.push({
          siteId,
          title: 'Pool Tournament',
          description: 'Weekly pool tournament with prizes',
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Next Wednesday
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
          isRecurring: true,
          dayOfWeek: 3, // Wednesday
          time: '19:00'
        })
      }
      break

    case 'sports_bar':
      events.push({
        siteId,
        title: 'Game Day Specials',
        description: 'Special deals during major sporting events',
        startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours later
        isRecurring: true,
        dayOfWeek: 1, // Monday (example)
        time: '18:00'
      })
      break

    case 'cafe':
      events.push({
        siteId,
        title: 'Coffee Tasting',
        description: 'Weekly coffee tasting with our barista',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        isRecurring: true,
        dayOfWeek: 2, // Tuesday
        time: '10:00'
      })
      break

    case 'fine_dining':
      events.push({
        siteId,
        title: 'Wine Tasting Evening',
        description: 'Monthly wine tasting with sommelier',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
        isRecurring: false,
        dayOfWeek: null,
        time: null
      })
      break
  }

  return events
}

function generateSampleSpecials(siteId: string, businessType: BusinessType, siteData: any) {
  const specials = []

  switch (businessType) {
    case 'dive_bar':
      if (siteData.happy_hour) {
        specials.push({
          siteId,
          title: 'Happy Hour',
          description: siteData.happy_hour_times || 'Monday-Friday 4-6 PM',
          price: '$2 off all drinks',
          isActive: true
        })
      }
      if (siteData.signature_drink) {
        specials.push({
          siteId,
          title: 'Signature Drink',
          description: siteData.signature_drink,
          price: '$8',
          isActive: true
        })
      }
      break

    case 'cafe':
      specials.push({
        siteId,
        title: 'Daily Special',
        description: 'Fresh pastries and coffee combo',
        price: '$6.99',
        isActive: true
      })
      if (siteData.signature_drink) {
        specials.push({
          siteId,
          title: 'Signature Coffee',
          description: siteData.signature_drink,
          price: '$4.99',
          isActive: true
        })
      }
      break

    case 'fine_dining':
      if (siteData.signature_dish) {
        specials.push({
          siteId,
          title: 'Chef\'s Special',
          description: siteData.signature_dish,
          price: 'Market Price',
          isActive: true
        })
      }
      break

    case 'sports_bar':
      if (siteData.game_specials) {
        specials.push({
          siteId,
          title: 'Game Day Special',
          description: siteData.game_specials_details || 'Special deals during games',
          price: 'Varies',
          isActive: true
        })
      }
      break
  }

  return specials
}
