import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { hasPermission } from '../../../lib/rbac'
import { prisma } from '../../../lib/prisma'
import AnalyticsDashboard from '../../../components/analytics-dashboard'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Check permissions
  if (!hasPermission((session.user as any).role, 'analytics', 'read')) {
    redirect('/admin')
  }

  // Get user's site access
  let userSiteId: string | null = null
  if ((session.user as any).role !== 'SUPERADMIN') {
    const membership = await prisma.membership.findFirst({
      where: { userId: (session.user as any).id }
    })
    userSiteId = membership?.siteId || null
  }

  // For SUPERADMIN, get the first site (or you could show a site selector)
  let siteId = userSiteId
  if ((session.user as any).role === 'SUPERADMIN' && !siteId) {
    const firstSite = await prisma.site.findFirst({
      select: { id: true }
    })
    siteId = firstSite?.id || null
  }

  if (!siteId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">No site found. Please ensure you have access to a site.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnalyticsDashboard siteId={siteId} />
      </div>
    </div>
  )
}
