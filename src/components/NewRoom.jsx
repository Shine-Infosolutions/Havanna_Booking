// src/pages/NewRoom.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, Upload, Plus, Minus } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const NewRoom = () => {
  const navigate = useNavigate();
  const { categories, categoriesLoading, BACKEND_URL } = useContext(AppContext);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    room_number: "",
    price: "",
    extra_bed: false,
    is_reserved: false,
    status: "available",
    description: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPhotoFiles([...photoFiles, ...filesArray]);

      // Create preview URLs
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPhotoPreview([...photoPreview, ...newPreviews]);
    }
  };

  const removePhoto = (index) => {
    const updatedFiles = [...photoFiles];
    const updatedPreviews = [...photoPreview];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviews[index]);

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setPhotoFiles(updatedFiles);
    setPhotoPreview(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create form data for file upload
      const data = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key !== "photos") {
          data.append(key, formData[key]);
        }
      });

      photoFiles.forEach((file) => {
        data.append("photos", file);
      });

      const response = await axios.post(`${BACKEND_URL}/api/rooms`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        navigate("/rooms");
      } else {
        toast.error(response.data.message || "Failed to create room");
      }
    } catch (err) {
      toast.error("An error occurred while creating the room");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/rooms")}
          className="mr-4 p-2 rounded-full hover:bg-primary/50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-dark">Add New Room</h2>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Room Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Room Number*
              </label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Price per Night*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="extra_bed"
                  name="extra_bed"
                  checked={formData.extra_bed}
                  onChange={handleChange}
                  className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary"
                />
                <label htmlFor="extra_bed" className="ml-2 text-sm text-dark">
                  Extra Bed Available
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_reserved"
                  name="is_reserved"
                  checked={formData.is_reserved}
                  onChange={handleChange}
                  className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary"
                />
                <label htmlFor="is_reserved" className="ml-2 text-sm text-dark">
                  Currently Reserved
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Room Photos
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {photoPreview.map((src, index) => (
                <div
                  key={index}
                  className="relative h-32 bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={src}
                    alt={`Room preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <label className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  multiple
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/rooms")}
              className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-secondary text-dark px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRoom;
