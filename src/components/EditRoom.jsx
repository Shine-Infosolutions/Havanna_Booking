import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Loader, X } from "lucide-react";

// Add this component inside your Rooms component
const EditRoom = ({ room, onClose, onSave }) => {
  const { categories, BACKEND_URL } = useContext(AppContext);
  const [formData, setFormData] = useState({
    title: room.title || "",
    room_number: room.room_number || "",
    category: room.category?._id || "",
    price: room.price || "",
    floor: room.floor || "1",
    status: room.status === true,
    is_oos: room.is_oos || false,
    extra_bed: room.extra_bed || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/${room._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSave(data.room);
        onClose();
      } else {
        setError(data.message || "Failed to update room");
      }
    } catch (err) {
      setError("An error occurred while updating the room");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-dark">
            Edit Room {room.room_number}
          </h3>
          <button onClick={onClose} className="text-dark/60 hover:text-dark">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Room Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Room Number
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
          </div>

          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Price per Night (₹)
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
                Floor
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <label htmlFor="status" className="ml-2 text-sm text-dark">
                Available
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_oos"
                name="is_oos"
                checked={formData.is_oos}
                onChange={handleChange}
                className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <label htmlFor="is_oos" className="ml-2 text-sm text-dark">
                Out of Service
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="extra_bed"
                name="extra_bed"
                checked={formData.extra_bed}
                onChange={handleChange}
                className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <label htmlFor="extra_bed" className="ml-2 text-sm text-dark">
                Extra Bed
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-dark/70 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-secondary text-dark rounded-lg hover:shadow-md flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoom;
