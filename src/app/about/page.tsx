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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6">
                Denver's Oldest Bar
              </h1>
              <p className="text-xl text-amber-100 max-w-3xl mx-auto">
                Since 1893, Monaghan's has been the heart of Denver's historic district, 
                serving generations with authentic Irish hospitality and unwavering community spirit.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                A Legacy of Community
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  When Monaghan's first opened its doors in 1893, Denver was still a frontier town 
                  finding its way. The bar quickly became more than just a place to drink—it became 
                  a gathering place for miners, railroad workers, and families building the city we 
                  know today.
                </p>
                <p>
                  Through the Great Depression, two World Wars, and countless changes to the city 
                  around us, Monaghan's has remained a constant. Our walls have heard the stories 
                  of generations, from the miners who struck gold to the tech workers who call 
                  Denver home today.
                </p>
                <p>
                  Today, under minority woman ownership, we continue that tradition of welcoming 
                  everyone who walks through our doors. We're not just preserving history—we're 
                  writing the next chapter of Denver's story, one pint at a time.
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

          {/* Heritage Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Placeholder for current photo */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">🏛️</div>
                  <p className="text-lg font-medium">Current Interior</p>
                  <p className="text-sm">Preserving the authentic atmosphere</p>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Honoring Our Heritage
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  As Denver's oldest continuously operating bar, we take our responsibility 
                  to preserve history seriously. Every detail—from the original mahogany bar 
                  to the vintage fixtures—tells a story of the city's evolution.
                </p>
                <p>
                  Our commitment goes beyond maintaining the building. We honor the spirit 
                  of those who came before us by creating a space where everyone feels welcome, 
                  regardless of background or circumstance. This is the Monaghan's way.
                </p>
                <p>
                  Under minority woman leadership, we're proud to continue this legacy while 
                  ensuring Monaghan's remains a beacon of inclusivity and community in Denver's 
                  historic district.
                </p>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="bg-white rounded-2xl shadow-lg p-12 mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">See Our Space</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Take a look at our bar, pool tables, patio, and delicious food</p>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/gallery" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-300">
                View Full Gallery
              </a>
              <a 
                href="https://www.facebook.com/people/Monaghans-Bar-and-Grill/100063611261508/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Follow Us on Facebook
              </a>
            </div>
          </div>

          {/* Our Values */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-20">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Historic Legacy</h3>
                <p className="text-gray-600 text-sm">
                  Denver's oldest bar, preserving over 130 years of history and tradition
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Community Focus</h3>
                <p className="text-gray-600 text-sm">
                  A gathering place for all Denverites, from miners to modern professionals
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Inclusive Ownership</h3>
                <p className="text-gray-600 text-sm">
                  Minority woman-owned, ensuring everyone feels welcome and represented
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-6">
              Experience History in Person
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Step into Denver's living history. Whether you're a longtime local or visiting 
              for the first time, Monaghan's welcomes you to be part of our story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/menu" 
                className="bg-white text-amber-900 px-8 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
              >
                View Our Menu
              </a>
              <a 
                href="/events" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-amber-900 transition-colors"
              >
                See What's Happening
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}