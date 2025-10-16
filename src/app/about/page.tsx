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

          {/* Gallery Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">See Our Space</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Take a look at our bar, pool tables, patio, and delicious food</p>
            </div>
            
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
        </div>
      </div>
    </>
  );
}