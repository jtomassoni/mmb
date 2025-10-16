// scripts/setup-production.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupProduction() {
  try {
    console.log('🚀 Setting up production environment...')

    // Check if we're in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  This script should only be run in production')
      return
    }

    // Verify required environment variables
    const requiredEnvVars = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'DATABASE_URL',
      'VERCEL_TOKEN',
      'VERCEL_PROJECT_ID'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars)
      console.log('📝 Please set these in your Vercel project settings')
      return
    }

    console.log('✅ All required environment variables are set')

    // Check database connection
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      return
    }

    // Check if Monaghan's site exists
    const monaghansSite = await prisma.site.findFirst({
      where: { slug: 'monaghans-bargrill' }
    })

    if (!monaghansSite) {
      console.log('🏗️  Creating Monaghan\'s site...')
      await prisma.site.create({
        data: {
          name: "Monaghan's Bar & Grill",
          slug: "monaghans-bargrill",
          description: "Where Denver comes to eat, drink, and play",
          address: "1234 Main Street, Denver, CO 80202",
          phone: "(303) 555-0123",
          email: "info@monaghansbargrill.com"
        }
      })
      console.log('✅ Monaghan\'s site created')
    } else {
      console.log('✅ Monaghan\'s site exists')
    }

    // Check domain configuration
    const domains = await prisma.domain.findMany({
      include: { site: true }
    })

    console.log(`📊 Found ${domains.length} domains:`)
    domains.forEach(domain => {
      console.log(`   - ${domain.hostname} (${domain.site.name}) - ${domain.status}`)
    })

    console.log('🎉 Production setup completed successfully!')
    console.log('📝 Next steps:')
    console.log('   1. Configure DNS records for your domains')
    console.log('   2. Test domain verification in the admin UI')
    console.log('   3. Monitor health dashboard for system status')

  } catch (error) {
    console.error('❌ Production setup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
if (require.main === module) {
  setupProduction()
    .then(() => {
      console.log('✅ Production setup completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Production setup failed:', error)
      process.exit(1)
    })
}

export { setupProduction }
