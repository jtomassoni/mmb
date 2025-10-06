import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coming Soon - Monaghan\'s Bar & Grill',
  description: 'We\'re building something amazing. Stay tuned!',
}

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
            Monaghan's
          </h1>
          <h2 className="text-2xl md:text-3xl text-blue-200 font-light">
            Bar & Grill
          </h2>
        </div>

        {/* Coming Soon Message */}
        <div className="mb-12">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Something Amazing is Coming
          </h3>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            We're crafting an incredible digital experience for our customers. 
            Our new website will feature our full menu, events calendar, and much more.
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <h4 className="text-2xl font-semibold text-white mb-6">Visit Us Today</h4>
          <div className="grid md:grid-cols-3 gap-6 text-blue-100">
            <div>
              <div className="text-2xl mb-2">📍</div>
              <p className="font-medium">123 Main Street</p>
              <p>Anytown, USA</p>
            </div>
            <div>
              <div className="text-2xl mb-2">📞</div>
              <p className="font-medium">(555) 123-4567</p>
              <p>Call for reservations</p>
            </div>
            <div>
              <div className="text-2xl mb-2">✉️</div>
              <p className="font-medium">info@monaghans.com</p>
              <p>Get in touch</p>
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <h4 className="text-xl font-semibold text-white mb-4">Hours</h4>
          <div className="grid md:grid-cols-2 gap-4 text-blue-100">
            <div>
              <p><span className="font-medium">Monday - Thursday:</span> 11:00 AM - 10:00 PM</p>
              <p><span className="font-medium">Friday - Saturday:</span> 11:00 AM - 11:00 PM</p>
            </div>
            <div>
              <p><span className="font-medium">Sunday:</span> 12:00 PM - 9:00 PM</p>
              <p className="text-sm text-blue-200 mt-2">Kitchen closes 30 minutes before closing</p>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6">
          <a href="#" className="text-blue-200 hover:text-white transition-colors">
            <span className="sr-only">Facebook</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" className="text-blue-200 hover:text-white transition-colors">
            <span className="sr-only">Instagram</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243s.122-.928.49-1.243c.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.368.315.49.753.49 1.243s-.122.928-.49 1.243c-.369.315-.807.49-1.297.49z"/>
            </svg>
          </a>
          <a href="#" className="text-blue-200 hover:text-white transition-colors">
            <span className="sr-only">Twitter</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 text-blue-200 text-sm">
          <p>&copy; 2025 Monaghan's Bar & Grill. All rights reserved.</p>
          <p className="mt-2">Website coming soon...</p>
        </div>
      </div>
    </div>
  )
}
