// src/components/BookingDetails.jsx
import React, { useState } from "react";
import {
  X,
  Check,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  BedDouble,
} from "lucide-react";
import { STORAGE_KEYS, getStoredData, storeData } from "../utils/LocalStorage";

const BookingDetails = ({ booking, onClose, onUpdate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState(booking.status);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleUpdateStatus = () => {
    // Update booking status
    const updatedBooking = { ...booking, status };

    // Update in localStorage
    const bookings = getStoredData(STORAGE_KEYS.BOOKINGS) || [];
    const updatedBookings = bookings.map((b) =>
      b.id === booking.id ? updatedBooking : b
    );
    storeData(STORAGE_KEYS.BOOKINGS, updatedBookings);

    // Update room status if needed
    if (status === "checked-out") {
      const rooms = getStoredData(STORAGE_KEYS.ROOMS) || [];
      const updatedRooms = rooms.map((room) => {
        if (room.id === booking.roomId) {
          return { ...room, status: "available", guest: null };
        }
        return room;
      });
      storeData(STORAGE_KEYS.ROOMS, updatedRooms);
    } else if (status === "checked-in") {
      const rooms = getStoredData(STORAGE_KEYS.ROOMS) || [];
      const updatedRooms = rooms.map((room) => {
        if (room.id === booking.roomId) {
          return { ...room, status: "occupied", guest: booking.guestName };
        }
        return room;
      });
      storeData(STORAGE_KEYS.ROOMS, updatedRooms);
    }

    // Notify parent component
    onUpdate(updatedBooking);
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
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

  return (
    <div
      className={`fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-50 transition-all duration-200 ease-out ${
        isVisible ? "bg-opacity-50 backdrop-blur-sm" : "bg-opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg p-6 w-full max-w-2xl mx-4 transition-all duration-200 ease-out transform ${
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
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-dark flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Booking Details
          </h3>
          <button
            onClick={handleClose}
            className="text-dark/60 hover:text-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-dark flex items-center">
              <User className="w-4 h-4 mr-2" />
              Guest Information
            </h4>

            <div className="space-y-2">
              <div>
                <span className="text-sm text-dark/60">Name:</span>
                <p className="font-medium text-dark">{booking.guestName}</p>
              </div>

              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1 text-dark/60" />
                <span className="text-dark">{booking.email}</span>
              </div>

              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1 text-dark/60" />
                <span className="text-dark">{booking.phone}</span>
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-dark flex items-center">
              <BedDouble className="w-4 h-4 mr-2" />
              Room Information
            </h4>

            <div className="space-y-2">
              <div>
                <span className="text-sm text-dark/60">Room:</span>
                <p className="font-medium text-dark">
                  Room {booking.roomNumber} - {booking.roomType}
                </p>
              </div>

              <div>
                <span className="text-sm text-dark/60">Check-in:</span>
                <p className="text-dark">{booking.checkIn}</p>
              </div>

              <div>
                <span className="text-sm text-dark/60">Check-out:</span>
                <p className="text-dark">{booking.checkOut}</p>
              </div>

              <div>
                <span className="text-sm text-dark/60">Guests:</span>
                <p className="text-dark">
                  {booking.adults} Adults, {booking.children} Children
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-dark flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-dark/60">Total Amount:</span>
              <p className="font-bold text-dark">₹{booking.totalAmount}</p>
            </div>

            <div>
              <span className="text-sm text-dark/60">Payment Method:</span>
              <p className="text-dark capitalize">{booking.paymentMethod}</p>
            </div>

            <div>
              <span className="text-sm text-dark/60">Payment Status:</span>
              <p className="text-dark capitalize">{booking.paymentStatus}</p>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequests && (
          <div className="mt-6">
            <h4 className="font-medium text-dark mb-2">Special Requests</h4>
            <p className="text-dark bg-primary/20 p-3 rounded-lg">
              {booking.specialRequests}
            </p>
          </div>
        )}

        {/* Status Update */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <span className="text-sm text-dark/60 mr-2">Current Status:</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={status}
                onChange={handleStatusChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="confirmed">Confirmed</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={handleUpdateStatus}
                className="bg-secondary text-dark px-4 py-2 rounded-lg hover:shadow-md flex items-center"
                disabled={status === booking.status}
              >
                <Check className="w-4 h-4 mr-2" />
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
