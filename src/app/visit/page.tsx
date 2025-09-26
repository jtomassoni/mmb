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
                Denver's oldest bar, preserving 130+ years of history and tradition
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
