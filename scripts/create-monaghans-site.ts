// scripts/create-monaghans-site.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createMonaghansSite() {
  try {
    console.log('🏪 Creating Monaghan\'s Bar & Grill site...')

    // Check if site already exists
    const existingSite = await prisma.site.findFirst({
      where: {
        slug: 'monaghans-bar-grill'
      }
    })

    if (existingSite) {
      console.log('ℹ️  Site already exists, skipping creation')
      console.log(`   Name: ${existingSite.name}`)
      console.log(`   Slug: ${existingSite.slug}`)
      return existingSite
    }

    // Create Monaghan's Bar & Grill site
    const site = await prisma.site.create({
      data: {
        name: "Monaghan's Bar & Grill",
        slug: "monaghans-bar-grill",
        description: "Where Denver comes to eat, drink, and play",
        address: "1234 Main Street, Denver, CO 80202",
        phone: "(303) 555-0123",
        email: "info@monaghansbargrill.com"
      }
    })

    console.log(`✅ Created site: ${site.name}`)
    console.log(`   Slug: ${site.slug}`)
    console.log(`   Description: ${site.description}`)
    console.log(`   Address: ${site.address}`)
    console.log(`   Phone: ${site.phone}`)
    console.log(`   Email: ${site.email}`)
    
    return site
  } catch (error) {
    console.error('❌ Error creating site:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
if (require.main === module) {
  createMonaghansSite()
    .then(() => {
      console.log('✅ Site creation completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Site creation failed:', error)
      process.exit(1)
    })
}

export { createMonaghansSite }
