import Image from "next/image";
import SpecialsMini from '../components/specials-mini';
import { DynamicHero } from '../components/dynamic-hero';
import { getImageAlt } from '../lib/image-alt';
import { getRandomReviews } from '../lib/reviews-data';
import { headers } from 'next/headers';
import { isPlatformHost } from '../lib/site';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Check if this is the platform host
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  if (isPlatformHost(host)) {
    // This is the platform host, redirect to login
    redirect('/login');
  }
  // Get random reviews for this page load
  const randomReviews = getRandomReviews(2)
  
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
    "email": "Monaghanv061586@gmail.com",
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
      
      {/* Preload critical images */}
      <link rel="preload" as="image" href="/pics/hero.png" />
      <link rel="preload" as="image" href="/pics/monaghans-billiards.jpg" />
      <link rel="preload" as="image" href="/pics/monaghans-fish-n-chips.jpg" />
      <div className="min-h-screen bg-gray-50">
      {/* Dynamic Hero Section */}
      <DynamicHero />

      {/* Upcoming Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Upcoming This Week</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Events */}
            <div className="flex flex-col">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Events</h3>
              <div className="flex-1 flex flex-col">
                <div className="grid grid-rows-4 gap-6 flex-1">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">Monday - Poker Night</h4>
                        <span className="text-sm text-gray-500 bg-red-100 px-2 py-1 rounded">7:00 PM</span>
                      </div>
                      <p className="text-gray-600">Chimichangas special + Weekly poker tournament</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">Tuesday - Taco Tuesday</h4>
                        <span className="text-sm text-gray-500 bg-red-100 px-2 py-1 rounded">All Day</span>
                      </div>
                      <p className="text-gray-600">Beef tacos $1.50, chicken/carnitas $2, fish $3 + Mexican beer specials</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">Thursday - Thirsty Thursday</h4>
                        <span className="text-sm text-gray-500 bg-red-100 px-2 py-1 rounded">All Day</span>
                      </div>
                      <p className="text-gray-600">$1 off tequila + Philly cheesesteak + Music Bingo with cash prizes</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">Weekend Karaoke</h4>
                        <span className="text-sm text-gray-500 bg-red-100 px-2 py-1 rounded">Fri-Sat</span>
                      </div>
                      <p className="text-gray-600">Sing your heart out with our karaoke setup</p>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <a href="/whats-happening" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-300">
                    View All Events & Specials
                  </a>
                </div>
              </div>
            </div>

            {/* Food & Drink Specials */}
            <div className="flex flex-col">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Food & Drink Specials</h3>
              <div className="flex-1 flex flex-col">
                <div className="grid grid-rows-3 gap-6 flex-1">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Happy Hour</h4>
                      <p className="text-gray-600 mb-2">10am-12pm & 3pm-7pm daily</p>
                      <p className="text-sm text-gray-500">BOGO first round of wine, wells, or drafts</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Daily Food Specials</h4>
                      <p className="text-gray-600 mb-2">Monday: Chimichangas</p>
                      <p className="text-gray-600 mb-2">Tuesday: Taco Tuesday</p>
                      <p className="text-gray-600 mb-2">Wednesday: Southwest Eggrolls</p>
                      <p className="text-gray-600">Thursday: Philly Cheesesteak</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Drink Specials</h4>
                      <p className="text-gray-600 mb-2">Wednesday: $1 off all whiskey</p>
                      <p className="text-gray-600">Thursday: $1 off all tequila</p>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <a href="/whats-happening" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-300">
                    View All Events & Specials
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {randomReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: review.rating }, (_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{review.rating}.0 stars</span>
                </div>
                <p className="text-gray-700 mb-4">&quot;{review.text}&quot;</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">- {review.author}</p>
                  <p className="text-xs text-gray-400">{review.date}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a 
              href="https://www.google.com/search?q=Monaghan%27s+Bar+%26+Grill+Denver+CO+reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-300"
            >
              Leave a Google Review
            </a>
          </div>
        </div>
      </section>

      {/* Gallery Carousel Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See Our Space</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Take a look at our bar, pool tables, patio, and delicious food</p>
          </div>
          
          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
      </section>

      {/* Location Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Location & Hours</h2>
              <div className="space-y-2 text-gray-600">
                <p>3889 S King St</p>
                <p>Denver, CO 80236</p>
                <p>Phone: <a href="tel:3035550123" className="text-green-600 hover:text-green-700">(303) 555-0123</a></p>
                
                {/* Social Media */}
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-gray-900">Follow Us</h3>
                  <a 
                    href="https://www.facebook.com/people/Monaghans-Bar-and-Grill/100063611261508/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-gray-900">Hours:</h3>
                  <p>Monday - Thursday: 10:00 AM - 2:00 AM</p>
                  <p>Friday: 10:00 AM - 2:00 AM</p>
                  <p>Saturday: 8:00 AM - 2:00 AM</p>
                  <p>Sunday: 8:00 AM - 2:00 AM</p>
                  <p className="text-sm text-gray-500 mt-2">Call ahead if it's late to confirm we're still open!</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Get Directions</h2>
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
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=3889+S+King+St,+Denver,+CO+80236"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}