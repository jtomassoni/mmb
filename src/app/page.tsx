import Image from "next/image";
import SpecialsMini from '../components/specials-mini';

export default function Home() {
  // JSON-LD structured data for restaurant
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Monaghan's Bar & Grill",
    "description": "Where Denver comes to eat, drink, and play",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1234 Main Street",
      "addressLocality": "Denver",
      "addressRegion": "CO",
      "postalCode": "80202"
    },
    "telephone": "(303) 555-0123",
    "email": "info@monaghansbargrill.com",
    "url": "https://monaghansbargrill.com",
    "servesCuisine": "American",
    "priceRange": "$$",
    "openingHours": [
      "Mo-Th 11:00-02:00",
      "Fr-Sa 11:00-03:00", 
      "Su 12:00-02:00"
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
      {/* Prefetch critical routes for better performance */}
      <link rel="prefetch" href="/menu" />
      <link rel="prefetch" href="/specials" />
      <link rel="prefetch" href="/events" />
      <link rel="prefetch" href="/reviews" />
      <link rel="prefetch" href="/about" />
      <link rel="prefetch" href="/visit" />
      
      {/* Preload critical images */}
      <link rel="preload" as="image" href="/pics/hero.png" />
      <link rel="preload" as="image" href="/pics/monaghans-billiards.jpg" />
      <link rel="preload" as="image" href="/pics/monaghans-fish-n-chips.jpg" />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <Image
          src="/pics/hero.png"
          alt="Monaghan's Bar & Grill - Interior view showing bar and dining area"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Monaghan&apos;s Bar & Grill</h1>
            <p className="text-xl">Where Denver comes to eat, drink, and play</p>
          </div>
        </div>
      </section>

      {/* Today Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Today at Monaghan&apos;s</h2>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">We&apos;re Open!</p>
              <p>Monday: 11:00 AM - 2:00 AM</p>
            </div>
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <p className="font-semibold">Tonight&apos;s Event: Poker Night</p>
              <p>Monday 7:00 PM - Join us for Texas Hold&apos;em!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Makes Us Special</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍺</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Great Drinks</h2>
              <p className="text-gray-600">Full bar with local craft beers and signature cocktails</p>
            </div>
            <div className="text-center">
              <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎱</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Pool Tables</h2>
              <p className="text-gray-600">Multiple pool tables and games for entertainment</p>
            </div>
            <div className="text-center">
              <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Karaoke</h2>
              <p className="text-gray-600">Weekly karaoke nights and live entertainment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Mini Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">This Week&apos;s Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Monday - Poker Night</h2>
              <p className="text-gray-600 mb-2">7:00 PM</p>
              <p className="text-sm text-gray-500">Texas Hold&apos;em tournament with prizes</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Thursday - Bingo Night</h2>
              <p className="text-gray-600 mb-2">7:00 PM</p>
              <p className="text-sm text-gray-500">Traditional bingo with cash prizes</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Sunday - Broncos Potluck</h2>
              <p className="text-gray-600 mb-2">Game Time</p>
              <p className="text-sm text-gray-500">Watch the Broncos with potluck dinner</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="/events" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
              View All Events
            </a>
          </div>
        </div>
      </section>

      {/* Specials Mini Section */}
      <SpecialsMini />

      {/* Reviews Mini Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ★★★★★
                </div>
                <span className="ml-2 text-sm text-gray-600">5.0 stars</span>
              </div>
              <p className="text-gray-700 mb-4">&quot;Best bar in Denver! Great food, friendly staff, and the pool tables are always in perfect condition.&quot;</p>
              <p className="text-sm text-gray-500">- Sarah M.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ★★★★★
                </div>
                <span className="ml-2 text-sm text-gray-600">5.0 stars</span>
              </div>
              <p className="text-gray-700 mb-4">&quot;Love the poker nights! The atmosphere is perfect and the drinks are reasonably priced.&quot;</p>
              <p className="text-sm text-gray-500">- Mike D.</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="/reviews" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
              Read More Reviews
            </a>
          </div>
        </div>
      </section>

      {/* Gallery Mini Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">See Our Space</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src="/pics/monaghans-billiards.jpg"
                alt="Pool tables at Monaghan's Bar & Grill"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src="/pics/monaghans-billiard-room.jpg"
                alt="Bar area with pool tables and seating"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src="/pics/monaghans-breakfast-biscut.jpg"
                alt="Dining room with tables and comfortable seating"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src="/pics/monaghans-patio.jpg"
                alt="Outdoor patio seating area"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="/gallery" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
              View Full Gallery
            </a>
          </div>
        </div>
      </section>

      {/* Visit Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Visit Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-semibold mb-4">Location & Hours</h2>
              <div className="space-y-2 text-gray-600">
                <p>1234 Main Street</p>
                <p>Denver, CO 80202</p>
                <p>Phone: (303) 555-0123</p>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Hours:</h3>
                  <p>Monday - Thursday: 11:00 AM - 2:00 AM</p>
                  <p>Friday - Saturday: 11:00 AM - 3:00 AM</p>
                  <p>Sunday: 12:00 PM - 2:00 AM</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Get Directions</h2>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <span className="text-gray-600">Map placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}