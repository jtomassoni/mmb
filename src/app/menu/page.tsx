export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Menu</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6 text-red-600">Breakfast</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Denver Omelet</span>
                <span className="text-red-600">$9.99</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Pancake Stack</span>
                <span className="text-red-600">$7.99</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Breakfast Burrito</span>
                <span className="text-red-600">$8.99</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Biscuits & Gravy</span>
                <span className="text-red-600">$6.99</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6 text-red-600">Lunch & Dinner</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Chicken Fried Chicken</span>
                <span className="text-red-600">$12.99</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Fish & Chips</span>
                <span className="text-red-600">$11.99</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Club Sandwich</span>
                <span className="text-red-600">$10.99</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Patty Melt</span>
                <span className="text-red-600">$9.99</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
