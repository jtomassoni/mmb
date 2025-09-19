// scripts/add-monaghans-domain.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMonaghansDomain() {
  try {
    console.log('🌐 Adding Monaghan\'s domain...')

    // Get the Monaghan's site
    const site = await prisma.site.findFirst({
      where: {
        slug: 'monaghans-bar-grill'
      }
    })

    if (!site) {
      console.error('❌ Monaghan\'s site not found. Please create the site first.')
      return
    }

    console.log(`📍 Found site: ${site.name}`)

    // Check if domain already exists
    const existingDomain = await prisma.domain.findFirst({
      where: {
        hostname: 'monaghansbargrill.com'
      }
    })

    if (existingDomain) {
      console.log('ℹ️  Domain already exists, skipping creation')
      console.log(`   Status: ${existingDomain.status}`)
      console.log(`   Provider: ${existingDomain.provider}`)
      return
    }

    // Create the domain
    const domain = await prisma.domain.create({
      data: {
        siteId: site.id,
        hostname: 'monaghansbargrill.com',
        status: 'PENDING',
        provider: 'VERCEL'
      }
    })

    console.log(`✅ Created domain: ${domain.hostname}`)
    console.log(`   Status: ${domain.status}`)
    console.log(`   Provider: ${domain.provider}`)
    console.log(`   Site ID: ${domain.siteId}`)

    console.log('🎉 Monaghan\'s domain added successfully!')
    console.log('📝 Next steps:')
    console.log('   1. Configure DNS records (CNAME or A records)')
    console.log('   2. Use the domain management UI to verify the domain')
    console.log('   3. Test the domain is accessible')
  } catch (error) {
    console.error('❌ Error adding domain:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
if (require.main === module) {
  addMonaghansDomain()
    .then(() => {
      console.log('✅ Domain addition completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Domain addition failed:', error)
      process.exit(1)
    })
}

export { addMonaghansDomain }
