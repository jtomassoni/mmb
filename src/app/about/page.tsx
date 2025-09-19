export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">About Monaghan's</h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Monaghan's Bar & Grill has been a cornerstone of the Denver community for over two decades. 
              Founded by the Monaghan family, we've created a space where neighbors become friends and 
              strangers become family.
            </p>
            <p className="text-gray-700 mb-4">
              What started as a small neighborhood bar has grown into a beloved gathering place known 
              for its warm atmosphere, delicious food, and friendly service. We're proud to be part 
              of Denver's vibrant bar scene while maintaining our local, community-focused roots.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Food & Drinks</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Full bar with craft beers and cocktails</li>
                  <li>• Fresh, made-to-order meals</li>
                  <li>• Daily specials and rotating menu</li>
                  <li>• Late-night dining options</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Entertainment</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Multiple pool tables</li>
                  <li>• Weekly poker tournaments</li>
                  <li>• Bingo nights</li>
                  <li>• Karaoke and live music</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Our Values</h2>
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

          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Visit Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Location</h3>
                <p className="text-gray-700">
                  1234 Main Street<br />
                  Denver, CO 80202<br />
                  Phone: (303) 555-0123
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Hours</h3>
                <p className="text-gray-700">
                  Monday - Thursday: 11:00 AM - 2:00 AM<br />
                  Friday - Saturday: 11:00 AM - 3:00 AM<br />
                  Sunday: 12:00 PM - 2:00 AM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
