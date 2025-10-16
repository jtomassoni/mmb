import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Our Story | Monaghan\'s Bar & Grill - Denver\'s Historic Legacy',
  description: 'Discover the rich history of Monaghan\'s Bar & Grill, Denver\'s oldest minority woman-owned bar. A story of community, resilience, and tradition since 1893.',
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
            "description": "Denver's oldest minority woman-owned bar, serving the community since 1893",
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
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-amber-900 to-amber-800 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                Denver's Oldest Bar
              </h1>
              <p className="text-lg text-amber-100 max-w-2xl mx-auto">
                Since 1893, Monaghan's has been Denver's favorite spot for good drinks, 
                great food, and even better times. Come hang out, watch the game, 
                or belt out your favorite song at karaoke night!
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                A Place Where Everyone Belongs
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Sure, we've been around since 1893, but that's not why people keep coming back. 
                  Monaghan's is where you come to unwind after work, cheer on your team, 
                  or show off your singing skills on karaoke night.
                </p>
                <p>
                  Whether you're here for our famous fish and chips, a cold beer during happy hour, 
                  or to dominate trivia night, you'll find exactly what you're looking for. 
                  Our pool tables are always ready, our kitchen stays open late, 
                  and our bartenders know how to make your drink just right.
                </p>
                <p>
                  Under minority woman ownership, we're proud to be Denver's oldest bar 
                  while staying true to what makes a great neighborhood spot: 
                  good food, cold drinks, and great company.
                </p>
              </div>
            </div>
            
            {/* Placeholder for historic photo */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">📸</div>
                  <p className="text-lg font-medium">Historic Photo</p>
                  <p className="text-sm">Monaghan's in the early 1900s</p>
                </div>
              </div>
            </div>
          </div>

          {/* What We Offer Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Placeholder for current photo */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">🏛️</div>
                  <p className="text-lg font-medium">Current Interior</p>
                  <p className="text-sm">Pool tables, bar, and dining area</p>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Makes Us Special
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  We're not trying to be fancy - we're trying to be your favorite bar. 
                  That means great food that hits the spot, drinks that don't break the bank, 
                  and entertainment that keeps you coming back.
                </p>
                <p>
                  Our pool tables are always busy, our karaoke nights are legendary, 
                  and our trivia nights bring out the competitive spirit in everyone. 
                  Plus, we've got all the games on TV and a patio that's perfect for 
                  those Denver summer nights.
                </p>
                <p>
                  The fact that we've been here since 1893? That's just proof we know 
                  what we're doing. We've seen Denver change, but we've stayed true 
                  to what makes a great neighborhood bar: good times and good people.
                </p>
              </div>
            </div>
          </div>

          {/* Private Events & Buyouts Section */}
          <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 md:p-12 border-2 border-amber-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Private Events & Venue Buyouts
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Host your next event at Denver's historic bar. Perfect for corporate gatherings, private parties, celebrations, and more.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-100">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Up to 200 Guests</h3>
                <p className="text-gray-600 text-sm">Spacious venue perfect for large gatherings and celebrations</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-100">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Full Kitchen</h3>
                <p className="text-gray-600 text-sm">Complete catering capabilities with custom menus available</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-100">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Full Liquor License</h3>
                <p className="text-gray-600 text-sm">Complete bar service with beer, wine, and spirits</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-100">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Multiple TVs & AV</h3>
                <p className="text-gray-600 text-sm">Perfect for presentations, watch parties, and entertainment</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-200">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Perfect For:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Corporate Events
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Birthday Parties
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Watch Parties
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Fundraisers
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Reunions
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Rehearsal Dinners
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Holiday Parties
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Team Building
                </div>
              </div>
            </div>
            
            {/* See Our Space Gallery */}
            <div className="mt-12 bg-white rounded-lg p-6 border border-amber-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">See Our Space</h3>
              <p className="text-gray-600 mb-6 text-center">Take a look at our bar, pool tables, patio, and delicious food</p>
            
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="relative h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <Image
                  src="/pics/monaghans-billiards.jpg"
                  alt="Pool tables at Monaghan's Bar & Grill"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <Image
                  src="/pics/monaghans-billiard-room.jpg"
                  alt="Pool room at Monaghan's Bar & Grill"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <Image
                  src="/pics/monaghans-breakfast-biscut.jpg"
                  alt="Breakfast biscuit at Monaghan's Bar & Grill"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <Image
                  src="/pics/monaghans-patio.jpg"
                  alt="Patio seating at Monaghan's Bar & Grill"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <Image
                  src="/pics/monaghans-fish-n-chips.jpg"
                  alt="Fish and chips at Monaghan's Bar & Grill"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <Image
                  src="/pics/monaghans-quesadilla.jpg"
                  alt="Quesadilla at Monaghan's Bar & Grill"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <Image
                  src="/pics/monaghans-taco-platter.jpg"
                  alt="Taco platter at Monaghan's Bar & Grill"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <Image
                  src="/pics/monaghans-kareoke.jpg"
                  alt="Karaoke night at Monaghan's Bar & Grill"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </div>
            
            {/* Gallery Actions */}
            <div className="flex justify-center">
              <a href="/gallery" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-300">
                View Full Gallery
              </a>
            </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-700 mb-4 font-semibold">Ready to book your event?</p>
              <a 
                href="tel:+13035550123" 
                className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                Call Us: (303) 555-0123
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}