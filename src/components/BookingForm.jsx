// src/components/BookingForm.jsx
import React, { useState, useEffect } from "react";
import { X, Check, Calendar } from "lucide-react";
import { STORAGE_KEYS, getStoredData, storeData } from "../utils/LocalStorage";

const BookingForm = ({ onSubmit, onCancel }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    guestName: "",
    email: "",
    phone: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    paymentMethod: "cash",
    paymentStatus: "pending",
    specialRequests: "",
  });

  useEffect(() => {
    // Load available rooms
    const storedRooms = getStoredData(STORAGE_KEYS.ROOMS) || [];
    setRooms(storedRooms.filter((room) => room.status === "available"));

    // Animation
    setIsVisible(true);

    return () => {
      setIsVisible(false);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const calculateTotalAmount = () => {
    if (!formData.roomId || !formData.checkIn || !formData.checkOut) return 0;

    const room = rooms.find((r) => r.id.toString() === formData.roomId);
    if (!room) return 0;

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    return room.price * nights;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const totalAmount = calculateTotalAmount();
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);

    // Create booking object
    const booking = {
      id: Date.now(),
      guestName: formData.guestName,
      email: formData.email,
      phone: formData.phone,
      roomId: parseInt(formData.roomId),
      roomNumber:
        rooms.find((r) => r.id.toString() === formData.roomId)?.number || "",
      roomType:
        rooms.find((r) => r.id.toString() === formData.roomId)?.type || "",
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights: Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
      adults: parseInt(formData.adults),
      children: parseInt(formData.children),
      totalAmount,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      specialRequests: formData.specialRequests,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existingBookings = getStoredData(STORAGE_KEYS.BOOKINGS) || [];
    const updatedBookings = [booking, ...existingBookings];
    storeData(STORAGE_KEYS.BOOKINGS, updatedBookings);

    // Update room status
    const existingRooms = getStoredData(STORAGE_KEYS.ROOMS) || [];
    const updatedRooms = existingRooms.map((room) => {
      if (room.id.toString() === formData.roomId) {
        return { ...room, status: "occupied", guest: formData.guestName };
      }
      return room;
    });
    storeData(STORAGE_KEYS.ROOMS, updatedRooms);

    // Submit to parent
    onSubmit(booking);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onCancel();
    }, 200);
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-dark flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            New Booking
          </h3>
          <button
            onClick={handleClose}
            className="text-dark/60 hover:text-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guest Information */}
            <div>
              <h4 className="font-medium text-dark mb-2">Guest Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-dark/70 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark/70 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark/70 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h4 className="font-medium text-dark mb-2">Booking Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-dark/70 mb-1">
                    Room
                  </label>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  >
                    <option value="">Select a room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        Room {room.number} - {room.type} (₹{room.price}/night)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleInputChange}
                      min={
                        formData.checkIn ||
                        new Date().toISOString().split("T")[0]
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">
                      Adults
                    </label>
                    <input
                      type="number"
                      name="adults"
                      value={formData.adults}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">
                      Children
                    </label>
                    <input
                      type="number"
                      name="children"
                      value={formData.children}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h4 className="font-medium text-dark mb-2">Payment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partially Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            ></textarea>
          </div>

          {/* Total Amount */}
          <div className="bg-primary/30 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-dark">Total Amount:</span>
              <span className="text-xl font-bold text-dark">
                ₹{calculateTotalAmount()}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-dark/70 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-dark rounded-lg hover:shadow-md flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
