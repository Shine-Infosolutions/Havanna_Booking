import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { STORAGE_KEYS, getStoredData } from "../utils/LocalStorage.js";

const Rooms = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [roomsData, setRoomsData] = useState([
    {
      id: 1,
      number: "101",
      type: "Standard",
      status: "occupied",
      guest: "Sarah Johnson",
      price: 120,
      amenities: ["WiFi", "AC", "TV"],
      floor: 1,
      capacity: 2,
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=200&fit=crop",
    },
    {
      id: 2,
      number: "205",
      type: "Deluxe Suite",
      status: "occupied",
      guest: "John Smith",
      price: 180,
      amenities: ["WiFi", "AC", "TV", "Balcony", "Mini Bar"],
      floor: 2,
      capacity: 4,
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=200&fit=crop",
    },
    {
      id: 3,
      number: "301",
      type: "Presidential Suite",
      status: "available",
      guest: null,
      price: 350,
      amenities: [
        "WiFi",
        "AC",
        "TV",
        "Balcony",
        "Mini Bar",
        "Jacuzzi",
        "Butler Service",
      ],
      floor: 3,
      capacity: 6,
      image:
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=200&fit=crop",
    },
    {
      id: 4,
      number: "102",
      type: "Standard",
      status: "maintenance",
      guest: null,
      price: 120,
      amenities: ["WiFi", "AC", "TV"],
      floor: 1,
      capacity: 2,
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=200&fit=crop",
    },
    {
      id: 5,
      number: "103",
      type: "Standard",
      status: "available",
      guest: null,
      price: 120,
      amenities: ["WiFi", "AC", "TV"],
      floor: 1,
      capacity: 2,
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=200&fit=crop",
    },
    {
      id: 6,
      number: "206",
      type: "Deluxe Suite",
      status: "occupied",
      guest: "Robert Brown",
      price: 180,
      amenities: ["WiFi", "AC", "TV", "Balcony", "Mini Bar"],
      floor: 2,
      capacity: 4,
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=200&fit=crop",
    },
  ]);

  // Load categories from localStorage
  useEffect(() => {
    const storedCategories = getStoredData(STORAGE_KEYS.CATEGORIES);
    if (storedCategories) {
      setCategories(storedCategories);
    }
  }, []);

  const getRoomStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRooms =
    statusFilter === "all"
      ? roomsData
      : roomsData.filter((room) => room.status === statusFilter);

  // Get category details for a room
  const getCategoryDetails = (roomType) => {
    return categories.find((cat) => cat.name === roomType);
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">Rooms</h2>
        <button className="bg-secondary text-dark px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium">
          <Plus className="w-4 h-4 inline mr-2" />
          Add Room
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        {["all", "available", "occupied", "maintenance"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              statusFilter === status
                ? "bg-secondary text-dark font-medium"
                : "bg-white/50 text-dark/70 hover:bg-secondary/50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="flex space-x-2 mt-4">
          <span className="text-dark/70 self-center">Filter by Category:</span>
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-3 py-1 bg-primary/30 text-dark rounded-lg text-sm"
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const categoryDetails = getCategoryDetails(room.type);

          return (
            <div
              key={room.id}
              className="bg-primary/50 hover:bg-primary border border-gray-200 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {/* Image Section */}
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img
                  src={categoryDetails?.image || room.image}
                  alt={`Room ${room.number}`}
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
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getRoomStatusColor(
                      room.status
                    )}`}
                  >
                    {room.status}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-dark">
                    Room {room.number}
                  </h3>
                  <span className="text-sm text-dark/70">
                    Floor {room.floor}
                  </span>
                </div>

                <p className="text-dark/70 text-sm mb-4">{room.type}</p>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-dark/70">Price:</span>
                    <span className="font-semibold text-dark">
                      ₹{categoryDetails?.basePrice || room.price}/night
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-dark/70">Capacity:</span>
                    <span className="font-medium text-dark">
                      {categoryDetails?.maxOccupancy || room.capacity} guests
                    </span>
                  </div>

                  {room.guest && (
                    <div className="flex justify-between">
                      <span className="text-sm text-dark/70">
                        Current Guest:
                      </span>
                      <span className="font-medium text-dark">
                        {room.guest}
                      </span>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-dark/70 mb-2">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {(categoryDetails?.amenities || room.amenities).map(
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rooms;
