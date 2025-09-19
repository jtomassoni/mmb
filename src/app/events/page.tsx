export default function EventsPage() {
  const events = [
    {
      title: "Poker Night",
      day: "Monday",
      time: "7:00 PM",
      description: "Texas Hold'em tournament with prizes for top players",
      recurring: true
    },
    {
      title: "Bingo Night", 
      day: "Thursday",
      time: "7:00 PM",
      description: "Traditional bingo with cash prizes and fun for all ages",
      recurring: true
    },
    {
      title: "Broncos Potluck",
      day: "Sunday",
      time: "Game Time",
      description: "Watch the Broncos with potluck dinner - bring a dish to share!",
      recurring: true
    }
  ];

  // JSON-LD structured data for events
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Restaurant Events",
    "description": "Weekly events at Monaghan's Bar & Grill including poker, bingo, and Broncos games",
    "organizer": {
      "@type": "Organization",
      "name": "Monaghan's Bar & Grill",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1234 Main Street",
        "addressLocality": "Denver",
        "addressRegion": "CO",
        "postalCode": "80202"
      },
      "telephone": "(303) 555-0123"
    },
    "eventSchedule": events.map(event => ({
      "@type": "Schedule",
      "name": event.title,
      "description": event.description,
      "recurrenceRule": event.recurring ? `FREQ=WEEKLY;BYDAY=${event.day.toUpperCase().substring(0, 2)}` : undefined,
      "startTime": event.time
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Events & Entertainment</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2 text-red-600">{event.title}</h3>
                <p className="text-lg text-gray-600 mb-2">{event.day}</p>
                <p className="text-lg font-medium text-gray-800 mb-4">{event.time}</p>
                <p className="text-gray-600 mb-4">{event.description}</p>
                {event.recurring && (
                  <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    Weekly Event
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Private Events</h2>
          <p className="text-gray-600 mb-6">
            Host your next party, corporate event, or celebration at Monaghan's!
          </p>
          <a 
            href="tel:3035550123" 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-block"
          >
            Call (303) 555-0123 to Book
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
