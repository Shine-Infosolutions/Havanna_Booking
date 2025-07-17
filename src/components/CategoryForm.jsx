// src/components/CategoryForm.jsx
import React, { useState, useEffect } from "react";
import { X, Upload, Check } from "lucide-react";

const CategoryForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    maxOccupancy: "",
    amenities: "",
    image: null,
  });
  const [isVisible, setIsVisible] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    return () => {
      setIsVisible(false);
    };
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        image: imageUrl,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create category object from form data
    const category = {
      name: formData.name,
      description: formData.description,
      basePrice: parseFloat(formData.basePrice),
      maxOccupancy: parseInt(formData.maxOccupancy),
      amenities: formData.amenities.split(",").map((item) => item.trim()),
      image:
        formData.image ||
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=200&fit=crop",
    };

    // Pass to parent component
    onSubmit(category);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onCancel();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-50 transition-all duration-200 ease-out ${
        isVisible ? "bg-opacity-50 backdrop-blur-sm" : "bg-opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg p-6 w-full max-w-md mx-4 transition-all duration-200 ease-out transform ${
          isVisible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
        style={{
          animation: isVisible
            ? "modalSpring 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-dark">Add New Category</h3>
          <button
            onClick={handleClose}
            className="text-dark/60 hover:text-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              rows="3"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Base Price (₹)
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Max Occupancy
              </label>
              <input
                type="number"
                name="maxOccupancy"
                value={formData.maxOccupancy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Amenities (comma separated)
            </label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleInputChange}
              placeholder="WiFi, AC, TV, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Image
            </label>
            <div className="mt-1 flex items-center">
              {formData.image ? (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: null })}
                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">
                    Click to upload image
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-dark/70 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-dark rounded-lg hover:shadow-md flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
