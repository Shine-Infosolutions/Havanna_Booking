// src/pages/NewBooking.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  Home,
  Briefcase,
  CreditCard,
} from "lucide-react";
import { STORAGE_KEYS, getStoredData, storeData } from "../utils/LocalStorage";

const BACKEND_URL =
  import.meta.env.BACKEND_URL || "https://havana-backend.vercel.app";

const NewBooking = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [formData, setFormData] = useState({
    // Primary Booking Info
    grcNo: "",
    bookingDate: new Date().toISOString().split("T")[0],
    checkInDate: "",
    checkOutDate: "",
    days: 1,
    timeIn: "12:00",
    timeOut: "10:00",

    // Guest Info
    salutation: "Mr",
    name: "",
    age: "",
    gender: "Male",
    address: "",
    city: "",
    nationality: "Indian",
    mobileNo: "",
    email: "",
    phoneNo: "",
    birthDate: "",
    anniversary: "",

    // Company Info
    companyName: "",
    companyGSTIN: "",

    // ID & Images
    idProofType: "",
    idProofNumber: "",
    idProofImageUrl: "",
    idProofImageUrl2: "",
    photoUrl: "",

    // Room Plan Info
    roomNo: "",
    planPackage: "",
    noOfAdults: 1,
    noOfChildren: 0,
    rate: 0,
    taxIncluded: false,
    serviceCharge: false,
    isLeader: false,

    // Travel & Source Info
    arrivedFrom: "",
    destination: "",
    remark: "",
    businessSource: "",
    marketSegment: "",
    purposeOfVisit: "",

    // Financial Info
    discountPercent: 0,
    discountRoomSource: 0,
    paymentMode: "Cash",
    paymentStatus: "Pending",
    upfrontPayment: 0,
    bookingRefNo: "",
    mgmtBlock: "No",
    billingInstruction: "",

    // Misc
    temperature: "",
    fromCSV: false,
    epabx: false,
    vip: false,
    status: "Booked",
  });

  useEffect(() => {
    // Load available rooms
    const storedRooms = getStoredData(STORAGE_KEYS.ROOMS) || [];
    setRooms(storedRooms.filter((room) => room.status === "available"));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Calculate days when check-in or check-out dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      if (days > 0) {
        setFormData((prev) => ({
          ...prev,
          days,
        }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Update rate when room is selected
  useEffect(() => {
    if (formData.roomNo) {
      const selectedRoom = rooms.find(
        (room) => room.number === formData.roomNo
      );
      if (selectedRoom) {
        setFormData((prev) => ({
          ...prev,
          rate: selectedRoom.price,
        }));
      }
    }
  }, [formData.roomNo, rooms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);

    try {
      // Generate a unique booking ID
      const bookingId = Date.now();
      const selectedRoom = rooms.find(
        (room) => room.number === formData.roomNo
      );

      if (!selectedRoom) {
        alert("Please select a valid room");
        setLoading(false);
        return;
      }

      // Create booking object
      const booking = {
        ...formData,
        roomId: selectedRoom.id,
        roomType: selectedRoom.type,
        roomNumber: selectedRoom.number,
        totalAmount: formData.rate * formData.days,
      };

      // Send booking data to backend API
      const response = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(booking),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const data = await response.json();

      // Update room status
      const existingRooms = getStoredData(STORAGE_KEYS.ROOMS) || [];
      const updatedRooms = existingRooms.map((room) => {
        if (room.number === formData.roomNo) {
          return { ...room, status: "occupied", guest: formData.name };
        }
        return room;
      });
      storeData(STORAGE_KEYS.ROOMS, updatedRooms);

      // Navigate back to bookings page
      navigate("/bookings");
    } catch (error) {
      console.error("Error creating booking:", error);
      setApiError(
        error.message || "Failed to create booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate total amount
  const totalAmount = formData.rate * formData.days;

  return (
    <div className="p-6  min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full bg-white/50 hover:bg-white/80"
        >
          <ArrowLeft className="w-5 h-5 text-dark" />
        </button>
        <h2 className="text-2xl font-bold text-dark">New Booking</h2>
      </div>

      {apiError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Primary Booking Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <Calendar className="w-5 h-5 mr-2" />
            Booking Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                GRC Number
              </label>
              <input
                type="text"
                name="grcNo"
                value={formData.grcNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Booking Date
              </label>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              >
                <option value="Booked">Booked</option>
                <option value="Checked In">Checked In</option>
                <option value="Checked Out">Checked Out</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
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
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleInputChange}
                min={
                  formData.checkInDate || new Date().toISOString().split("T")[0]
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Number of Days
              </label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Check-in Time
              </label>
              <input
                type="time"
                name="timeIn"
                value={formData.timeIn}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Check-out Time
              </label>
              <input
                type="time"
                name="timeOut"
                value={formData.timeOut}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <User className="w-5 h-5 mr-2" />
            Guest Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Salutation
              </label>
              <select
                name="salutation"
                value={formData.salutation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Alternate Number
              </label>
              <input
                type="tel"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Anniversary
              </label>
              <input
                type="date"
                name="anniversary"
                value={formData.anniversary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>

        {/* ID Proof */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <User className="w-5 h-5 mr-2" />
            ID Proof
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                ID Proof Type
              </label>
              <select
                name="idProofType"
                value={formData.idProofType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Select ID Type</option>
                <option value="Aadhar">Aadhar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                ID Proof Number
              </label>
              <input
                type="text"
                name="idProofNumber"
                value={formData.idProofNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <Briefcase className="w-5 h-5 mr-2" />
            Company Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Company GSTIN
              </label>
              <input
                type="text"
                name="companyGSTIN"
                value={formData.companyGSTIN}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>

        {/* Room Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <Home className="w-5 h-5 mr-2" />
            Room Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Room Number
              </label>
              <select
                name="roomNo"
                value={formData.roomNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              >
                <option value="">Select Room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.number}>
                    Room {room.number} - {room.type} (₹{room.price}/night)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Plan/Package
              </label>
              <input
                type="text"
                name="planPackage"
                value={formData.planPackage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Rate (per night)
              </label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Number of Adults
              </label>
              <input
                type="number"
                name="noOfAdults"
                value={formData.noOfAdults}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Number of Children
              </label>
              <input
                type="number"
                name="noOfChildren"
                value={formData.noOfChildren}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div className="flex items-center space-x-4 mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="taxIncluded"
                  name="taxIncluded"
                  checked={formData.taxIncluded}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="taxIncluded" className="text-sm text-dark/70">
                  Tax Included
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="serviceCharge"
                  name="serviceCharge"
                  checked={formData.serviceCharge}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="serviceCharge" className="text-sm text-dark/70">
                  Service Charge
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Payment Mode
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
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
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {formData.paymentStatus === "Partial" && (
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Upfront Payment (₹)
                </label>
                <input
                  type="number"
                  name="upfrontPayment"
                  value={formData.upfrontPayment}
                  onChange={handleInputChange}
                  min="0"
                  max={totalAmount}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Booking Reference No.
              </label>
              <input
                type="text"
                name="bookingRefNo"
                value={formData.bookingRefNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discountPercent"
                value={formData.discountPercent}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Management Block
              </label>
              <select
                name="mgmtBlock"
                value={formData.mgmtBlock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark mb-4">
            Additional Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Arrived From
              </label>
              <input
                type="text"
                name="arrivedFrom"
                value={formData.arrivedFrom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Destination
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Purpose of Visit
              </label>
              <input
                type="text"
                name="purposeOfVisit"
                value={formData.purposeOfVisit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Business Source
              </label>
              <input
                type="text"
                name="businessSource"
                value={formData.businessSource}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Remarks
              </label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Billing Instructions
              </label>
              <textarea
                name="billingInstruction"
                value={formData.billingInstruction}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              ></textarea>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="vip"
                name="vip"
                checked={formData.vip}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="vip" className="text-sm text-dark/70">
                VIP Guest
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="epabx"
                name="epabx"
                checked={formData.epabx}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="epabx" className="text-sm text-dark/70">
                EPABX
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isLeader"
                name="isLeader"
                checked={formData.isLeader}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="isLeader" className="text-sm text-dark/70">
                Group Leader
              </label>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-secondary/80 backdrop-blur-sm p-6 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-dark">Total Amount:</span>
            <span className="text-xl font-bold text-dark">₹{totalAmount}</span>
          </div>

          {formData.paymentStatus === "Partial" && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-dark/10">
              <span className="font-medium text-dark">Balance Due:</span>
              <span className="text-lg font-bold text-dark">
                ₹{totalAmount - formData.upfrontPayment}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-secondary text-dark rounded-lg hover:shadow-lg transition-shadow font-medium flex items-center"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Create Booking
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBooking;
