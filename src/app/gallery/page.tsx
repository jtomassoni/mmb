'use client'

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
  width: number;
  height: number;
}

const galleryImages: GalleryImage[] = [
  // FOOD IMAGES
  {
    src: "/pics/monaghans-breakfast-biscut.jpg",
    alt: "Breakfast biscuit at Monaghan's Bar & Grill",
    category: "Food",
    width: 400,
    height: 500
  },
  {
    src: "/pics/monaghans-fish-n-chips.jpg",
    alt: "Fish and chips at Monaghan's Bar & Grill",
    category: "Food",
    width: 600,
    height: 400
  },
  {
    src: "/pics/monaghans-quesadilla.jpg",
    alt: "Quesadilla at Monaghan's Bar & Grill",
    category: "Food",
    width: 400,
    height: 500
  },
  {
    src: "/pics/monaghans-taco-platter.jpg",
    alt: "Taco platter at Monaghan's Bar & Grill",
    category: "Food",
    width: 600,
    height: 400
  },
  
  // ATMOSPHERE IMAGES
  {
    src: "/pics/monaghans-beer-and-shot.jpg",
    alt: "Beer and shot at Monaghan's Bar & Grill",
    category: "Atmosphere",
    width: 400,
    height: 600
  },
  {
    src: "/pics/monaghans-billiard-room.jpg",
    alt: "Pool room at Monaghan's Bar & Grill",
    category: "Atmosphere",
    width: 500,
    height: 400
  },
  {
    src: "/pics/monaghans-billiards.jpg",
    alt: "Pool tables at Monaghan's Bar & Grill",
    category: "Atmosphere",
    width: 600,
    height: 400
  },
  {
    src: "/pics/monaghans-kareoke.jpg",
    alt: "Karaoke night at Monaghan's Bar & Grill",
    category: "Atmosphere",
    width: 500,
    height: 600
  },
  {
    src: "/pics/monaghans-patio.jpg",
    alt: "Patio seating at Monaghan's Bar & Grill",
    category: "Atmosphere",
    width: 600,
    height: 400
  }
];

const categories = ["All", "Food", "Atmosphere"];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const filteredImages = selectedCategory === "All" 
    ? galleryImages 
    : galleryImages.filter(image => image.category === selectedCategory);

  const openModal = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedImage) {
        closeModal();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Gallery</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Take a look at our bar, delicious food, pool tables, and fun atmosphere
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 hover:bg-green-600 hover:text-white border border-gray-200 hover:border-green-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Masonry Gallery */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredImages.map((image, index) => (
            <div
              key={index}
              className="break-inside-avoid mb-6 group cursor-pointer"
              onClick={() => openModal(image)}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end">
                  <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-medium">{image.category}</p>
                    <p className="text-xs text-gray-200">{image.alt}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image */}
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={selectedImage.width}
              height={selectedImage.height}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              sizes="90vw"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 rounded-b-lg">
              <p className="text-sm font-medium">{selectedImage.category}</p>
              <p className="text-xs text-gray-200">{selectedImage.alt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
