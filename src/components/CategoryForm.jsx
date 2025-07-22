// src/components/CategoryForm.jsx
import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

const CategoryForm = ({ onSubmit, onCancel, editCategory = null }) => {
  const [formData, setFormData] = useState({
    name: editCategory ? editCategory.category : "",
    status: editCategory ? editCategory.status : "Active",
  });
  const [isVisible, setIsVisible] = useState(false);
  const isEditing = !!editCategory;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleToggleChange = () => {
    setFormData({
      ...formData,
      status: formData.status === "Active" ? "Inactive" : "Active",
    });
  };

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    return () => {
      setIsVisible(false);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create category object from form data
    const category = {
      name: formData.name,
      status: formData.status,
      id: editCategory?._id || null, // Include ID if editing
    };

    // Pass to parent component
    onSubmit(category, isEditing);
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
          <h3 className="text-lg font-semibold text-dark">
            {isEditing ? "Edit Category" : "Add New Category"}
          </h3>{" "}
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
            <label className="block text-sm font-medium text-dark/70 mb-2">
              Status
            </label>
            <div className="flex items-center">
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  checked={formData.status === "Active"}
                  onChange={handleToggleChange}
                  className="hidden"
                />
                <label
                  htmlFor="status"
                  className={`block overflow-hidden h-6 border border-gray-300 rounded-full cursor-pointer ${
                    formData.status === "Active"
                      ? "bg-secondary"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in ${
                      formData.status === "Active"
                        ? "translate-x-4"
                        : "translate-x-0"
                    }`}
                  ></span>
                </label>
              </div>
              <label htmlFor="status" className="text-sm text-dark">
                {formData.status}
              </label>
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
              {isEditing ? "Update Category" : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
