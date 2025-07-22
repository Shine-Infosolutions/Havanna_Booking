// src/pages/NewBooking.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  Home,
  Briefcase,
  CreditCard,
  Loader,
  Upload,
  X,
} from "lucide-react";

const NewBooking = () => {
  const { BACKEND_URL, categories } = useContext(AppContext);
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
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

  // Fetch booking data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchBookingData = async () => {
        try {
          setInitialLoading(true);
          const response = await axios.get(`${BACKEND_URL}/api/bookings/${id}`);

          if (response.data.success) {
            // Format dates for form inputs
            const booking = response.data.booking;

            // Convert date strings to input format (YYYY-MM-DD)
            const formatDate = (dateString) => {
              if (!dateString) return "";
              return new Date(dateString).toISOString().split("T")[0];
            };

            setFormData({
              ...booking,
              bookingDate: formatDate(booking.bookingDate),
              checkInDate: formatDate(booking.checkInDate),
              checkOutDate: formatDate(booking.checkOutDate),
              birthDate: formatDate(booking.birthDate),
              anniversary: formatDate(booking.anniversary),
              roomNo: booking.roomNumber || booking.roomNo,
            });
          }
        } catch (error) {
          console.error("Error fetching booking:", error);
          setApiError("Failed to load booking data");
        } finally {
          setInitialLoading(false);
        }
      };

      fetchBookingData();
    }
  }, [id, isEditMode, BACKEND_URL]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (selectedCategory) {
          params.append("category", selectedCategory);
        }

        params.append("status", "true"); // Only get available rooms

        const response = await axios.get(
          `${BACKEND_URL}/api/rooms?${params.toString()}`
        );

        if (response.data.success) {
          setRooms(response.data.rooms);
          setFilteredRooms(response.data.rooms);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setApiError("Failed to load available rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [selectedCategory, BACKEND_URL]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for room selection to update the rate
    if (name === "roomNo") {
      const selectedRoom = filteredRooms.find(
        (room) => room.room_number === value
      );
      if (selectedRoom) {
        setFormData({
          ...formData,
          [name]: value,
          rate: selectedRoom.price, // Update the rate based on selected room
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      // Normal handling for other inputs
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
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
  // useEffect(() => {
  //   if (formData.roomNo) {
  //     const selectedRoom = rooms.find(
  //       (room) => room.number === formData.roomNo
  //     );
  //     if (selectedRoom) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         rate: selectedRoom.price,
  //       }));
  //     }
  //   }
  // }, [formData.roomNo, rooms]);

  const handleGuestPhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        photoUrl: imageUrl,
        photoFile: file,
      });
    }
  };

  const removeGuestPhoto = () => {
    URL.revokeObjectURL(formData.photoUrl);
    setFormData({
      ...formData,
      photoUrl: "",
      photoFile: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);

    try {
      const selectedRoom = filteredRooms.find(
        (room) => room.room_number === formData.roomNo
      );

      if (!selectedRoom && !isEditMode) {
        alert("Please select a valid room");
        setLoading(false);
        return;
      }

      // Create form data for file upload
      const formDataToSend = new FormData();

      // Add basic booking details
      formDataToSend.append("bookingDate", formData.bookingDate);
      formDataToSend.append("checkInDate", formData.checkInDate);
      formDataToSend.append("checkOutDate", formData.checkOutDate);
      formDataToSend.append("days", formData.days);
      formDataToSend.append("timeIn", formData.timeIn);
      formDataToSend.append("timeOut", formData.timeOut);

      // Guest info
      formDataToSend.append("salutation", formData.salutation);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("age", formData.age || 0);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("nationality", formData.nationality);
      formDataToSend.append("mobileNo", formData.mobileNo);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phoneNo", formData.phoneNo);
      formDataToSend.append("birthDate", formData.birthDate);
      formDataToSend.append("anniversary", formData.anniversary);

      // Company info
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("companyGSTIN", formData.companyGSTIN);

      // ID proof
      formDataToSend.append("idProofType", formData.idProofType);
      formDataToSend.append("idProofNumber", formData.idProofNumber);

      // Room info
      formDataToSend.append("roomNo", formData.roomNo);
      formDataToSend.append("planPackage", formData.planPackage);
      formDataToSend.append("noOfAdults", formData.noOfAdults);
      formDataToSend.append("noOfChildren", formData.noOfChildren);
      formDataToSend.append("rate", formData.rate);
      formDataToSend.append("taxIncluded", formData.taxIncluded);
      formDataToSend.append("serviceCharge", formData.serviceCharge);
      formDataToSend.append("isLeader", formData.isLeader);

      // Travel info
      formDataToSend.append("arrivedFrom", formData.arrivedFrom);
      formDataToSend.append("destination", formData.destination);
      formDataToSend.append("remark", formData.remark);
      formDataToSend.append("businessSource", formData.businessSource);
      formDataToSend.append("marketSegment", formData.marketSegment);
      formDataToSend.append("purposeOfVisit", formData.purposeOfVisit);

      // Financial info
      formDataToSend.append("discountPercent", formData.discountPercent);
      formDataToSend.append("discountRoomSource", formData.discountRoomSource);
      formDataToSend.append("paymentMode", formData.paymentMode);
      formDataToSend.append("paymentStatus", formData.paymentStatus);
      formDataToSend.append("bookingRefNo", formData.bookingRefNo);
      formDataToSend.append("mgmtBlock", formData.mgmtBlock);
      formDataToSend.append("billingInstruction", formData.billingInstruction);

      // Misc
      formDataToSend.append("temperature", formData.temperature || 0);
      formDataToSend.append("fromCSV", formData.fromCSV);
      formDataToSend.append("epabx", formData.epabx);
      formDataToSend.append("vip", formData.vip);
      formDataToSend.append("status", formData.status);

      // Add room details
      formDataToSend.append(
        "roomId",
        selectedRoom?._id || formData.roomId || ""
      );
      formDataToSend.append(
        "roomType",
        selectedRoom?.category?.category || formData.roomType || ""
      );
      formDataToSend.append(
        "roomNumber",
        selectedRoom?.room_number || formData.roomNumber || formData.roomNo
      );
      formDataToSend.append("totalAmount", calculateTotal());

      // Add image files with the EXACT field names expected by the backend
      if (formData.idProofImageFile) {
        formDataToSend.append("idProofImageUrl", formData.idProofImageFile);
      }

      if (formData.idProofImageFile2) {
        formDataToSend.append("idProofImageUrl2", formData.idProofImageFile2);
      }

      // Add guest photo if available
      if (formData.photoFile) {
        formDataToSend.append("photoUrl", formData.photoFile);
      }

      let response;

      if (isEditMode) {
        // Update existing booking
        response = await axios.put(
          `${BACKEND_URL}/api/bookings/${id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Create new booking
        response = await axios.post(
          `${BACKEND_URL}/api/bookings/book`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.data.success) {
        // Navigate back to bookings page
        navigate("/bookings");
      } else {
        throw new Error(
          response.data.message ||
            `Failed to ${isEditMode ? "update" : "create"} booking`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} booking:`,
        error
      );
      setApiError(
        error.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } booking. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleIdProofImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        idProofImageUrl: imageUrl,
        idProofImageFile: file,
      });
    }
  };

  const handleIdProofImage2Upload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        idProofImageUrl2: imageUrl,
        idProofImageFile2: file, // Store the file for later upload
      });
    }
  };

  const removeIdProofImage = (imageNum) => {
    if (imageNum === 1) {
      URL.revokeObjectURL(formData.idProofImageUrl); // Clean up the URL
      setFormData({
        ...formData,
        idProofImageUrl: "",
        idProofImageFile: null,
      });
    } else {
      URL.revokeObjectURL(formData.idProofImageUrl2); // Clean up the URL
      setFormData({
        ...formData,
        idProofImageUrl2: "",
        idProofImageFile2: null,
      });
    }
  };

  // Calculate total amount with discount
  const calculateTotal = () => {
    const baseAmount = formData.rate * formData.days;
    if (formData.discountPercent > 0) {
      const discountAmount = (baseAmount * formData.discountPercent) / 100;
      return baseAmount - discountAmount;
    }
    return baseAmount;
  };

  const totalAmount = calculateTotal();

  // Update the page title and button text based on mode
  const pageTitle = isEditMode ? "Edit Booking" : "New Booking";
  const submitButtonText = isEditMode ? "Update Booking" : "Create Booking";

  // Show loading state while fetching booking data
  if (initialLoading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-12 h-12 text-secondary animate-spin" />
          <span className="mt-4 text-dark">Loading booking data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6  min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full bg-white/50 hover:bg-white/80"
        >
          <ArrowLeft className="w-5 h-5 text-dark" />
        </button>
        <h2 className="text-2xl font-bold text-dark">{pageTitle}</h2>
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
            <div className="col-span-3 mt-4">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Guest Photo
              </label>
              {formData.photoUrl ? (
                <div className="relative h-40 w-40 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.photoUrl}
                    alt="Guest Photo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeGuestPhoto}
                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">Upload guest photo</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleGuestPhotoUpload}
                  />
                </label>
              )}
            </div>
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
            {/* ID Proof Image Upload - Front */}
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                ID Proof Image (Front)
              </label>
              {formData.idProofImageUrl ? (
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.idProofImageUrl}
                    alt="ID Proof Front"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeIdProofImage(1)}
                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">Upload front side</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleIdProofImageUpload}
                  />
                </label>
              )}
            </div>

            {/* ID Proof Image Upload - Back */}
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                ID Proof Image (Back)
              </label>
              {formData.idProofImageUrl2 ? (
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.idProofImageUrl2}
                    alt="ID Proof Back"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeIdProofImage(2)}
                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">Upload back side</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleIdProofImage2Upload}
                  />
                </label>
              )}
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
                Room Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.category}
                  </option>
                ))}
              </select>
            </div>
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
                {filteredRooms.map((room) => (
                  <option key={room._id} value={room.room_number}>
                    Room {room.room_number} -{" "}
                    {room.category?.category || "Standard"} (₹{room.price}
                    /night)
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
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Market Segment
              </label>
              <select
                name="marketSegment"
                value={formData.marketSegment}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Select Market Segment</option>
                <option value="Corporate">Corporate</option>
                <option value="Leisure">Leisure</option>
                <option value="Group">Group</option>
                <option value="Travel Agent">Travel Agent</option>
                <option value="Online">Online</option>
                <option value="Direct">Direct</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Temperature (°F)
              </label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                step="0.1"
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
            <span className="font-medium text-dark">Base Amount:</span>
            <span className="text-lg font-medium text-dark">
              ₹{formData.rate * formData.days}
            </span>
          </div>

          {formData.discountPercent > 0 && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-dark/10">
              <span className="font-medium text-dark">
                Discount ({formData.discountPercent}%):
              </span>
              <span className="text-lg font-medium text-red-600">
                -₹
                {(formData.rate * formData.days * formData.discountPercent) /
                  100}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mt-2 pt-2 border-t border-dark/10">
            <span className="font-medium text-dark">Total Amount:</span>
            <span className="text-xl font-bold text-dark">₹{totalAmount}</span>
          </div>
          {formData.paymentStatus === "Partial" && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-dark/10">
              <span className="font-medium text-dark">Upfront Payment:</span>
              <span className="text-lg font-bold text-dark">
                ₹{formData.upfrontPayment}
              </span>
            </div>
          )}
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
                {submitButtonText}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBooking;
