// src/pages/Categories.jsx
import React, { useState, useContext, useEffect } from "react";
import { Plus, Edit, Trash2, Loader } from "lucide-react";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import CategoryForm from "../components/CategoryForm";
import { toast } from "react-toastify";

// Default category images based on category name
// const categoryImages = {
//   Standard:
//     "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=200&fit=crop",
//   Deluxe:
//     "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=200&fit=crop",
//   Suite:
//     "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=200&fit=crop",
//   Family:
//     "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=200&fit=crop",
//   Presidential:
//     "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
//   default:
//     "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
// };

// Get image based on category name
// const getCategoryImage = (categoryName) => {
//   if (!categoryName) return categoryImages.default;

//   // Check if category name contains any of the keys
//   for (const key in categoryImages) {
//     if (categoryName.toLowerCase().includes(key.toLowerCase())) {
//       return categoryImages[key];
//     }
//   }
//   return categoryImages.default;
// };

const Categories = () => {
  const { categories, categoriesLoading, BACKEND_URL, fetchCategories } =
    useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = async (newCategory, isEditing) => {
    try {
      setLoading(true);

      // Only send category name and status to the API
      const categoryData = {
        category: newCategory.name,
        status: newCategory.status,
      };

      if (isEditing && newCategory.id) {
        // Update existing category
        await axios.put(
          `${BACKEND_URL}/api/room-categories/${newCategory.id}`,
          categoryData
        );
      } else {
        // Create new category
        await axios.post(`${BACKEND_URL}/api/room-categories`, categoryData);
      }

      setShowForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} category:`,
        error
      );
      toast.error(`Failed to ${isEditing ? "update" : "add"} category`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/api/room-categories/${id}`);

      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-2xl font-bold text-dark ml-12">
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
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          editCategory={editingCategory}
        />
      )}

      {categoriesLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-secondary animate-spin" />
          <span className="ml-2 text-dark">Loading categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category._id}
                className="bg-white/30 hover:bg-white/80 border border-gray-200 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative float-right overflow-hidden">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="bg-white/80 text-dark p-1.5 rounded-full hover:bg-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="bg-white/80 text-red-600 p-1.5 rounded-full hover:bg-white"
                    onClick={() => handleDeleteCategory(category._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Image Section */}
                {/* <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <img
                    src={getCategoryImage(category.category)}
                    alt={category.category}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = categoryImages.default;
                    }}
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button className="bg-white/80 text-dark p-1.5 rounded-full hover:bg-white">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      className="bg-white/80 text-red-600 p-1.5 rounded-full hover:bg-white"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div> */}

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-dark mb-2">
                    {category.category}
                  </h3>
                  <p>
                    {category.status === "Active" ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>

                  {/* <p className="text-dark/70 text-sm mb-4">
                    {category.description ||
                      `${category.category} room with standard amenities`}
                  </p> */}

                  {/* <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-dark/70">Base Price:</span>
                      <span className="font-semibold text-dark">
                        ₹{category.price || 1000}/night
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-dark/70">
                        Max Occupancy:
                      </span>
                      <span className="font-medium text-dark">
                        {category.capacity || 2} guests
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-dark/70 mb-2">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {(category.amenities || ["WiFi", "AC", "TV"]).map(
                          (amenity, index) => (
                            <span
                              key={index}
                              className="bg-primary/50 text-dark px-2 py-1 rounded text-xs"
                            >
                              {amenity}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-dark/70">
              No categories found. Add your first category!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;
