import { prisma } from '@/lib/prisma'

export async function ClosureBanner() {
  try {
    // Get site
    const site = await prisma.site.findFirst()
    if (!site) return null

    // Get today's special day if it exists
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const specialDay = await prisma.specialDay.findFirst({
      where: {
        siteId: site.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    // Only show banner if closed today
    if (!specialDay || !specialDay.closed) return null

    const [year, month, dayNum] = specialDay.date.toISOString().split('T')[0].split('-').map(Number)
    const localDate = new Date(year, month - 1, dayNum)
    const dateStr = localDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })

    return (
      <div className="closure-banner sticky top-[56px] md:top-[64px] z-40 bg-red-600 text-white py-2 px-4 shadow-md">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm md:text-base font-medium">
            <svg className="inline w-5 h-5 mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <strong>Closed {dateStr}:</strong> {specialDay.reason}
          </p>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching closure banner:', error)
    return null
  }
}

