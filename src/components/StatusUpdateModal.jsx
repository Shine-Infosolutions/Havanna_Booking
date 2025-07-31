import React, { useState, useEffect, useContext } from "react";
import { Loader, Check, X } from "lucide-react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const StatusUpdateModal = ({
  booking,
  onClose,
  onUpdate,
  type = "booking",
}) => {
  const { BACKEND_URL } = useContext(AppContext);
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const [loading, setLoading] = useState(false);

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

      // Determine API endpoint
      const endpoint =
        type === "reservation"
          ? `${BACKEND_URL}/api/reservation/${booking._id}`
          : `${BACKEND_URL}/api/bookings/update/${booking._id}`;

      const response = await axios.put(endpoint, { status });

      // Create updated object with new status
      const updatedItem = { ...booking, status };
      onUpdate(updatedItem);

      // Close modal after successful update
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update booking status"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get status options based on type
  const getStatusOptions = () => {
    if (type === "reservation") {
      return [
        <option key="Confirmed" value="Confirmed">
          Confirmed
        </option>,
        <option key="Tentative" value="Tentative">
          Tentative
        </option>,
        <option key="Waiting" value="Waiting">
          Waiting
        </option>,
        <option key="Cancelled" value="Cancelled">
          Cancelled
        </option>,
      ];
    } else {
      return [
        <option key="Booked" value="Booked">
          Booked
        </option>,
        <option key="Checked In" value="Checked In">
          Checked In
        </option>,
        <option key="Checked Out" value="Checked Out">
          Checked Out
        </option>,
        <option key="Cancelled" value="Cancelled">
          Cancelled
        </option>,
      ];
    }
  };

  // Get display name and room info
  const getDisplayInfo = () => {
    if (type === "reservation") {
      return {
        name: `${booking.salutation || ""} ${
          booking.guestName || booking.name || ""
        }`,
        room: booking.roomAssigned?.room_number || booking.roomNo || "N/A",
        checkIn: booking.checkInDate,
        checkOut: booking.checkOutDate,
      };
    } else {
      return {
        name: `${booking.salutation || ""} ${booking.name || ""}`,
        room: booking.roomNo || booking.roomNumber || "N/A",
        checkIn: booking.checkInDate,
        checkOut: booking.checkOutDate,
      };
    }
  };

  const displayInfo = getDisplayInfo();

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



        <div className="mb-4">
          <p className="text-sm text-dark/70 mb-1">
            {type === "reservation" ? "Reservation" : "Booking"} Details:
          </p>
          <p className="font-medium">
            {displayInfo.name} - Room {displayInfo.room}
          </p>
          <p className="text-sm text-dark/70">
            {new Date(displayInfo.checkIn).toLocaleDateString()} to{" "}
            {new Date(displayInfo.checkOut).toLocaleDateString()}
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
            {getStatusOptions()}
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
