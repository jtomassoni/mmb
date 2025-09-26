import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visit Monaghan\'s Bar & Grill | Location, Hours & Contact',
  description: 'Visit Monaghan\'s Bar & Grill at 3889 S King St, Denver. Find our hours, contact info, directions, and parking details.',
}

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "Monaghan's Bar & Grill",
            "description": "Minority woman-owned neighborhood bar & grill in Denver",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "3889 S King St",
              "addressLocality": "Denver",
              "addressRegion": "CO",
              "postalCode": "80236"
            },
            "telephone": "(303) 555-0123",
            "email": "Monaghanv061586@gmail.com",
            "url": "https://monaghansbargrill.com",
            "servesCuisine": "American",
            "priceRange": "$$",
            "openingHours": [
              "Mo-Th 10:00-02:00",
              "Fr 10:00-02:00", 
              "Sa 08:00-02:00",
              "Su 08:00-02:00"
            ]
          })
        }}
      />
      
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Visit Monaghan's Bar & Grill</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Come visit us at our Denver location. We're easy to find and always happy to see you!
            </p>
          </div>

          {/* What We Offer */}
          <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Food & Drinks</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Daily happy hour: 10am-12pm & 3pm-7pm</li>
                  <li>• BOGO first round of wine, wells, or drafts</li>
                  <li>• Daily specials: Chimichangas, tacos, whiskey deals</li>
                  <li>• Mexican beer specials (Dos Equis, Modelo, Pacifico, Corona)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Entertainment</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Music Bingo with cash prizes</li>
                  <li>• Weekly poker night (Mondays)</li>
                  <li>• NFL watch parties & Thursday Night Football</li>
                  <li>• Multiple pool tables and games</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Community</h3>
                <p className="text-gray-600 text-sm">Supporting our local community and creating lasting relationships</p>
              </div>
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Quality</h3>
                <p className="text-gray-600 text-sm">Consistent quality in food, service, and atmosphere</p>
              </div>
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Fun</h3>
                <p className="text-gray-600 text-sm">Creating memorable experiences for all our guests</p>
              </div>
            </div>
          </div>

          {/* Visit Us Section */}
          <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Visit Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Location & Contact</h3>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p>3889 S King St<br />Denver, CO 80236</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p><a href="tel:3035550123" className="text-green-600 hover:text-green-700">(303) 555-0123</a></p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p>Monaghanv061586@gmail.com</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Hours</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Monday - Thursday</span>
                    <span className="font-medium">10:00 AM - 2:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Friday</span>
                    <span className="font-medium">10:00 AM - 2:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">8:00 AM - 2:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium">8:00 AM - 2:00 AM</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Hours are flexible and subject to change. We generally stay open until major sports games are over. <strong>Call ahead if it's late to confirm we're still open!</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Find Us</h2>
            <div className="h-64 rounded-lg overflow-hidden mb-4">
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
            <div className="text-center">
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=3889+S+King+St,+Denver,+CO+80236"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-block"
              >
                Get Directions
              </a>
            </div>
          </div>

          {/* Directions & Parking */}
          <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Directions & Parking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Getting Here</h3>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900">From Downtown Denver</h4>
                    <p className="text-sm">Take I-25 South to Lowell Blvd exit, head west on Lowell, restaurant is on the right behind Mountain Crust Event Center</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">From I-25</h4>
                    <p className="text-sm">Exit at Lowell Blvd, head west for about 1 mile, look for Mountain Crust Event Center on the right</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Public Transit</h4>
                    <p className="text-sm">RTD Bus route 36 stops on Lowell Blvd nearby</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Parking & Policies</h3>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900">Parking</h4>
                    <p className="text-sm">Free street parking available. Motorcycle parking is available in front of the building.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Age Policy</h4>
                    <p className="text-sm">All ages welcome. Note: We're primarily a bar atmosphere in the evenings - families with children may prefer earlier visits.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Atmosphere</h4>
                    <p className="text-sm">Casual, friendly neighborhood bar with a warm, welcoming vibe. Perfect for groups, dates, or solo visits.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}