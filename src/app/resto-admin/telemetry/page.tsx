import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import TelemetryDashboard from '../../../components/telemetry-dashboard'

export default async function TelemetryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <TelemetryDashboard />
      </div>
    </div>
  )
}
