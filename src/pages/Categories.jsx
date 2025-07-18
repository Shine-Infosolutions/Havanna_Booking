// src/pages/Categories.jsx
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import CategoryForm from "../components/CategoryForm";
import {
  STORAGE_KEYS,
  getStoredData,
  storeData,
} from "../utils/LocalStorage.js";

const defaultCategories = [
  {
    id: 1,
    name: "Standard Room",
    description: "Basic accommodation with essential amenities",
    basePrice: 120,
    maxOccupancy: 2,
    amenities: ["WiFi", "AC", "TV"],
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=200&fit=crop",
  },
  {
    id: 2,
    name: "Deluxe Suite",
    description: "Spacious room with premium amenities",
    basePrice: 180,
    maxOccupancy: 4,
    amenities: ["WiFi", "AC", "TV", "Balcony", "Mini Bar"],
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=200&fit=crop",
  },
  {
    id: 3,
    name: "Presidential Suite",
    description: "Luxury accommodation with exclusive services",
    basePrice: 350,
    maxOccupancy: 6,
    amenities: [
      "WiFi",
      "AC",
      "TV",
      "Balcony",
      "Mini Bar",
      "Jacuzzi",
      "Butler Service",
    ],
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=200&fit=crop",
  },
];

const Categories = () => {
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);

  // Load categories from localStorage on component mount
  useEffect(() => {
    const storedCategories = getStoredData(STORAGE_KEYS.CATEGORIES);
    if (storedCategories && storedCategories.length > 0) {
      setCategories(storedCategories);
    } else {
      // Initialize with default categories if none exist
      setCategories(defaultCategories);
      storeData(STORAGE_KEYS.CATEGORIES, defaultCategories);
    }
  }, []);

  const handleAddCategory = (newCategory) => {
    // Add ID to the new category
    const categoryWithId = {
      ...newCategory,
      id:
        categories.length > 0
          ? Math.max(...categories.map((c) => c.id)) + 1
          : 1,
    };

    // Add to categories array
    const updatedCategories = [...categories, categoryWithId];
    setCategories(updatedCategories);

    // Store in localStorage
    storeData(STORAGE_KEYS.CATEGORIES, updatedCategories);

    // Close form
    setShowForm(false);
  };

  const handleDeleteCategory = (id) => {
    const updatedCategories = categories.filter(
      (category) => category.id !== id
    );
    setCategories(updatedCategories);
    storeData(STORAGE_KEYS.CATEGORIES, updatedCategories);
  };

  return (
    <div className="p-6 space-y-6  min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--color-dark)]">
          Room Categories
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[var(--color-secondary)] text-[var(--color-dark)] px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Category
        </button>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white/30 hover:bg-white/80 border border-gray-200 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            {/* Image Section */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgNzVIMjI1VjEyNUgxNzVWNzVaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIxODciIGN5PSI4NyIgcj0iMyIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTc1IDExMEwyMDAgOTVMMjI1IDExMFYxMjVIMTc1VjExMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+";
                }}
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <button className="bg-white/80 text-dark p-1.5 rounded-full hover:bg-white">
                  <Edit className="w-3 h-3" />
                </button>
                <button className="bg-white/80 text-red-600 p-1.5 rounded-full hover:bg-white">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-dark)] mb-2">
                {category.name}
              </h3>

              <p className="text-[var(--color-dark)]/70 text-sm mb-4">
                {category.description}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-dark)]/70">
                    Base Price:
                  </span>
                  <span className="font-semibold text-[var(--color-dark)]">
                    ₹{category.basePrice}/night
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-dark)]/70">
                    Max Occupancy:
                  </span>
                  <span className="font-medium text-[var(--color-dark)]">
                    {category.maxOccupancy} guests
                  </span>
                </div>

                <div>
                  <p className="text-sm text-[var(--color-dark)]/70 mb-2">
                    Amenities:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {category.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-[var(--color-primary)]/50 text-[var(--color-dark)] px-2 py-1 rounded text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
