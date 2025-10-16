#!/usr/bin/env tsx
// scripts/add-vercel-domain.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addVercelDomain() {
  try {
    console.log('🌐 Adding Vercel domain for Monaghan\'s...')

    // Find Monaghan's site
    const site = await prisma.site.findFirst({
      where: {
        slug: 'monaghans-bar-grill'
      }
    })

    if (!site) {
      console.error('❌ Monaghan\'s site not found. Please create it first.')
      return
    }

    console.log(`✅ Found site: ${site.name}`)

    // Check if domain already exists
    const existingDomain = await prisma.domain.findFirst({
      where: {
        hostname: 'mmb-five.vercel.app'
      }
    })

    if (existingDomain) {
      console.log('ℹ️  Domain already exists, updating...')
      await prisma.domain.update({
        where: { id: existingDomain.id },
        data: {
          status: 'ACTIVE',
          siteId: site.id
        }
      })
      console.log('✅ Domain updated')
    } else {
      // Create domain entry
      const domain = await prisma.domain.create({
        data: {
          hostname: 'mmb-five.vercel.app',
          siteId: site.id,
          status: 'ACTIVE',
          provider: 'VERCEL'
        }
      })
      console.log(`✅ Created domain: ${domain.hostname}`)
    }

    console.log('🎉 Domain setup completed!')
    console.log('📝 Next steps:')
    console.log('   1. Test mmb-five.vercel.app - should show Monaghan\'s site')
    console.log('   2. Test mmb-five.vercel.app/admin - should show admin dashboard')

  } catch (error) {
    console.error('❌ Error adding domain:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
if (require.main === module) {
  addVercelDomain()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { addVercelDomain }
