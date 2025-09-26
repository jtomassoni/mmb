// src/lib/menu-data.ts
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  category: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: "breakfast",
    name: "Breakfast",
    description: "Served until 11:00 AM",
    items: [
      {
        id: "breakfast-biscuit",
        name: "Breakfast Biscuit",
        description: "Flaky biscuit with eggs, cheese, and choice of bacon or sausage",
        price: "$8.99",
        category: "breakfast",
        isPopular: true
      },
      {
        id: "denver-omelet",
        name: "Denver Omelet",
        description: "Three eggs with ham, peppers, onions, and cheese",
        price: "$9.99",
        category: "breakfast"
      },
      {
        id: "pancake-stack",
        name: "Pancake Stack",
        description: "Three fluffy pancakes with butter and syrup",
        price: "$7.99",
        category: "breakfast"
      },
      {
        id: "breakfast-burrito",
        name: "Breakfast Burrito",
        description: "Scrambled eggs, cheese, potatoes, and choice of meat in a flour tortilla",
        price: "$8.99",
        category: "breakfast"
      },
      {
        id: "biscuits-gravy",
        name: "Biscuits & Gravy",
        description: "Two biscuits smothered in creamy sausage gravy",
        price: "$6.99",
        category: "breakfast"
      },
      {
        id: "french-toast",
        name: "French Toast",
        description: "Thick-cut bread dipped in egg batter, grilled golden brown",
        price: "$7.99",
        category: "breakfast"
      }
    ]
  },
  {
    id: "appetizers",
    name: "Appetizers",
    description: "Perfect for sharing",
    items: [
      {
        id: "wings",
        name: "Buffalo Wings",
        description: "Crispy wings tossed in your choice of sauce - Buffalo, BBQ, or Honey Mustard",
        price: "$9.99",
        category: "appetizers",
        isPopular: true
      },
      {
        id: "nachos",
        name: "Loaded Nachos",
        description: "Tortilla chips topped with cheese, jalapeños, sour cream, and guacamole",
        price: "$8.99",
        category: "appetizers"
      },
      {
        id: "mozzarella-sticks",
        name: "Mozzarella Sticks",
        description: "Breaded mozzarella cheese served with marinara sauce",
        price: "$7.99",
        category: "appetizers"
      },
      {
        id: "onion-rings",
        name: "Beer Battered Onion Rings",
        description: "Crispy beer-battered onion rings with ranch dipping sauce",
        price: "$6.99",
        category: "appetizers"
      }
    ]
  },
  {
    id: "soups-salads",
    name: "Soups & Salads",
    description: "Fresh and hearty",
    items: [
      {
        id: "chicken-salad",
        name: "Grilled Chicken Salad",
        description: "Mixed greens with grilled chicken, tomatoes, cucumbers, and ranch dressing",
        price: "$10.99",
        category: "soups-salads",
        isVegetarian: false
      },
      {
        id: "caesar-salad",
        name: "Caesar Salad",
        description: "Romaine lettuce, parmesan cheese, croutons, and caesar dressing",
        price: "$8.99",
        category: "soups-salads",
        isVegetarian: true
      },
      {
        id: "soup-of-day",
        name: "Soup of the Day",
        description: "Ask your server about today's homemade soup",
        price: "$4.99",
        category: "soups-salads"
      }
    ]
  },
  {
    id: "sandwiches",
    name: "Sandwiches",
    description: "All sandwiches served with fries or chips",
    items: [
      {
        id: "club-sandwich",
        name: "Club Sandwich",
        description: "Triple-decker with turkey, bacon, lettuce, tomato, and mayo",
        price: "$10.99",
        category: "sandwiches",
        isPopular: true
      },
      {
        id: "patty-melt",
        name: "Patty Melt",
        description: "Beef patty with Swiss cheese, grilled onions, and thousand island on rye",
        price: "$9.99",
        category: "sandwiches"
      },
      {
        id: "philly-cheesesteak",
        name: "Philly Cheesesteak",
        description: "Thinly sliced beef with peppers, onions, and melted cheese",
        price: "$11.99",
        category: "sandwiches",
        isPopular: true
      },
      {
        id: "fish-sandwich",
        name: "Fish Sandwich",
        description: "Beer-battered cod with lettuce, tomato, and tartar sauce",
        price: "$10.99",
        category: "sandwiches"
      },
      {
        id: "chicken-sandwich",
        name: "Grilled Chicken Sandwich",
        description: "Grilled chicken breast with lettuce, tomato, and mayo",
        price: "$9.99",
        category: "sandwiches"
      }
    ]
  },
  {
    id: "entrees",
    name: "Entrees",
    description: "Served with choice of two sides",
    items: [
      {
        id: "fish-chips",
        name: "Fish & Chips",
        description: "Beer-battered cod with crispy fries and coleslaw",
        price: "$11.99",
        category: "entrees",
        isPopular: true
      },
      {
        id: "chicken-fried-chicken",
        name: "Chicken Fried Chicken",
        description: "Breaded chicken breast with country gravy, mashed potatoes, and green beans",
        price: "$12.99",
        category: "entrees"
      },
      {
        id: "ribeye-steak",
        name: "Ribeye Steak",
        description: "8oz ribeye grilled to perfection with baked potato and vegetables",
        price: "$18.99",
        category: "entrees",
        isPopular: true
      },
      {
        id: "quesadilla",
        name: "Chicken Quesadilla",
        description: "Grilled chicken, cheese, and peppers in a flour tortilla with sour cream and salsa",
        price: "$9.99",
        category: "entrees"
      },
      {
        id: "taco-platter",
        name: "Taco Platter",
        description: "Three tacos with choice of beef, chicken, or fish, served with rice and beans",
        price: "$10.99",
        category: "entrees"
      }
    ]
  },
  {
    id: "desserts",
    name: "Desserts",
    description: "Sweet endings",
    items: [
      {
        id: "chocolate-cake",
        name: "Chocolate Cake",
        description: "Rich chocolate cake with chocolate frosting",
        price: "$5.99",
        category: "desserts"
      },
      {
        id: "apple-pie",
        name: "Apple Pie",
        description: "Homemade apple pie with vanilla ice cream",
        price: "$5.99",
        category: "desserts"
      },
      {
        id: "ice-cream",
        name: "Ice Cream",
        description: "Choice of vanilla, chocolate, or strawberry",
        price: "$3.99",
        category: "desserts"
      }
    ]
  },
  {
    id: "beverages",
    name: "Beverages",
    description: "Something to drink",
    items: [
      {
        id: "coffee",
        name: "Coffee",
        description: "Freshly brewed coffee",
        price: "$2.99",
        category: "beverages"
      },
      {
        id: "soda",
        name: "Soft Drinks",
        description: "Coke, Pepsi, Sprite, Dr. Pepper",
        price: "$2.99",
        category: "beverages"
      },
      {
        id: "juice",
        name: "Fresh Juice",
        description: "Orange, apple, or cranberry juice",
        price: "$3.99",
        category: "beverages"
      },
      {
        id: "beer",
        name: "Beer",
        description: "Domestic and imported beers available",
        price: "$4.99",
        category: "beverages"
      },
      {
        id: "wine",
        name: "Wine",
        description: "House red and white wine",
        price: "$6.99",
        category: "beverages"
      }
    ]
  }
];

export function getMenuCategory(categoryId: string): MenuCategory | undefined {
  return menuCategories.find(category => category.id === categoryId);
}

export function getPopularItems(): MenuItem[] {
  return menuCategories
    .flatMap(category => category.items)
    .filter(item => item.isPopular);
}
