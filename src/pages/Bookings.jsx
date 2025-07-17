// src/pages/Bookings.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { STORAGE_KEYS, getStoredData, storeData } from "../utils/LocalStorage";
import BookingForm from "../components/BookingForm";
import BookingDetails from "../components/BookingDetails";

const Bookings = () => {
  const [showForm, setShowForm] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    // Load bookings from localStorage
    const storedBookings = getStoredData(STORAGE_KEYS.BOOKINGS) || [];
    setBookings(storedBookings);
  }, []);

  const handleAddBooking = (newBooking) => {
    setBookings([newBooking, ...bookings]);
    setShowForm(false);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
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
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "checked-in":
        return "bg-blue-100 text-blue-800";
      case "checked-out":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const filteredBookings = bookings
    .filter(
      (booking) => statusFilter === "all" || booking.status === statusFilter
    )
    .filter(
      (booking) =>
        searchTerm === "" ||
        booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.roomNumber.toString().includes(searchTerm)
    );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-white to-primary/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-dark">Bookings</h2>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="ml-2 text-dark/60 hover:text-dark"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-secondary text-dark px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          New Booking
        </button>
      </div>

      {/* Help Text */}
      {showHelp && (
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
      )}

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
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-primary/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark">
                        {booking.guestName}
                      </div>
                      <div className="text-xs text-dark/70">
                        {booking.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark">
                        Room {booking.roomNumber}
                      </div>
                      <div className="text-xs text-dark/70">
                        {booking.roomType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                      {booking.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                      {booking.checkOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">
                      ₹{booking.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-dark/60 hover:text-dark"
                          onClick={() => handleViewBooking(booking)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-dark/60 hover:text-dark">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-500 hover:text-red-700">
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

      {/* Booking Form Modal */}
      {showForm && (
        <BookingForm
          onSubmit={handleAddBooking}
          onCancel={() => setShowForm(false)}
        />
      )}
      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={handleUpdateBooking}
        />
      )}
    </div>
  );
};

export default Bookings;
