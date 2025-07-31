import React, { useState, useEffect, useContext } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import EditRoom from "../components/EditRoom";
import { toast } from "react-toastify";

const Rooms = () => {
  const navigate = useNavigate();
  const { categories, BACKEND_URL } = useContext(AppContext);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchRooms();
  }, [page, limit, searchTerm, categoryFilter, statusFilter]);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (categoryFilter) {
        params.append("category", categoryFilter);
      }

      if (statusFilter !== "all") {
        params.append(
          "status",
          statusFilter === "available" ? "true" : "false"
        );
      }

      const response = await fetch(
        `${BACKEND_URL}/api/rooms?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }

      const data = await response.json();

      if (data.success) {
        setRooms(data.rooms);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load rooms. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setShowEditForm(true);
  };

  const handleSaveRoom = (updatedRoom) => {
    // Update the rooms array with the edited room
    setRooms(
      rooms.map((room) => (room._id === updatedRoom._id ? updatedRoom : room))
    );
    setShowEditForm(false);
    setEditingRoom(null);
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "booked":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoomStatusText = (status) => {
    return status || "available";
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-2xl font-bold text-dark ml-12">
          Rooms
        </h2>
        <button
          onClick={() => navigate("/rooms/new")}
          className="bg-secondary text-dark px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Room
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by room title or number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on new search
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        {["all", "available", "reserved", "booked", "maintenance"].map(
          (status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                statusFilter === status
                  ? "bg-secondary text-dark font-medium"
                  : "bg-white/50 text-dark/70 hover:bg-secondary/50"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-dark/70 self-center">Filter by Category:</span>
          <button
            onClick={() => {
              setCategoryFilter("");
              setPage(1);
            }}
            className={`px-3 py-1 rounded-lg text-sm ${
              categoryFilter === ""
                ? "bg-secondary text-dark font-medium"
                : "bg-primary/30 text-dark"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => {
                setCategoryFilter(category._id);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-sm ${
                categoryFilter === category._id
                  ? "bg-secondary text-dark font-medium"
                  : "bg-primary/30 text-dark"
              }`}
            >
              {category.category}
            </button>
          ))}
        </div>
      )}



      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-secondary animate-spin" />
          <span className="ml-2 text-dark">Loading rooms...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-primary/50 hover:bg-primary border border-gray-200 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {/* Image Section */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <img
                      src={
                        room.images && room.images.length > 0
                          ? room.images[0]
                          : null
                      }
                      alt={`Room ${room.room_number}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgNzVIMjI1VjEyNUgxNzVWNzVaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIxODciIGN5PSI4NyIgcj0iMyIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTc1IDExMEwyMDAgOTVMMjI1IDExMFYxMjVIMTc1VjExMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+";
                      }}
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="bg-white/80 cursor-pointer text-dark p-1.5 rounded-full hover:bg-white"
                      >
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
                        {getRoomStatusText(room.status)}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-dark">
                        Room {room.room_number}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-dark/70">Title:</span>
                      <span className="font-semibold text-dark">
                        {room.title}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-dark/70">Category:</span>
                      <span className="font-semibold text-dark">
                        {room.category?.category || "Uncategorized"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-dark/70">Price:</span>
                        <span className="font-semibold text-dark">
                          ₹{room.price}/night
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-dark/70">Extra Bed:</span>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            room.extra_bed
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {room.extra_bed ? "Available" : "Not Available"}
                        </span>
                      </div>

                      {room.reservedFromDate && room.reservedTillDate ? (
                        <div className="mt-3">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-dark/70">
                              Reserved From:
                            </span>
                            <span className="text-sm font-medium text-yellow-600">
                              {new Date(
                                room.reservedFromDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-dark/70">
                              Reserved Till:
                            </span>
                            <span className="text-sm font-medium text-yellow-600">
                              {new Date(
                                room.reservedTillDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-sm text-dark/70">
                            Reserved:
                          </span>
                          <span className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                            No
                          </span>
                        </div>
                      )}

                      {room.bookedTillDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-dark/70">
                            Booked Till:
                          </span>
                          <span className="text-sm font-medium text-red-600">
                            {new Date(room.bookedTillDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {room.description && (
                        <div className="mt-3">
                          <span className="text-sm text-dark/70">
                            Description:
                          </span>
                          <p className="text-sm text-dark mt-1">
                            {room.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-dark/70">
                No rooms found matching your criteria
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`p-2 rounded-lg ${
                  page === 1
                    ? "text-dark/40 cursor-not-allowed"
                    : "text-dark hover:bg-secondary/50"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-dark">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`p-2 rounded-lg ${
                  page === totalPages
                    ? "text-dark/40 cursor-not-allowed"
                    : "text-dark hover:bg-secondary/50"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {showEditForm && editingRoom && (
        <EditRoom
          room={editingRoom}
          onClose={() => {
            setShowEditForm(false);
            setEditingRoom(null);
          }}
          onSave={handleSaveRoom}
          fetchRooms={fetchRooms}
        />
      )}
    </div>
  );
};

export default Rooms;
