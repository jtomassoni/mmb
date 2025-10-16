import { prisma } from './prisma'

export async function getSiteByHostname(hostname: string) {
  try {
    const domain = await prisma.domain.findUnique({
      where: {
        hostname: hostname.toLowerCase()
      },
      include: {
        site: {
          include: {
            hours: true,
            events: {
              where: {
                startDate: {
                  gte: new Date()
                }
              },
              orderBy: {
                startDate: 'asc'
              }
            },
            specials: {
              where: {
                isActive: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    })

    return domain?.site || null
  } catch (error) {
    console.error('Error fetching site by hostname:', error)
    return null
  }
}

export async function getSiteIdFromHost(hostname: string): Promise<string | null> {
  try {
    const domain = await prisma.domain.findUnique({
      where: {
        hostname: hostname.toLowerCase()
      },
      select: {
        siteId: true
      }
    })

    return domain?.siteId || null
  } catch (error) {
    console.error('Error fetching site ID from hostname:', error)
    return null
  }
}

export function getHostnameFromRequest(request: Request): string {
  const host = request.headers.get('host') || ''
  return host.toLowerCase()
}

export function isPlatformHost(hostname: string): boolean {
  const platformHost = process.env.PLATFORM_HOST || 'mmb-five.vercel.app'
  return hostname === platformHost.toLowerCase()
}