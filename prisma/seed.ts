import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        // Note: NextAuth doesn't store passwords in our User model
        // Passwords are handled by the auth provider
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
      description: 'Your neighborhood bar and grill with great food, drinks, and atmosphere',
      address: '123 Main Street, Anytown, USA',
      phone: '(555) 123-4567',
      email: 'info@monaghans.com'
    }
  })
  
  console.log(`✅ Created site: ${site.name}`)

  // Create memberships for non-superadmin users
  const ownerUser = await prisma.user.findUnique({ where: { email: 'owner@monaghans.com' } })
  const managerUser = await prisma.user.findUnique({ where: { email: 'manager@monaghans.com' } })
  const staffUser = await prisma.user.findUnique({ where: { email: 'staff@monaghans.com' } })

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
      title: 'Live Music Friday',
      description: 'Join us for live music every Friday night!',
      startDate: new Date('2025-09-20T19:00:00Z'),
      endDate: new Date('2025-09-20T23:00:00Z'),
      isRecurring: true,
      dayOfWeek: 5, // Friday
      time: '19:00'
    },
    {
      siteId: site.id,
      title: 'Trivia Night',
      description: 'Test your knowledge and win prizes!',
      startDate: new Date('2025-09-25T18:00:00Z'),
      endDate: new Date('2025-09-25T21:00:00Z'),
      isRecurring: true,
      dayOfWeek: 3, // Wednesday
      time: '18:00'
    }
  ]

  for (const eventData of sampleEvents) {
    await prisma.event.create({
      data: eventData
    })
  }
  console.log(`✅ Created sample events`)

  const sampleSpecials = [
    {
      siteId: site.id,
      title: 'Monday Burger Special',
      description: 'Get any burger with fries for just $12.99',
      price: '$12.99',
      isActive: true
    },
    {
      siteId: site.id,
      title: 'Happy Hour',
      description: 'Half price drinks and appetizers',
      price: '50% off',
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
