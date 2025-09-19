export default function VisitPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Visit Monaghan's</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-white p-8 rounded-lg shadow mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-red-600">Location & Contact</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-gray-700">
                    1234 Main Street<br />
                    Denver, CO 80202
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-gray-700">(303) 555-0123</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-gray-700">info@monaghansbargrill.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-red-600">Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monday - Thursday</span>
                  <span className="font-medium">11:00 AM - 2:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday - Saturday</span>
                  <span className="font-medium">11:00 AM - 3:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium">12:00 PM - 2:00 AM</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                *Hours may vary on holidays. Call ahead to confirm.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4 text-red-600">Parking & Accessibility</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Parking</h3>
                  <p className="text-gray-700">
                    Free street parking available. Valet parking available on weekends.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Accessibility</h3>
                  <p className="text-gray-700">
                    Wheelchair accessible entrance and restrooms. Accessible seating available.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white p-8 rounded-lg shadow mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-red-600">Get Directions</h2>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-600">Interactive Map</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>From Downtown Denver:</strong> Head north on Main Street for 2 miles</p>
                <p><strong>From I-25:</strong> Exit at Main Street, head east for 1 mile</p>
                <p><strong>Public Transit:</strong> Bus routes 15, 20, and 30 stop nearby</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4 text-red-600">What to Expect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Atmosphere</h3>
                  <p className="text-gray-700">
                    Casual, friendly neighborhood bar with a warm, welcoming vibe. 
                    Perfect for groups, dates, or solo visits.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Dress Code</h3>
                  <p className="text-gray-700">
                    Casual attire welcome. No dress code - come as you are!
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Age Policy</h3>
                  <p className="text-gray-700">
                    All ages welcome until 9:00 PM. 21+ after 9:00 PM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Visit?</h2>
          <p className="text-gray-600 mb-6">
            We can't wait to welcome you to Monaghan's!
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="tel:3035550123" 
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Call Us
            </a>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
