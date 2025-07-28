// src/pages/Bookings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, Eye, Edit, Trash2, Loader, X } from "lucide-react";
import BookingDetails from "../components/BookingDetails";
import { useNavigate } from "react-router-dom";
import StatusUpdateModal from "../components/StatusUpdateModal";

const BACKEND_URL =
  import.meta.env.BACKEND_URL || "https://havana-backend.vercel.app";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusUpdateBooking, setStatusUpdateBooking] = useState(null);
  const [deleteBookingId, setDeleteBookingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/bookings`);

        // Check if response has data
        if (response.data && response.data.success) {
          setBookings(response.data.bookings || []);
        } else if (response.data && Array.isArray(response.data)) {
          // If the API returns an array directly
          setBookings(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Received unexpected data format from server");
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    console.log("Current bookings state:", bookings);
  }, [bookings]);

  const handleEditBooking = (booking) => {
    navigate(`/booking/edit/${booking._id}`);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
  };

  const handleStatusUpdate = (updatedBooking) => {
    const updatedBookings = bookings.map((booking) =>
      booking._id === updatedBooking._id ? updatedBooking : booking
    );
    setBookings(updatedBookings);
    setStatusUpdateBooking(null);
  };

  const handleStatusClick = (booking) => {
    setStatusUpdateBooking(booking);
  };

  const handleDeleteClick = (booking) => {
    setDeleteBookingId(booking._id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${BACKEND_URL}/api/bookings/delete/${deleteBookingId}`
      );

      // Remove the deleted booking from the state
      setBookings(
        bookings.filter((booking) => booking._id !== deleteBookingId)
      );
      setShowDeleteConfirm(false);
      setDeleteBookingId(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
      setError("Failed to delete booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = (updatedBooking) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === updatedBooking.id ? updatedBooking : booking
    );
    setBookings(updatedBookings);
    setSelectedBooking(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Booked":
        return "bg-green-100 text-green-800";
      case "Checked In":
        return "bg-blue-100 text-blue-800";
      case "Checked Out":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const filteredBookings = bookings
    .filter(
      (booking) =>
        statusFilter === "all" || booking.status?.toLowerCase() === statusFilter
    )
    .filter(
      (booking) =>
        searchTerm === "" ||
        (booking.guestDetails?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.roomNumber?.toString().includes(searchTerm)
    );

  return (
    <div className="p-6 space-y-6  min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-dark">Bookings</h2>
          {/* <button
            onClick={() => setShowHelp(!showHelp)}
            className="ml-2 text-dark/60 hover:text-dark"
          >
            <HelpCircle className="w-5 h-5" />
          </button> */}
        </div>
        <button
          onClick={() => navigate("/booking/new")}
          className="bg-secondary text-dark px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          New Booking
        </button>
      </div>

      {/* Help Text */}
      {/* {showHelp && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800">
            How to use the Bookings page:
          </h3>
          <ol className="list-decimal ml-5 mt-2 text-sm text-blue-700 space-y-1">
            <li>View all bookings in the table below</li>
            <li>Filter bookings by status using the buttons above the table</li>
            <li>Search for bookings by guest name or room number</li>
            <li>Click "New Booking" to create a new reservation</li>
            <li>Use the action buttons to view, edit, or delete bookings</li>
          </ol>
        </div>
      )} */}

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by guest name or room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div className="flex space-x-2">
          {["all", "confirmed", "checked-in", "checked-out", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors text-sm ${
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
      </div>

      {/* Bookings Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Check-out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <Loader className="w-8 h-8 text-secondary animate-spin" />
                      <span className="ml-2 text-dark">
                        Loading bookings...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-primary/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark">
                        {booking.salutation} {booking.guestDetails?.name}
                      </div>
                      <div className="text-xs text-dark/70">
                        {booking.contactDetails?.phone || "No phone"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark">
                        Room {booking.roomNumber}
                      </div>
                      <div className="text-xs text-dark/70">
                        {booking.categoryId?.category || "Standard"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                      {new Date(
                        booking.bookingInfo?.checkIn
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                      {new Date(
                        booking.bookingInfo?.checkOut
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">
                      ₹{booking.paymentDetails?.totalAmount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusClick(booking)}
                        className={`px-2 py-1 text-xs rounded-full cursor-pointer hover:opacity-80 ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* <button
                          className="text-dark/60 hover:text-dark"
                          onClick={() => handleViewBooking(booking)}
                        >
                          <Eye className="w-4 h-4" />
                        </button> */}
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-dark/60 hover:text-dark"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(booking)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-dark/70"
                  >
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={handleUpdateBooking}
        />
      )}
      {statusUpdateBooking && (
        <StatusUpdateModal
          booking={statusUpdateBooking}
          onClose={() => setStatusUpdateBooking(null)}
          onUpdate={handleStatusUpdate}
        />
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-dark mb-4">
              Confirm Delete
            </h3>
            <p className="mb-6 text-dark/70">
              Are you sure you want to delete this booking? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-dark/70 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
