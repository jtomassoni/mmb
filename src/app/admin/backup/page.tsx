import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { hasPermission } from '../../../lib/rbac'
import { redirect } from 'next/navigation'
import BackupDashboard from '../../../components/backup-dashboard'

export default async function BackupPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Check permissions - only SUPERADMIN can access backup management
  if (!hasPermission((session.user as any).role, 'backup', 'read')) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackupDashboard />
      </div>
    </div>
  )
}
