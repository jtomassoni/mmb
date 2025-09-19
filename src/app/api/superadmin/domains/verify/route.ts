import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { getDomainStatus } from '../../../../../lib/vercel'
import { validateVercelEnv, getVercelEnvHelpMessage } from '../../../../../lib/vercel-env'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { domainId } = await request.json()

    if (!domainId) {
      return NextResponse.json({ error: 'Missing domainId' }, { status: 400 })
    }

    const domain = await prisma.domain.findUnique({
      where: { id: domainId }
    })

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    // Check domain status with Vercel
    const vercelValidation = validateVercelEnv()
    
    if (vercelValidation.isValid && domain.provider === 'VERCEL') {
      try {
        const vercelConfig = vercelValidation.config!
        const status = await getDomainStatus({
          token: vercelConfig.VERCEL_TOKEN,
          hostname: domain.hostname
        })

        const isActive = status.verified === true

        const updatedDomain = await prisma.domain.update({
          where: { id: domainId },
          data: {
            status: isActive ? 'ACTIVE' : 'PENDING',
            verifiedAt: isActive ? new Date() : null
          }
        })

        return NextResponse.json({ 
          domain: updatedDomain,
          verified: isActive,
          vercel: {
            success: true,
            autoVerified: true
          }
        })
      } catch (error) {
        console.error('Failed to check domain status:', error)
        
        // Mark as error if we can't check
        const updatedDomain = await prisma.domain.update({
          where: { id: domainId },
          data: { status: 'ERROR' }
        })

        return NextResponse.json({ 
          domain: updatedDomain,
          verified: false,
          vercel: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }
    } else {
      // Manual verification - just mark as active
      const updatedDomain = await prisma.domain.update({
        where: { id: domainId },
        data: {
          status: 'ACTIVE',
          verifiedAt: new Date()
        }
      })

      return NextResponse.json({ 
        domain: updatedDomain,
        verified: true,
        vercel: {
          success: false,
          error: vercelValidation.isValid ? 'Domain not managed by Vercel' : getVercelEnvHelpMessage(vercelValidation)
        }
      })
    }
  } catch (error) {
    console.error('Error verifying domain:', error)
    return NextResponse.json({ error: 'Failed to verify domain' }, { status: 500 })
  }
}
