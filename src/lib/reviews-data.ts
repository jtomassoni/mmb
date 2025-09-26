// src/lib/reviews-data.ts
export interface Review {
  id: number
  text: string
  author: string
  rating: number
  date: string
}

export const reviews: Review[] = [
  {
    id: 1,
    text: "The staff here is absolutely incredible! So friendly and attentive. The kitchen is way better than expected - everything is fresh and delicious. Best bar in Denver!",
    author: "Sarah M.",
    rating: 5,
    date: "2 weeks ago"
  },
  {
    id: 2,
    text: "Love the poker nights! The staff makes everyone feel welcome and the food from the kitchen is surprisingly amazing. Way better than typical bar food.",
    author: "Mike D.",
    rating: 5,
    date: "1 month ago"
  },
  {
    id: 3,
    text: "Amazing tacos on Tuesday! The kitchen staff really knows what they're doing. The service staff remembers your order and the vibe is always welcoming.",
    author: "Jessica L.",
    rating: 5,
    date: "3 weeks ago"
  },
  {
    id: 4,
    text: "Great place to watch the game! The staff is incredibly friendly and the kitchen puts out fantastic wings. Much better food than I expected from a bar.",
    author: "Tom R.",
    rating: 5,
    date: "1 week ago"
  },
  {
    id: 5,
    text: "The karaoke nights are so much fun! The staff is encouraging and supportive. The kitchen's late night snacks are surprisingly good quality.",
    author: "Amanda K.",
    rating: 5,
    date: "2 weeks ago"
  },
  {
    id: 6,
    text: "Best chimichangas in Denver! The kitchen really knows how to cook. The staff is incredible - they treat everyone like family. Monday poker night is a blast too.",
    author: "Carlos M.",
    rating: 5,
    date: "1 month ago"
  },
  {
    id: 7,
    text: "Love the whiskey Wednesday specials! The bartenders are amazing and the kitchen's Southwest eggrolls are restaurant quality. Way better than expected!",
    author: "David P.",
    rating: 5,
    date: "3 weeks ago"
  },
  {
    id: 8,
    text: "Music Bingo on Thursday is hilarious! The staff makes it so fun. The kitchen's Philly cheesesteak is incredible - way better than any bar food I've had.",
    author: "Lisa W.",
    rating: 5,
    date: "2 weeks ago"
  },
  {
    id: 9,
    text: "Perfect neighborhood bar! The staff is incredibly friendly and the kitchen puts out surprisingly good food. The patio is great in summer.",
    author: "Robert H.",
    rating: 5,
    date: "1 month ago"
  },
  {
    id: 10,
    text: "Been coming here since it opened! The staff is amazing and the kitchen has really stepped up their game. The daily specials are restaurant quality.",
    author: "Maria S.",
    rating: 5,
    date: "2 weeks ago"
  },
  {
    id: 11,
    text: "Great place for groups! The staff handled our work happy hour perfectly. The kitchen's food came out fast and was way better than typical bar fare.",
    author: "Jennifer T.",
    rating: 5,
    date: "1 week ago"
  },
  {
    id: 12,
    text: "The breakfast biscuit is amazing! The kitchen really knows breakfast. The staff is understanding and the coffee is strong. Perfect hangover food.",
    author: "Kevin B.",
    rating: 5,
    date: "3 weeks ago"
  },
  {
    id: 13,
    text: "Love the Thursday night specials! The staff makes Music Bingo so fun. The kitchen's late night food is surprisingly good quality - not typical bar food at all.",
    author: "Rachel G.",
    rating: 5,
    date: "2 weeks ago"
  },
  {
    id: 14,
    text: "Best bar atmosphere in Denver! The staff is incredibly friendly and the kitchen puts out food that's way better than you'd expect from a bar.",
    author: "Mark J.",
    rating: 5,
    date: "1 month ago"
  },
  {
    id: 15,
    text: "The staff is absolutely incredible! They remember everyone and make you feel like family. The kitchen has really improved - the food is restaurant quality now.",
    author: "Patricia L.",
    rating: 5,
    date: "2 weeks ago"
  }
]

export function getRandomReviews(count: number = 2): Review[] {
  const shuffled = [...reviews].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
