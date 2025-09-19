import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { getDomainStatus } from '../../../../../lib/vercel'

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
    if (process.env.VERCEL_TOKEN && domain.provider === 'VERCEL') {
      try {
        const status = await getDomainStatus({
          token: process.env.VERCEL_TOKEN,
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
          verified: isActive
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
          error: 'Failed to verify domain'
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
        verified: true
      })
    }
  } catch (error) {
    console.error('Error verifying domain:', error)
    return NextResponse.json({ error: 'Failed to verify domain' }, { status: 500 })
  }
}
