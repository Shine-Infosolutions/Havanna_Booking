// src/components/BookingDetails.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Check,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  BedDouble,
  Loader,
} from "lucide-react";

const BACKEND_URL =
  import.meta.env.BACKEND_URL || "https://havana-backend.vercel.app";

const BookingDetails = ({ booking, onClose, onUpdate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    setIsVisible(true);

    // Fetch booking details if we have an ID
    const fetchBookingDetails = async () => {
      if (booking._id) {
        try {
          setLoading(true);
          const response = await axios.get(
            `${BACKEND_URL}/api/bookings/${booking._id}`
          );

          setBookingData(response.data.booking);
          // Update status with the fetched booking status
          setStatus(response.data.booking.status);
        } catch (error) {
          console.error("Error fetching booking details:", error);
          setError("Failed to load booking details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBookingDetails();
  }, [booking._id]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleUpdateStatus = async () => {
    if (status === booking.status) return;

    try {
      setLoading(true);

      const response = await axios.patch(
        `${BACKEND_URL}/api/bookings/${booking._id}/status`,
        { status }
      );

      // Create updated booking object with new status
      const updatedBooking = { ...booking, status };

      // Notify parent component
      onUpdate(updatedBooking);

      // Close modal after successful update
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error("Error updating booking status:", error);
      setError(
        error.response?.data?.message || "Failed to update booking status"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
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

  return (
    <div
      className={`fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-50 transition-all duration-200 ease-out ${
        isVisible ? "bg-opacity-50 backdrop-blur-sm" : "bg-opacity-0"
      } overflow-y-auto py-6`}
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

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-dark flex items-center">
              <User className="w-4 h-4 mr-2" />
              Guest Information
            </h4>

            {loading && !bookingData ? (
              <div className="flex justify-center">
                <Loader className="w-5 h-5 text-secondary animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-dark/60">GRC Number:</span>
                  <p className="font-medium text-dark">
                    {bookingData?.grcNo || booking.grcNo || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-dark/60">Name:</span>
                  <p className="font-medium text-dark">
                    {bookingData
                      ? `${bookingData.salutation} ${bookingData.name}`
                      : booking.guestName}
                  </p>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1 text-dark/60" />
                  <span className="text-dark">
                    {bookingData?.email || booking.email}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-dark/60" />
                  <span className="text-dark">
                    {bookingData?.mobileNo || booking.phone}
                  </span>
                </div>
                {bookingData && (
                  <>
                    <div>
                      <span className="text-sm text-dark/60">Address:</span>
                      <p className="text-dark">
                        {bookingData.address}, {bookingData.city}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-dark/60">ID Proof:</span>
                      <p className="text-dark">
                        {bookingData.idProofType}: {bookingData.idProofNumber}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {/* Room Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-dark flex items-center">
              <BedDouble className="w-4 h-4 mr-2" />
              Room Information
            </h4>
            {loading && !bookingData ? (
              <div className="flex justify-center">
                <Loader className="w-5 h-5 text-secondary animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-dark/60">Room:</span>
                  <p className="font-medium text-dark">
                    Room {bookingData?.roomNo || booking.roomNumber}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-dark/60">Check-in:</span>
                  <p className="text-dark">
                    {bookingData
                      ? `${new Date(
                          bookingData.checkInDate
                        ).toLocaleDateString()} (${bookingData.timeIn})`
                      : booking.checkIn}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-dark/60">Check-out:</span>
                  <p className="text-dark">
                    {bookingData
                      ? `${new Date(
                          bookingData.checkOutDate
                        ).toLocaleDateString()} (${bookingData.timeOut})`
                      : booking.checkOut}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-dark/60">Guests:</span>
                  <p className="text-dark">
                    {bookingData
                      ? `${bookingData.noOfAdults} Adults, ${bookingData.noOfChildren} Children`
                      : `${booking.adults} Adults, ${booking.children} Children`}
                  </p>
                </div>
                {bookingData && (
                  <div>
                    <span className="text-sm text-dark/60">Rate:</span>
                    <p className="text-dark">₹{bookingData.rate}/night</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        {loading && !bookingData ? (
          <div className="flex justify-center">
            <Loader className="w-5 h-5 text-secondary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-dark/60">Total Amount:</span>
              <p className="font-bold text-dark">
                ₹
                {bookingData
                  ? bookingData.rate * bookingData.days
                  : booking.totalAmount}
              </p>
            </div>
            <div>
              <span className="text-sm text-dark/60">Payment Method:</span>
              <p className="text-dark capitalize">
                {bookingData?.paymentMode || booking.paymentMethod}
              </p>
            </div>
            <div>
              <span className="text-sm text-dark/60">Payment Status:</span>
              <p className="text-dark capitalize">
                {bookingData?.paymentStatus || booking.paymentStatus}
              </p>
            </div>
            {bookingData?.discountPercent > 0 && (
              <div>
                <span className="text-sm text-dark/60">Discount:</span>
                <p className="text-dark">{bookingData.discountPercent}%</p>
              </div>
            )}
          </div>
        )}

        {/* Special Requests */}
        {(bookingData?.remark || booking.specialRequests) && (
          <div className="mt-6">
            <h4 className="font-medium text-dark mb-2">
              {bookingData?.remark ? "Remarks" : "Special Requests"}
            </h4>
            <p className="text-dark bg-primary/20 p-3 rounded-lg">
              {bookingData?.remark || booking.specialRequests}
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
                disabled={loading}
              >
                <option value="Booked">Booked</option>
                <option value="Checked In">Checked In</option>
                <option value="Checked Out">Checked Out</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                onClick={handleUpdateStatus}
                className="bg-secondary text-dark px-4 py-2 rounded-lg hover:shadow-md flex items-center"
                disabled={status === booking.status || loading}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
