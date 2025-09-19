import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { addProjectDomain } from '../../../../../lib/vercel'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { siteId, hostname } = await request.json()

    if (!siteId || !hostname) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create domain record
    const domain = await prisma.domain.create({
      data: {
        siteId,
        hostname,
        status: 'PENDING',
        provider: 'VERCEL'
      }
    })

    // If Vercel token is available, try to add domain to project
    if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
      try {
        await addProjectDomain({
          projectId: process.env.VERCEL_PROJECT_ID,
          token: process.env.VERCEL_TOKEN,
          hostname
        })
      } catch (error) {
        console.error('Failed to add domain to Vercel:', error)
        // Continue anyway - user can add manually
      }
    }

    return NextResponse.json({ 
      domain,
      dnsSteps: {
        subdomain: 'CNAME → cname.vercel-dns.com',
        apex: 'A/ALIAS records from Vercel response'
      }
    })
  } catch (error) {
    console.error('Error adding domain:', error)
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 })
  }
}
