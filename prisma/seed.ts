import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test users
  const users = [
    {
      email: 'superadmin@monaghans.com',
      name: 'Super Admin',
      role: 'SUPERADMIN' as Role,
      password: 'test'
    },
    {
      email: 'owner@monaghans.com',
      name: 'Monaghan Owner',
      role: 'OWNER' as Role,
      password: 'test'
    },
    {
      email: 'manager@monaghans.com',
      name: 'Restaurant Manager',
      role: 'MANAGER' as Role,
      password: 'test'
    },
    {
      email: 'staff@monaghans.com',
      name: 'Restaurant Staff',
      role: 'STAFF' as Role,
      password: 'test'
    }
  ]

  // Create users
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        ...(userData.password && { password: userData.password }) // Store plain text for MVP testing
      }
    })
    
    console.log(`✅ Created user: ${user.email} (${user.role})`)
  }

  // Create Monaghan's site
  const site = await prisma.site.upsert({
    where: { slug: 'monaghans-bargrill' },
    update: {},
    create: {
      name: "Monaghan's Bar & Grill",
      slug: 'monaghans-bargrill',
      description: 'Your neighborhood bar and grill with great food, drinks, and atmosphere. Join us for live music, trivia nights, and daily specials!',
      address: '123 Main Street, Denver, CO 80202',
      phone: '(303) 555-0123',
      email: 'info@monaghans.com',
      timezone: 'America/Denver',
      currency: 'USD',
      latitude: 39.7392, // Denver coordinates (approximate)
      longitude: -104.9903,
      googleMapsUrl: 'https://maps.app.goo.gl/LA2AYUTPUreV9KyJ8'
    }
  })
  
  console.log(`✅ Created site: ${site.name}`)

  // Create business hours
  const businessHours = [
    { dayOfWeek: 0, openTime: '10:00', closeTime: '21:00', isClosed: false }, // Sunday
    { dayOfWeek: 1, openTime: '11:00', closeTime: '22:00', isClosed: false }, // Monday
    { dayOfWeek: 2, openTime: '11:00', closeTime: '22:00', isClosed: false }, // Tuesday
    { dayOfWeek: 3, openTime: '11:00', closeTime: '22:00', isClosed: false }, // Wednesday
    { dayOfWeek: 4, openTime: '11:00', closeTime: '22:00', isClosed: false }, // Thursday
    { dayOfWeek: 5, openTime: '11:00', closeTime: '23:00', isClosed: false }, // Friday
    { dayOfWeek: 6, openTime: '10:00', closeTime: '23:00', isClosed: false }, // Saturday
  ]

  for (const hourData of businessHours) {
    await prisma.hours.upsert({
      where: { siteId_dayOfWeek: { siteId: site.id, dayOfWeek: hourData.dayOfWeek } },
      update: {},
      create: {
        siteId: site.id,
        dayOfWeek: hourData.dayOfWeek,
        openTime: hourData.openTime,
        closeTime: hourData.closeTime,
        isClosed: hourData.isClosed
      }
    })
  }
  console.log(`✅ Created business hours`)

  // Create default menu categories
  const menuCategories = [
    { name: 'Appetizers', description: 'Start your meal with our delicious appetizers', sortOrder: 1 },
    { name: 'Entrees', description: 'Our main course specialties', sortOrder: 2 },
    { name: 'Sides', description: 'Perfect accompaniments to your meal', sortOrder: 3 },
    { name: 'Desserts', description: 'Sweet endings to your dining experience', sortOrder: 4 },
    { name: 'Beverages', description: 'Refreshing drinks and specialty beverages', sortOrder: 5 },
    { name: 'Specials', description: 'Chef\'s daily specials and seasonal offerings', sortOrder: 6 }
  ]

  for (const categoryData of menuCategories) {
    // Check if category already exists
    const existingCategory = await prisma.menuCategory.findFirst({
      where: { 
        siteId: site.id,
        name: categoryData.name 
      }
    })

    if (!existingCategory) {
      await prisma.menuCategory.create({
        data: {
          siteId: site.id,
          name: categoryData.name,
          description: categoryData.description,
          sortOrder: categoryData.sortOrder
        }
      })
    }
  }
  console.log(`✅ Created default menu categories`)

  // Create memberships for non-superadmin users
  const superadminUser = await prisma.user.findUnique({ where: { email: 'superadmin@monaghans.com' } })
  const ownerUser = await prisma.user.findUnique({ where: { email: 'owner@monaghans.com' } })
  const managerUser = await prisma.user.findUnique({ where: { email: 'manager@monaghans.com' } })
  const staffUser = await prisma.user.findUnique({ where: { email: 'staff@monaghans.com' } })

  if (superadminUser) {
    await prisma.membership.upsert({
      where: { userId_siteId: { userId: superadminUser.id, siteId: site.id } },
      update: {},
      create: {
        userId: superadminUser.id,
        siteId: site.id,
        role: 'SUPERADMIN'
      }
    })
    console.log(`✅ Created membership for superadmin`)
  }

  if (ownerUser) {
    await prisma.membership.upsert({
      where: { userId_siteId: { userId: ownerUser.id, siteId: site.id } },
      update: {},
      create: {
        userId: ownerUser.id,
        siteId: site.id,
        role: 'OWNER'
      }
    })
    console.log(`✅ Created membership for owner`)
  }

  if (managerUser) {
    await prisma.membership.upsert({
      where: { userId_siteId: { userId: managerUser.id, siteId: site.id } },
      update: {},
      create: {
        userId: managerUser.id,
        siteId: site.id,
        role: 'MANAGER'
      }
    })
    console.log(`✅ Created membership for manager`)
  }

  if (staffUser) {
    await prisma.membership.upsert({
      where: { userId_siteId: { userId: staffUser.id, siteId: site.id } },
      update: {},
      create: {
        userId: staffUser.id,
        siteId: site.id,
        role: 'STAFF'
      }
    })
    console.log(`✅ Created membership for staff`)
  }


  // Create some sample data
  const sampleEvents = [
    {
      siteId: site.id,
      name: 'Live Music Friday',
      description: 'Join us for live music every Friday night!',
      startDate: new Date('2025-09-20T19:00:00Z'),
      endDate: new Date('2025-09-20T23:00:00Z'),
      startTime: '19:00',
      endTime: '23:00',
      location: 'Main Dining Room',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Trivia Night',
      description: 'Test your knowledge and win prizes!',
      startDate: new Date('2025-09-25T18:00:00Z'),
      endDate: new Date('2025-09-25T21:00:00Z'),
      startTime: '18:00',
      endTime: '21:00',
      location: 'Main Dining Room',
      isActive: true
    }
  ]

  for (const eventData of sampleEvents) {
    await prisma.event.create({
      data: eventData
    })
  }
  console.log(`✅ Created sample events`)

  // Create default event types
  const eventTypes = [
    {
      siteId: site.id,
      name: 'Food Special',
      description: 'Daily food specials and promotions',
      color: '#FF6B35',
      icon: '🍽️',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Drink Special',
      description: 'Happy hour and drink promotions',
      color: '#4ECDC4',
      icon: '🍺',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Entertainment',
      description: 'Live music, trivia, and entertainment events',
      color: '#9B59B6',
      icon: '🎵',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Sports Event',
      description: 'Broncos games, watch parties, and sports events',
      color: '#3498DB',
      icon: '🏈',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Special Event',
      description: 'Holiday events, parties, and special occasions',
      color: '#E74C3C',
      icon: '🎉',
      isActive: true
    }
  ]

  for (const eventTypeData of eventTypes) {
    await prisma.eventType.create({
      data: eventTypeData
    })
  }
  console.log(`✅ Created default event types`)

  const sampleSpecials = [
    {
      siteId: site.id,
      name: 'Monday Burger Special',
      description: 'Get any burger with fries for just $12.99',
      price: 12.99,
      originalPrice: 16.99,
      startDate: new Date('2025-01-06T00:00:00Z'),
      endDate: new Date('2025-01-06T23:59:59Z'),
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Happy Hour',
      description: 'Half price drinks and appetizers',
      price: null,
      originalPrice: null,
      startDate: new Date('2025-01-06T16:00:00Z'),
      endDate: new Date('2025-01-06T18:00:00Z'),
      isActive: true
    }
  ]

  for (const specialData of sampleSpecials) {
    await prisma.special.create({
      data: specialData
    })
  }
  console.log(`✅ Created sample specials`)

  console.log('🎉 Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
