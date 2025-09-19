import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    // Get all active sites with their domains
    const sites = await prisma.site.findMany({
      include: {
        domains: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    })

    const results = []

    for (const site of sites) {
      for (const domain of site.domains) {
        const url = `https://${domain.hostname}`
        
        try {
          const startTime = Date.now()
          const response = await fetch(url, {
            method: 'HEAD',
          })
          const responseTime = Date.now() - startTime

          // Store health ping
          await prisma.healthPing.create({
            data: {
              siteId: site.id,
              url,
              status: response.status,
              responseTime,
            }
          })

          results.push({
            site: site.name,
            domain: domain.hostname,
            status: response.status,
            responseTime,
            success: response.status < 400
          })
        } catch (error) {
          // Store failed ping
          await prisma.healthPing.create({
            data: {
              siteId: site.id,
              url,
              status: 500,
              responseTime: null,
            }
          })

          results.push({
            site: site.name,
            domain: domain.hostname,
            status: 500,
            responseTime: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      totalSites: sites.length,
      totalDomains: sites.reduce((sum, site) => sum + site.domains.length, 0)
    })
  } catch (error) {
    console.error('Health check cron error:', error)
    return NextResponse.json({ 
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
