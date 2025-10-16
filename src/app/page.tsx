import { DynamicHero } from '../components/dynamic-hero';
import { getSiteData } from '../lib/site-data';
import { prisma } from '../lib/prisma';

export default async function Home() {
  // Get site data from database
  const siteData = await getSiteData()
  
  // Get business hours - handle case where database is not available during build
  let businessHours: Array<{
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }> = []
  
  try {
    if (siteData?.id) {
      businessHours = await prisma.hours.findMany({
        where: {
          siteId: siteData.id
        },
        orderBy: { dayOfWeek: 'asc' }
      })
    }
  } catch (error) {
    console.error('Error fetching business hours:', error)
    // Provide default business hours if database is not available
    businessHours = [
      { dayOfWeek: 0, openTime: '10:00', closeTime: '21:00', isClosed: false }, // Sunday
      { dayOfWeek: 1, openTime: '11:00', closeTime: '22:00', isClosed: false }, // Monday
      { dayOfWeek: 2, openTime: '11:00', closeTime: '22:00', isClosed: false }, // Tuesday
      { dayOfWeek: 3, openTime: '11:00', closeTime: '22:00', isClosed: false }, // Wednesday
      { dayOfWeek: 4, openTime: '11:00', closeTime: '22:00', isClosed: false }, // Thursday
      { dayOfWeek: 5, openTime: '11:00', closeTime: '23:00', isClosed: false }, // Friday
      { dayOfWeek: 6, openTime: '10:00', closeTime: '23:00', isClosed: false }, // Saturday
    ]
  }

  // Helper function to format business hours
  const formatBusinessHours = (hours: typeof businessHours) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    return hours.map(hour => {
      const dayName = dayNames[hour.dayOfWeek]
      if (hour.isClosed) {
        return `${dayName}: Closed`
      }
      if (hour.openTime && hour.closeTime) {
        // Format time from "09:00" to "9:00 AM"
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(':')
          const hourNum = parseInt(hours)
          const ampm = hourNum >= 12 ? 'PM' : 'AM'
          const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
          return `${displayHour}:${minutes} ${ampm}`
        }
        return `${dayName}: ${formatTime(hour.openTime)} - ${formatTime(hour.closeTime)}`
      }
      return `${dayName}: Hours not set`
    })
  }
  
  // JSON-LD structured data for restaurant
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": siteData?.name || "Monaghan's Bar & Grill",
    "description": siteData?.description || "Where Denver comes to eat, drink, and play",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": siteData?.address || "123 Main Street",
      "addressLocality": "Denver",
      "addressRegion": "CO",
      "postalCode": "80202"
    },
    "telephone": siteData?.phone || "(303) 555-0123",
    "email": siteData?.email || "info@monaghans.com",
    "url": "https://monaghansbargrill.com",
    "servesCuisine": "American",
    "priceRange": "$$",
    "openingHours": businessHours.length > 0 ? businessHours.map(hour => {
      if (hour.isClosed) return null
      if (hour.openTime && hour.closeTime) {
        const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        const dayName = dayNames[hour.dayOfWeek]
        return `${dayName} ${hour.openTime}-${hour.closeTime}`
      }
      return null
    }).filter(Boolean) : [
      "Mo-Th 11:00-22:00",
      "Fr-Sa 11:00-23:00", 
      "Su 10:00-21:00"
    ],
    "amenityFeature": [
      "Pool Tables",
      "Karaoke",
      "Live Entertainment",
      "Full Bar"
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Preload critical images */}
      <link rel="preload" as="image" href="/pics/hero.png" />
      <link rel="preload" as="image" href="/pics/monaghans-billiards.jpg" />
      <link rel="preload" as="image" href="/pics/monaghans-fish-n-chips.jpg" />
      <div className="min-h-screen bg-gray-50">
      {/* Dynamic Hero Section */}
      <DynamicHero siteDescription={siteData?.description} siteName={siteData?.name} />

      {/* Order Online Section - Hidden for now */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-green-100 hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Order Online</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your favorite Monaghan's dishes delivered or ready for pickup
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Ordering Options */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">How to Order</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Call Us</h4>
                      <p className="text-gray-600">Speak directly with our staff</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Place Your Order</h4>
                      <p className="text-gray-600">Tell us what you'd like</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Pick Up or Delivery</h4>
                      <p className="text-gray-600">Ready in 15-20 minutes</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <a 
                    href={`tel:${siteData?.phone?.replace(/\D/g, '') || '3035550123'}`}
                    className="w-full bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 hover:shadow-lg transition-all duration-300 text-center block"
                  >
                    📞 Call Now: {siteData?.phone || "(303) 555-0123"}
                  </a>
                  <a 
                    href="/menu"
                    className="w-full bg-white text-green-600 px-8 py-4 rounded-lg font-semibold border-2 border-green-600 hover:bg-green-50 transition-all duration-300 text-center block"
                  >
                    📋 View Full Menu
                  </a>
                </div>
              </div>
            </div>
            
            {/* Popular Items Preview */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Popular Items</h3>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">Monaghan's Famous Burger</h4>
                      <p className="text-gray-600 text-sm">Juicy beef patty with lettuce, tomato, onion, and our special sauce</p>
                    </div>
                    <span className="text-green-600 font-bold">$12.99</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">Fish & Chips</h4>
                      <p className="text-gray-600 text-sm">Beer-battered cod with crispy fries and tartar sauce</p>
                    </div>
                    <span className="text-green-600 font-bold">$14.99</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">Breakfast Biscuit</h4>
                      <p className="text-gray-600 text-sm">Flaky biscuit with eggs, bacon, and cheese</p>
                    </div>
                    <span className="text-green-600 font-bold">$8.99</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                Monaghan's Bar & Grill has been Denver's neighborhood gathering place for over two decades. 
                What started as a simple bar has grown into a community hub where friends become family.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We're where Denver comes to eat, drink, and play. 
                From our famous burgers to our weekly poker nights, every dish and every event is crafted 
                with the community in mind.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Family-owned and operated</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Fresh ingredients, made to order</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Community events and entertainment</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  src="/pics/monaghans-billiard-room.jpg" 
                  alt="Monaghan's Billiard Room"
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
                <img 
                  src="/pics/monaghans-patio.jpg" 
                  alt="Monaghan's Patio"
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="space-y-4 mt-8">
                <img 
                  src="/pics/monaghans-kareoke.jpg" 
                  alt="Monaghan's Karaoke Night"
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
                <img 
                  src="/pics/monaghans-billiards.jpg" 
                  alt="Monaghan's Pool Tables"
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Google Reviews CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Love Monaghan's?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Help others discover our amazing food and atmosphere by leaving a review
          </p>
          
          <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex text-yellow-400 text-2xl">
                ★★★★★
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-700">4.8 stars</span>
            </div>
            <p className="text-gray-600 mb-6">
              Based on reviews from our amazing customers
            </p>
            <a 
              href="https://www.google.com/search?q=Monaghan%27s+Bar+%26+Grill+Denver+CO+reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Leave a Google Review
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Great Atmosphere</h3>
              <p className="text-sm text-gray-600">Pool tables, karaoke, and friendly staff</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Amazing Food</h3>
              <p className="text-sm text-gray-600">Fresh ingredients, made to order</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Fun Events</h3>
              <p className="text-sm text-gray-600">Poker nights, trivia, and live music</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Visit Us</h2>
            <p className="text-xl text-gray-600">Come experience the Monaghan's difference</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Location & Contact */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Location & Contact</h3>
              
              <div className="space-y-6 flex-1">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Address</h4>
                    <a 
                      href="https://www.google.com/maps/dir/?api=1&destination=3889+S+King+St,+Denver,+CO+80236"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-medium text-sm hover:underline"
                    >
                      {siteData?.address || "3889 S King St, Denver, CO 80236"}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Phone</h4>
                    <a href={`tel:${siteData?.phone?.replace(/\D/g, '') || '3035550123'}`} className="text-green-600 hover:text-green-700 font-medium text-sm">
                      {siteData?.phone || "(303) 555-0123"}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Email</h4>
                    <a href={`mailto:${siteData?.email || 'info@monaghans.com'}`} className="text-green-600 hover:text-green-700 text-sm">
                      {siteData?.email || "info@monaghans.com"}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <a 
                  href={`tel:${siteData?.phone?.replace(/\D/g, '') || '3035550123'}`}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center block text-sm"
                >
                  📞 Call Now
                </a>
              </div>
            </div>
            
            {/* Hours */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Hours</h3>
              <div className="space-y-2">
                {businessHours.length > 0 ? (
                  <>
                    {formatBusinessHours(businessHours).map((hourText, index) => (
                      <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-700 text-sm">{hourText.split(':')[0]}</span>
                        <span className="text-gray-600 font-medium text-sm">{hourText.split(':').slice(1).join(':').trim()}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-700 text-sm">Monday - Thursday</span>
                      <span className="text-gray-600 font-medium text-sm">10:00 AM - 2:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-700 text-sm">Friday</span>
                      <span className="text-gray-600 font-medium text-sm">10:00 AM - 2:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-700 text-sm">Saturday</span>
                      <span className="text-gray-600 font-medium text-sm">8:00 AM - 2:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-700 text-sm">Sunday</span>
                      <span className="text-gray-600 font-medium text-sm">8:00 AM - 2:00 AM</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">Call ahead if it's late to confirm we're still open!</p>
            </div>
            
            {/* Map */}
            <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-2 xl:col-span-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Find Us</h3>
              <div className="mb-4 flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=3889+S+King+St,+Denver,+CO+80236"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium text-sm hover:underline"
                >
                  {siteData?.address || "3889 S King St, Denver, CO 80236"}
                </a>
              </div>
              <div className="h-64 md:h-80 xl:h-64 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3067.5!2d-104.9!3d39.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x876c7c8c8c8c8c8c%3A0x8c8c8c8c8c8c8c8c!2s3889%20S%20King%20St%2C%20Denver%2C%20CO%2080236!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Monaghan's Bar & Grill Location"
                ></iframe>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </div>
    </>
  );
}