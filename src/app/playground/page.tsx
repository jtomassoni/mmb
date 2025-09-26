import { Hero } from '../../components/Hero'
import { DailySnapshot } from '../../components/DailySnapshot'

// Sample data matching the requirements
const sampleData = {
  isOpen: true,
  openHeadline: "We're Open!",
  foodSpecial: { 
    title: "Philly Cheesesteak", 
    desc: "Classic Philly with peppers & onions", 
    price: "$12", 
    imageUrl: "/pics/monaghans-philly-cheesesteak.jpg" 
  },
  drinkSpecial: { 
    title: "Thirsty Thursday", 
    desc: "$1 off all tequila drinks", 
    icon: "🥃" 
  },
  happyHour: { 
    windows: ["10am–12pm", "3pm–7pm daily"] 
  },
  eventsToday: [
    { title: "NFL Watch Party", type: "Sport" as const, time: "6:15 PM" },
    { title: "Music Bingo", type: "Entertainment" as const, time: "8:00 PM" }
  ],
  week: {
    Mon: {
      foodSpecial: { title: "Chimichangas Special", desc: "Crispy chimichangas with rice and beans", price: "$10" },
      events: [{ title: "Poker Night", type: "Entertainment" as const, time: "7:00 PM" }]
    },
    Tue: {
      foodSpecial: { title: "Taco Tuesday", desc: "Beef $1.50, chicken/carnitas $2, fish $3" },
      drinkSpecial: { title: "Mexican Beer Specials", desc: "Dos Equis, Modelo, Pacifico, Corona $4" }
    },
    Wed: {
      foodSpecial: { title: "Southwest Eggrolls", desc: "Crispy eggrolls with rice and beans", price: "$9" },
      drinkSpecial: { title: "Whiskey Wednesday", desc: "$1 off all whiskey drinks" }
    },
    Thu: {
      foodSpecial: { title: "Philly Cheesesteak", desc: "Classic Philly with peppers & onions", price: "$12" },
      drinkSpecial: { title: "Thirsty Thursday", desc: "$1 off all tequila drinks" },
      events: [{ title: "Music Bingo", type: "Entertainment" as const, time: "8:00 PM" }]
    },
    Fri: {
      foodSpecial: { title: "Friday Night Specials", desc: "Check our menu" },
      events: [{ title: "Weekend Karaoke", type: "Entertainment" as const, time: "9:00 PM" }]
    },
    Sat: {
      foodSpecial: { title: "Saturday Specials", desc: "Check our menu" },
      events: [{ title: "Weekend Karaoke", type: "Entertainment" as const, time: "9:00 PM" }]
    },
    Sun: {
      foodSpecial: { title: "Sunday Funday", desc: "Open until sports games end" },
      drinkSpecial: { title: "Mexican Beer Specials", desc: "Dos Equis, Modelo, Pacifico, Corona $4" }
    }
  },
  cta: { label: "See Full Calendar", href: "/whats-happening" }
}

export default function Playground() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Component */}
      <Hero
        title="Monaghan's Bar & Grill"
        subhead="Where Denver comes to eat, drink, and play. A neighborhood bar & grill with daily specials, happy hour deals, and weekly event nights."
        proof={["Open Daily", "Full Bar", "Live Entertainment", "Pool Tables"]}
        primaryCta={{ label: "View Menu", href: "/menu" }}
        secondaryCta={{ label: "See Events", href: "/whats-happening" }}
        media={{
          type: "image",
          src: "/pics/monaghans-beer-and-shot.jpg",
          alt: "Monaghan's Bar & Grill interior showing bar and seating area"
        }}
        isOpen={sampleData.isOpen}
        openHeadline={sampleData.openHeadline}
      />

      {/* Sticky Marquee */}
      <DailySnapshot variant="stickyMarquee" data={sampleData} />

      {/* Hero Special Variant */}
      <DailySnapshot variant="heroSpecial" data={sampleData} />

      {/* Today Timeline Variant */}
      <DailySnapshot variant="todayTimeline" data={sampleData} />

      {/* Tabbed Week Variant */}
      <DailySnapshot variant="tabbedWeek" data={sampleData} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "Monaghan's Bar & Grill",
            "description": "Where Denver comes to eat, drink, and play",
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
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "10:00",
                "closes": "02:00"
              },
              {
                "@type": "OpeningHoursSpecification", 
                "dayOfWeek": ["Saturday", "Sunday"],
                "opens": "08:00",
                "closes": "02:00"
              }
            ],
            "amenityFeature": [
              "Pool Tables",
              "Karaoke", 
              "Live Entertainment",
              "Full Bar",
              "Happy Hour"
            ]
          })
        }}
      />
    </div>
  )
}
