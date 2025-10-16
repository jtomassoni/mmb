export default function VisitPage() {
  return (
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
              Since 1893, Monaghan's has been Denver's favorite spot for good drinks, 
              great food, and even better times. Come hang out, watch the game, 
              or belt out your favorite song at karaoke night!
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
                A Place Where Everyone Belongs
              </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
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

        {/* Heritage Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
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
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What Makes Us Special
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
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

        {/* Values Section */}
        <div className="text-center bg-white rounded-2xl shadow-lg p-12 mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            What Makes Us Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Historic Authenticity</h3>
              <p className="text-gray-600">
                Denver's oldest bar, serving Denver for 130+ years
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community First</h3>
              <p className="text-gray-600">
                A gathering place for all Denverites, from miners to modern professionals
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">👩‍💼</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Inclusive Leadership</h3>
              <p className="text-gray-600">
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
              href="/whats-happening" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-amber-900 transition-colors"
            >
              See What's Happening
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
