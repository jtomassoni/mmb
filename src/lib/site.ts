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

export function getHostnameFromRequest(request: Request): string {
  const host = request.headers.get('host') || ''
  return host.toLowerCase()
}

export function isPlatformHost(hostname: string): boolean {
  const platformHost = process.env.PLATFORM_HOST || 'www.byte-by-bite.com'
  return hostname === platformHost.toLowerCase()
}
