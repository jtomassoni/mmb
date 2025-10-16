import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addNFLWatchParties() {
  console.log('🏈 Adding NFL Watch Parties...')

  // Get the site
  const site = await prisma.site.findFirst({
    where: { slug: 'monaghans-bargrill' }
  })

  if (!site) {
    console.error('❌ Site not found')
    return
  }

  // Get the Sports Event type
  let sportsEventType = await prisma.eventType.findFirst({
    where: { 
      siteId: site.id,
      name: 'Sports Event'
    }
  })

  if (!sportsEventType) {
    sportsEventType = await prisma.eventType.create({
      data: {
        siteId: site.id,
        name: 'Sports Event',
        description: 'NFL games, watch parties, and sports events',
        color: '#3498DB',
        icon: '🏈',
        isActive: true
      }
    })
    console.log('✅ Created Sports Event type')
  }

  // Generate NFL events for the rest of 2025
  const events = []
  const currentDate = new Date()
  const endDate = new Date('2025-12-31')

  // Thursday Night Football (starts at 5pm)
  for (let date = new Date(currentDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 4) { // Thursday
      const startDate = new Date(date)
      startDate.setHours(17, 0, 0, 0) // 5:00 PM
      
      const endDate = new Date(date)
      endDate.setHours(23, 0, 0, 0) // 11:00 PM

      events.push({
        siteId: site.id,
        name: 'Thursday Night NFL Watch Party',
        description: 'Join us for Thursday Night Football! Great food, cold drinks, and the best atmosphere to watch the game.',
        startDate: startDate,
        endDate: endDate,
        startTime: '17:00',
        endTime: '23:00',
        location: 'Main Dining Room',
        isActive: true,
        eventTypeId: sportsEventType.id,
        price: 'Free to watch'
      })
    }
  }

  // Sunday NFL Games (starts at 10am for early games, 1pm for regular games)
  for (let date = new Date(currentDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 0) { // Sunday
      // Early games (10am)
      const earlyStartDate = new Date(date)
      earlyStartDate.setHours(10, 0, 0, 0) // 10:00 AM
      
      const earlyEndDate = new Date(date)
      earlyEndDate.setHours(14, 0, 0, 0) // 2:00 PM

      events.push({
        siteId: site.id,
        name: 'Sunday NFL Early Games',
        description: 'Catch the early NFL games with us! Breakfast specials and morning drinks available.',
        startDate: earlyStartDate,
        endDate: earlyEndDate,
        startTime: '10:00',
        endTime: '14:00',
        location: 'Main Dining Room',
        isActive: true,
        eventTypeId: sportsEventType.id,
        price: 'Free to watch'
      })

      // Regular games (1pm)
      const regularStartDate = new Date(date)
      regularStartDate.setHours(13, 0, 0, 0) // 1:00 PM
      
      const regularEndDate = new Date(date)
      regularEndDate.setHours(17, 0, 0, 0) // 5:00 PM

      events.push({
        siteId: site.id,
        name: 'Sunday NFL Regular Games',
        description: 'Sunday afternoon NFL action! Perfect time for lunch and drinks while watching the games.',
        startDate: regularStartDate,
        endDate: regularEndDate,
        startTime: '13:00',
        endTime: '17:00',
        location: 'Main Dining Room',
        isActive: true,
        eventTypeId: sportsEventType.id,
        price: 'Free to watch'
      })
    }
  }

  // Monday Night Football (starts at 5pm)
  for (let date = new Date(currentDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 1) { // Monday
      const startDate = new Date(date)
      startDate.setHours(17, 0, 0, 0) // 5:00 PM
      
      const endDate = new Date(date)
      endDate.setHours(23, 0, 0, 0) // 11:00 PM

      events.push({
        siteId: site.id,
        name: 'Monday Night NFL Watch Party',
        description: 'Monday Night Football! End your Monday right with great food, drinks, and football.',
        startDate: startDate,
        endDate: endDate,
        startTime: '17:00',
        endTime: '23:00',
        location: 'Main Dining Room',
        isActive: true,
        eventTypeId: sportsEventType.id,
        price: 'Free to watch'
      })
    }
  }

  // Add events to database
  let addedCount = 0
  for (const eventData of events) {
    try {
      await prisma.event.create({
        data: eventData
      })
      addedCount++
    } catch (error) {
      // Skip if event already exists (duplicate key error)
      if (error instanceof Error && !error.message.includes('Unique constraint')) {
        console.error('Error adding event:', error)
      }
    }
  }

  console.log(`✅ Added ${addedCount} NFL watch party events`)
  console.log('🏈 NFL Watch Parties setup complete!')
}

addNFLWatchParties()
  .catch((e) => {
    console.error('❌ Failed to add NFL watch parties:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
