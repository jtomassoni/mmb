export default function SpecialsPage() {
  const specials = [
    { name: "Chicken Fried Chicken", price: "$12.99", description: "Crispy fried chicken with mashed potatoes and gravy" },
    { name: "Club Sandwich", price: "$10.99", description: "Triple-decker with turkey, bacon, and avocado" },
    { name: "Spaghetti & Meatballs", price: "$11.99", description: "Homemade pasta with meatballs and marinara" },
    { name: "Chili Relleno", price: "$9.99", description: "Stuffed poblano pepper with cheese and sauce" },
    { name: "Patty Melt", price: "$9.99", description: "Beef patty with Swiss cheese and grilled onions" },
    { name: "Biscuits & Gravy", price: "$6.99", description: "Fresh biscuits with sausage gravy" },
    { name: "Fish & Chips", price: "$11.99", description: "Beer-battered cod with crispy fries" },
    { name: "Quesadilla", price: "$8.99", description: "Cheese quesadilla with green-chile side" },
    { name: "Taco Platter", price: "$9.99", description: "Three tacos with rice and beans" },
    { name: "BLT w/ Avocado", price: "$8.99", description: "Bacon, lettuce, tomato with fresh avocado" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Daily Specials</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specials.map((special, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-red-600">{special.name}</h3>
              <p className="text-gray-600 mb-3">{special.description}</p>
              <p className="text-xl font-bold text-red-600">{special.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
