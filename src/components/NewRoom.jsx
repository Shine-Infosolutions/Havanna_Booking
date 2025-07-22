// src/pages/NewRoom.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, Upload, Plus, Minus } from "lucide-react";
import { AppContext } from "../context/AppContext";

const NewRoom = () => {
  const navigate = useNavigate();
  const { categories, categoriesLoading, BACKEND_URL } = useContext(AppContext);

  const [formData, setFormData] = useState({
    title: "",
    room_number: "",
    category: "",
    price: "",
    floor: "1",
    status: true,
    is_oos: false,
    extra_bed: false,
    photos: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setError("");

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
        setError(response.data.message || "Failed to create room");
      }
    } catch (err) {
      setError("An error occurred while creating the room");
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
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Room Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Deluxe Room"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Room Number
              </label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="101"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              >
                <option value="">Select a category</option>
                {categoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.category}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Price per Night (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="1000"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Floor
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="1"
                min="0"
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="status"
                    className={`block overflow-hidden h-6 border border-gray-300 rounded-full cursor-pointer ${
                      formData.status ? "bg-secondary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in ${
                        formData.status ? "translate-x-4" : "translate-x-0"
                      }`}
                    ></span>
                  </label>
                </div>
                <label htmlFor="status" className="text-sm text-dark">
                  Available
                </label>
              </div>

              <div className="flex items-center">
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="is_oos"
                    name="is_oos"
                    checked={formData.is_oos}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="is_oos"
                    className={`block overflow-hidden h-6 border border-gray-300 rounded-full cursor-pointer ${
                      formData.is_oos ? "bg-secondary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in ${
                        formData.is_oos ? "translate-x-4" : "translate-x-0"
                      }`}
                    ></span>
                  </label>
                </div>
                <label htmlFor="is_oos" className="text-sm text-dark">
                  Out of Service
                </label>
              </div>

              <div className="flex items-center">
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="extra_bed"
                    name="extra_bed"
                    checked={formData.extra_bed}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="extra_bed"
                    className={`block overflow-hidden h-6 border border-gray-300 rounded-full cursor-pointer ${
                      formData.extra_bed ? "bg-secondary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in ${
                        formData.extra_bed ? "translate-x-4" : "translate-x-0"
                      }`}
                    ></span>
                  </label>
                </div>
                <label htmlFor="extra_bed" className="text-sm text-dark">
                  Extra Bed
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
