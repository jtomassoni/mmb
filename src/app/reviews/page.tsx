export default function ReviewsPage() {
  const reviews = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "Best bar in Denver! Great food, friendly staff, and the pool tables are always in perfect condition. The poker nights are so much fun!"
    },
    {
      name: "Mike D.",
      rating: 5,
      text: "Love the poker nights! The atmosphere is perfect and the drinks are reasonably priced. Been coming here for years."
    },
    {
      name: "Jennifer L.",
      rating: 5,
      text: "Amazing food and great service. The chicken fried chicken is to die for! Perfect place to watch the game."
    },
    {
      name: "Tom R.",
      rating: 5,
      text: "Great local spot with character. The staff remembers your name and the regulars are friendly. Highly recommend!"
    },
    {
      name: "Lisa K.",
      rating: 5,
      text: "Best bingo night in town! The prizes are great and it's always a fun crowd. The food is delicious too."
    },
    {
      name: "David P.",
      rating: 5,
      text: "Perfect neighborhood bar. Good drinks, good food, good people. What more could you ask for?"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Customer Reviews</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">{review.rating}.0 stars</span>
              </div>
              <p className="text-gray-700 mb-4">"{review.text}"</p>
              <p className="text-sm text-gray-500">- {review.name}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Share Your Experience</h2>
          <p className="text-gray-600 mb-6">
            We'd love to hear about your visit to Monaghan's!
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave a Google Review
            </a>
            <a 
              href="https://www.yelp.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave a Yelp Review
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
