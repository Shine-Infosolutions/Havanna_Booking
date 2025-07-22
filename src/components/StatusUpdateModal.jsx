import React, { useState, useEffect } from "react";
import { Loader, Check, X } from "lucide-react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const StatusUpdateModal = ({ booking, onClose, onUpdate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  const handleUpdateStatus = async () => {
    if (status === booking.status) return handleClose();

    try {
      setLoading(true);
      const response = await axios.patch(
        `${BACKEND_URL}/api/bookings/${booking._id}/status`,
        { status }
      );

      // Create updated booking object with new status
      const updatedBooking = { ...booking, status };
      onUpdate(updatedBooking);

      // Close modal after successful update
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (error) {
      console.error("Error updating booking status:", error);
      setError(
        error.response?.data?.message || "Failed to update booking status"
      );
    } finally {
      setLoading(false);
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
        className={`bg-white rounded-lg p-4 w-full max-w-sm mx-4 transition-all duration-200 ease-out transform ${
          isVisible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-dark">Update Status</h3>
          <button
            onClick={handleClose}
            className="text-dark/60 hover:text-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-dark/70 mb-1">Booking Details:</p>
          <p className="font-medium">
            {booking.salutation} {booking.name} - Room {booking.roomNo}
          </p>
          <p className="text-sm text-dark/70">
            {new Date(booking.checkInDate).toLocaleDateString()} to{" "}
            {new Date(booking.checkOutDate).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-dark/70 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="Booked">Booked</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-dark/70 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={loading}
            className="px-4 py-2 bg-secondary text-dark rounded-lg hover:shadow-md flex items-center"
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
  );
};

export default StatusUpdateModal;
