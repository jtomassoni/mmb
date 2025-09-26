import { menuCategories } from '../../lib/menu-data';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Our Menu</h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Fresh ingredients, great flavors, and generous portions. 
            Everything is made to order with care.
          </p>
        </div>
        
        <div className="space-y-6">
          {menuCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-green-600 text-white p-3">
                <h2 className="text-lg font-bold">{category.name}</h2>
                {category.description && (
                  <p className="text-green-100 text-sm mt-1">{category.description}</p>
                )}
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item) => (
                    <div key={item.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base">
                            {item.name}
                            {item.isPopular && (
                              <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                Popular
                              </span>
                            )}
                          </h3>
                          {item.description && (
                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                          )}
                        </div>
                        <span className="text-green-600 font-bold text-base ml-3">
                          {item.price}
                        </span>
                      </div>
                      
                      {/* Dietary indicators */}
                      <div className="flex gap-2 mt-1">
                        {item.isVegetarian && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                            Vegetarian
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            Gluten Free
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Special Notes */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-yellow-800 mb-2">Special Notes</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• All prices subject to change</li>
            <li>• Please inform your server of any allergies</li>
            <li>• Substitutions may be available upon request</li>
            <li>• Happy Hour: 10am-12pm & 3pm-7pm daily</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
