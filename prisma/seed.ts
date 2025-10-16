import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
  
  // In production, you can change this username to create a new superadmin
  // The old superadmin will be automatically deleted
  const PRODUCTION_SUPERADMIN = {
    email: 'jimmythegent',
    name: 'James Tomassoni',
    password: 'foobar'
  }
  
  // Create test users (production gets minimal setup)
  const users = isProduction ? [
    {
      email: PRODUCTION_SUPERADMIN.email,
      name: PRODUCTION_SUPERADMIN.name,
      role: 'SUPERADMIN' as Role,
      password: PRODUCTION_SUPERADMIN.password
    }
  ] : [
    {
      email: 'jt',
      name: 'JT',
      role: 'SUPERADMIN' as Role,
      password: 'test'
    },
    {
      email: 'owner',
      name: 'Owner',
      role: 'OWNER' as Role,
      password: 'test'
    },
    {
      email: 'manager',
      name: 'Manager',
      role: 'MANAGER' as Role,
      password: 'test'
    },
    {
      email: 'staff',
      name: 'Staff',
      role: 'STAFF' as Role,
      password: 'test'
    }
  ]

  // In production, remove any old superadmins before creating the new one
  if (isProduction) {
    const oldSuperadmins = await prisma.user.findMany({
      where: { 
        role: 'SUPERADMIN',
        email: { not: PRODUCTION_SUPERADMIN.email }
      }
    })
    
    if (oldSuperadmins.length > 0) {
      console.log(`🗑️  Removing ${oldSuperadmins.length} old superadmin(s):`)
      for (const oldAdmin of oldSuperadmins) {
        console.log(`   - ${oldAdmin.email}`)
        await prisma.user.delete({ where: { id: oldAdmin.id } })
      }
    }
  }

  // Create users
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        // If user exists, update password and reset flag (in case you forgot password)
        password: userData.password,
        mustResetPassword: isProduction,
        role: userData.role,
        name: userData.name
      },
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        mustResetPassword: isProduction, // Force password reset in production
        ...(userData.password && { password: userData.password }) // Store plain text for MVP testing
      }
    })
    
    console.log(`✅ Created/Updated user: ${user.email} (${user.role})${isProduction ? ' (must reset password)' : ''}`)
  }
  
  if (isProduction) {
    console.log('🚀 Production mode: Only creating superadmin user')
    console.log('✅ Seed complete - minimal production setup')
    return // Skip all the sample data for production
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
      googleMapsUrl: 'https://maps.app.goo.gl/LA2AYUTPUreV9KyJ8',
      themeId: 'classic-green'
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
    { name: 'Beverages', description: 'Refreshing drinks and specialty beverages', sortOrder: 5 }
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

  // Create sample menu items
  const sampleMenuItems = [
    // Appetizers
    { name: 'Buffalo Wings', description: 'Spicy buffalo wings served with ranch and celery', price: 12.99, category: 'Appetizers', sortOrder: 1, image: '/pics/monaghans-beer-and-shot.jpg' },
    { name: 'Nachos Supreme', description: 'Loaded nachos with cheese, jalapeños, sour cream, and guacamole', price: 14.99, category: 'Appetizers', sortOrder: 2, image: '/pics/monaghans-taco-platter.jpg' },
    { name: 'Mozzarella Sticks', description: 'Crispy mozzarella sticks with marinara sauce', price: 9.99, category: 'Appetizers', sortOrder: 3 },
    
    // Entrees
    { name: 'Monaghan Burger', description: 'Our famous burger with lettuce, tomato, onion, and special sauce', price: 16.99, category: 'Entrees', sortOrder: 1, image: '/pics/monaghans-breakfast-biscut.jpg' },
    { name: 'Fish & Chips', description: 'Beer-battered cod with crispy fries and coleslaw', price: 18.99, category: 'Entrees', sortOrder: 2, image: '/pics/monaghans-fish-n-chips.jpg' },
    { name: 'Chicken Quesadilla', description: 'Grilled chicken with cheese and peppers in a flour tortilla', price: 15.99, category: 'Entrees', sortOrder: 3, image: '/pics/monaghans-quesadilla.jpg' },
    { name: 'BBQ Ribs', description: 'Slow-cooked ribs with our signature BBQ sauce', price: 22.99, category: 'Entrees', sortOrder: 4 },
    
    // Sides
    { name: 'French Fries', description: 'Crispy golden fries', price: 4.99, category: 'Sides', sortOrder: 1 },
    { name: 'Onion Rings', description: 'Beer-battered onion rings', price: 5.99, category: 'Sides', sortOrder: 2 },
    { name: 'Coleslaw', description: 'Fresh cabbage slaw with our house dressing', price: 3.99, category: 'Sides', sortOrder: 3 },
    
    // Desserts
    { name: 'Chocolate Cake', description: 'Rich chocolate cake with vanilla ice cream', price: 7.99, category: 'Desserts', sortOrder: 1 },
    { name: 'Apple Pie', description: 'Homemade apple pie with cinnamon', price: 6.99, category: 'Desserts', sortOrder: 2 },
    
    // Beverages
    { name: 'Craft Beer', description: 'Selection of local craft beers', price: 5.99, category: 'Beverages', sortOrder: 1 },
    { name: 'House Wine', description: 'Red or white wine by the glass', price: 7.99, category: 'Beverages', sortOrder: 2 },
    { name: 'Soft Drinks', description: 'Coke, Pepsi, Sprite, and more', price: 2.99, category: 'Beverages', sortOrder: 3 },
    
    // Specials
    { name: 'Daily Soup', description: 'Chef\'s choice soup of the day', price: 6.99, category: 'Specials', sortOrder: 1 },
    { name: 'Chef\'s Special', description: 'Ask your server about today\'s chef special', price: 19.99, category: 'Specials', sortOrder: 2 }
  ]

  for (const itemData of sampleMenuItems) {
    await prisma.menuItem.create({
      data: {
        siteId: site.id,
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        category: itemData.category,
        image: itemData.image || null,
        sortOrder: itemData.sortOrder,
        isAvailable: true
      }
    })
  }
  console.log(`✅ Created sample menu items`)

  // Create memberships for users
  const superadminUser = await prisma.user.findUnique({ where: { email: 'jt' } })
  const ownerUser = await prisma.user.findUnique({ where: { email: 'owner' } })
  const managerUser = await prisma.user.findUnique({ where: { email: 'manager' } })
  const staffUser = await prisma.user.findUnique({ where: { email: 'staff' } })

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


  // Create default event types
  const eventTypes = [
    {
      name: 'Food Special',
      description: 'Daily food specials and promotions',
      color: '#FF6B35',
      icon: '🍔',
      isActive: true
    },
    {
      name: 'Drink Special',
      description: 'Happy hour and drink promotions',
      color: '#4ECDC4',
      icon: '🍺',
      isActive: true
    },
    {
      name: 'Live Music',
      description: 'Live bands and musical performances',
      color: '#9B59B6',
      icon: '🎸',
      isActive: true
    },
    {
      name: 'Karaoke',
      description: 'Karaoke nights and sing-alongs',
      color: '#E91E63',
      icon: '🎤',
      isActive: true
    },
    {
      name: 'Trivia Night',
      description: 'Trivia competitions with prizes',
      color: '#FF9800',
      icon: '🧠',
      isActive: true
    },
    {
      name: 'Sports Event',
      description: 'Broncos games, watch parties, and sports events',
      color: '#FB4F14',
      icon: '🏈',
      isActive: true
    },
    {
      name: 'Special Event',
      description: 'Holiday events, parties, and special occasions',
      color: '#E74C3C',
      icon: '🎉',
      isActive: true
    },
    {
      name: 'Pool Tournament',
      description: 'Pool and billiards tournaments',
      color: '#00695C',
      icon: '🎱',
      isActive: true
    },
    {
      name: 'Closure',
      description: 'Temporary closures for holidays, buyouts, or maintenance',
      color: '#DC2626',
      icon: '🚫',
      isActive: true
    },
    {
      name: 'Special Hours',
      description: 'Modified operating hours for events or holidays',
      color: '#F59E0B',
      icon: '🕐',
      isActive: true
    }
  ]

  const createdEventTypes = []
  for (const eventTypeData of eventTypes) {
    const eventType = await prisma.eventType.create({
      data: {
        siteId: site.id,
        ...eventTypeData
      }
    })
    createdEventTypes.push(eventType)
  }
  console.log(`✅ Created ${createdEventTypes.length} event types`)

  // Create realistic Monaghan's events using the created event types
  const foodSpecialType = createdEventTypes.find(t => t.name === 'Food Special')
  const drinkSpecialType = createdEventTypes.find(t => t.name === 'Drink Special')
  const entertainmentType = createdEventTypes.find(t => t.name === 'Live Music')
  const karaokeType = createdEventTypes.find(t => t.name === 'Karaoke')
  const triviaType = createdEventTypes.find(t => t.name === 'Trivia Night')
  const sportsType = createdEventTypes.find(t => t.name === 'Sports Event')

  const monaghanEvents = [
    {
      siteId: site.id,
      name: 'Taco Tuesday',
      description: 'Beef tacos $1.50, Chicken/Carnitas $2, Fish $3. All day!',
      startDate: new Date('2025-10-21T10:00:00'),
      endDate: new Date('2025-10-21T23:59:59'),
      startTime: '10:00',
      endTime: '23:59',
      location: 'Main Bar',
      eventTypeId: foodSpecialType?.id,
      price: 'Starting at $1.50',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Thirsty Thursday',
      description: '$1 off all tequila drinks and Philly cheesesteak special',
      startDate: new Date('2025-10-23T15:00:00'),
      endDate: new Date('2025-10-23T23:59:59'),
      startTime: '15:00',
      endTime: '23:59',
      location: 'Main Bar',
      eventTypeId: drinkSpecialType?.id,
      price: '$1 off',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Music Bingo',
      description: 'Music bingo night with cash prizes and great tunes! Test your music knowledge.',
      startDate: new Date('2025-10-23T20:00:00'),
      endDate: new Date('2025-10-23T22:00:00'),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Main Dining Room',
      eventTypeId: triviaType?.id,
      price: 'Free to play',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Friday Live Music',
      description: 'Live local bands every Friday night! Come for the music, stay for the drinks.',
      startDate: new Date('2025-10-24T21:00:00'),
      endDate: new Date('2025-10-25T01:00:00'),
      startTime: '21:00',
      endTime: '01:00',
      location: 'Main Bar',
      eventTypeId: entertainmentType?.id,
      price: 'No cover',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Saturday Karaoke',
      description: 'Sing your heart out! Karaoke every Saturday night with full bar and kitchen.',
      startDate: new Date('2025-10-25T21:00:00'),
      endDate: new Date('2025-10-26T01:00:00'),
      startTime: '21:00',
      endTime: '01:00',
      location: 'Main Bar',
      eventTypeId: karaokeType?.id,
      price: 'Free',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Monday Night Football',
      description: 'Watch all the Monday Night Football action on our big screens with food and drink specials.',
      startDate: new Date('2025-10-27T18:00:00'),
      endDate: new Date('2025-10-27T23:00:00'),
      startTime: '18:00',
      endTime: '23:00',
      location: 'Main Bar & Patio',
      eventTypeId: sportsType?.id,
      price: 'Free entry',
      isActive: true
    },
    {
      siteId: site.id,
      name: 'Poker Night',
      description: 'Weekly poker tournament with cash prizes. Sign up starts at 6:30 PM.',
      startDate: new Date('2025-10-27T19:00:00'),
      endDate: new Date('2025-10-27T23:00:00'),
      startTime: '19:00',
      endTime: '23:00',
      location: 'Back Room',
      eventTypeId: triviaType?.id,
      price: '$20 buy-in',
      isActive: true
    }
  ]

  for (const eventData of monaghanEvents) {
    await prisma.event.create({
      data: eventData
    })
  }
  console.log(`✅ Created ${monaghanEvents.length} Monaghan's events`)

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
