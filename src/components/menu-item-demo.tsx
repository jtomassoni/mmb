'use client'

import { useCart } from './cart-context'

// Demo component showing how menu items would integrate with cart
export function MenuItemDemo() {
  const { addItem } = useCart()

  const sampleMenuItem = {
    id: 'demo-burger',
    name: 'Monaghan\'s Famous Burger',
    price: 12.99,
    description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce',
    image: '/pics/monaghans-burger.jpg'
  }

  const handleAddToCart = () => {
    addItem(sampleMenuItem)
    alert('Added to cart! Click the cart button in the header to view your order.')
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <img 
        src={sampleMenuItem.image} 
        alt={sampleMenuItem.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          // Fallback if image doesn't exist
          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJ1cmdlciBJbWFnZTwvdGV4dD48L3N2Zz4='
        }}
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {sampleMenuItem.name}
        </h3>
        <p className="text-gray-600 mb-4">
          {sampleMenuItem.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">
            ${sampleMenuItem.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={true}
            className="bg-gray-400 text-white px-6 py-2 rounded-lg font-medium cursor-not-allowed opacity-60"
            title="Online ordering coming soon!"
          >
            Add to Cart (Soon)
          </button>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            🚀 This is a demo! Online ordering coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
