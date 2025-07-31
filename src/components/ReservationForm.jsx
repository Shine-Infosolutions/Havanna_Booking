// src/pages/ReservationForm.jsx
import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import {
  ArrowLeft,
  Loader,
  Calendar,
  User,
  CreditCard,
  Truck,
  Check,
} from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ReservationForm = () => {
  const { BACKEND_URL, categories } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [assignedRoom, setAssignedRoom] = useState(null);

  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    grcNo: "",
    bookingRefNo: "",
    reservationType: "Walk-in",
    modeOfReservation: "",
    category: "",
    // bookingDate: "",
    status: "Confirmed",
    linkedCheckInId: null,

    // Guest Details
    salutation: "Mr",
    guestName: "",
    nationality: "Indian",
    city: "",
    address: "",
    phoneNo: "",
    mobileNo: "",
    email: "",
    companyName: "",
    gstApplicable: true,
    companyGSTIN: "",

    // Stay Info
    roomHoldStatus: "Pending",
    roomAssigned: "",
    roomHoldUntil: "",
    checkInDate: "",
    checkInTime: "12:00",
    checkOutDate: "",
    checkOutTime: "10:00",
    noOfRooms: 1,
    noOfAdults: 1,
    noOfChildren: 0,
    planPackage: "EP",
    rate: "",

    arrivalFrom: "",
    purposeOfVisit: "Leisure",

    roomPreferences: {
      smoking: false,
      bedType: "King",
    },

    specialRequests: "",
    remarks: "",
    billingInstruction: "",

    // Payment Info
    paymentMode: "Cash",
    refBy: "",
    advancePaid: 0,
    isAdvancePaid: false,
    transactionId: "",
    discountPercent: 0,

    // Vehicle Details
    vehicleDetails: {
      vehicleNumber: "",
      vehicleType: "",
      vehicleModel: "",
      driverName: "",
      driverMobile: "",
    },

    vip: false,
    isForeignGuest: false,
    cancellationReason: "",
    cancelledBy: "",
    isNoShow: false,
  });

  // Fetch reservation data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchReservation = async () => {
        try {
          setInitialLoading(true);
          const response = await axios.get(
            `${BACKEND_URL}/api/reservation/${id}`
          );

          if (response.data.success) {
            const reservation = response.data.reservation;

            // Format dates for form inputs
            const formattedData = {
              ...reservation,
              category: reservation.category?._id || "",
              roomAssigned: reservation.roomAssigned?._id || "",
              bookingDate: reservation.bookingDate
                ? new Date(reservation.bookingDate).toISOString().split("T")[0]
                : "",
              checkInDate: reservation.checkInDate
                ? new Date(reservation.checkInDate).toISOString().split("T")[0]
                : "",
              checkOutDate: reservation.checkOutDate
                ? new Date(reservation.checkOutDate).toISOString().split("T")[0]
                : "",
              roomHoldUntil: reservation.roomHoldUntil
                ? new Date(reservation.roomHoldUntil)
                    .toISOString()
                    .split("T")[0]
                : "",
            };

            setFormData(formattedData);

            // Set selected category for room filtering
            if (reservation.category?._id) {
              setSelectedCategory(reservation.category._id);
            }

            // Store assigned room separately for edit mode
            if (reservation.roomAssigned) {
              setAssignedRoom({
                _id: reservation.roomAssigned._id,
                room_number: reservation.roomAssigned.room_number,
                title: reservation.roomAssigned.title,
                price: reservation.roomAssigned.price,
              });
            }
          } else {
            toast.error("Failed to load reservation data");
          }
        } catch (err) {
          toast.error("An error occurred while loading reservation data");
          console.error(err);
        } finally {
          setInitialLoading(false);
        }
      };

      fetchReservation();
    }
  }, [id, isEditMode, BACKEND_URL]);

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        if (formData.checkInDate) {
          params.append("checkInDate", formData.checkInDate);
        }
        if (formData.checkOutDate) {
          params.append("checkOutDate", formData.checkOutDate);
        }

        const url = `${BACKEND_URL}/api/rooms/available${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const response = await axios.get(url);

        if (response.data.success) {
          setRooms(response.data.availableRooms);

          // Filter rooms based on selected category
          let categoryRooms = [];
          if (selectedCategory) {
            const categoryGroup = response.data.availableRooms.find(
              (group) => group.categoryId === selectedCategory
            );
            categoryRooms = categoryGroup ? categoryGroup.rooms : [];
          } else {
            // Show all rooms if no category selected
            categoryRooms = response.data.availableRooms.flatMap(
              (group) => group.rooms
            );
          }

          // In edit mode, add the assigned room to the list if it's not already there
          if (isEditMode && assignedRoom) {
            const roomExists = categoryRooms.find(
              (room) => room._id === assignedRoom._id
            );
            if (!roomExists) {
              categoryRooms.unshift(assignedRoom);
            }
          }

          setFilteredRooms(categoryRooms);
        }
      } catch (error) {
        console.error("Error fetching available rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableRooms();
  }, [
    selectedCategory,
    formData.checkInDate,
    formData.checkOutDate,
    BACKEND_URL,
    isEditMode,
    assignedRoom,
  ]);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);

    // Update form data
    setFormData((prev) => ({
      ...prev,
      category: categoryId,
      roomAssigned: "", // Reset room selection when category changes
    }));
  };

  const handleGrcChange = async (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      grcNo: value,
    }));

    // Only fetch if GRC number has at least 4 characters
    if (value.length >= 4) {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/guests/${value}`);

        if (response.data.success) {
          const guest = response.data.guest;

          // Map guest details to reservation form fields
          setFormData((prev) => ({
            ...prev,
            grcNo: value,
            bookingRefNo: guest.bookingRefNo || prev.bookingRefNo,
            salutation: guest.salutation || prev.salutation,
            guestName: guest.name || prev.guestName,
            nationality: guest.contactDetails?.country || prev.nationality,
            city: guest.contactDetails?.city || prev.city,
            address: guest.contactDetails?.address || prev.address,
            phoneNo: guest.contactDetails?.phone || prev.phoneNo,
            mobileNo: guest.contactDetails?.phone || prev.mobileNo,
            email: guest.contactDetails?.email || prev.email,
          }));
        }
      } catch (error) {
        console.log("Guest not found or error fetching guest details");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "roomAssigned") {
      // Find the selected room and set its price as the rate
      const selectedRoom = filteredRooms.find((room) => room._id === value);

      setFormData({
        ...formData,
        roomAssigned: value,
        rate: selectedRoom ? selectedRoom.price : formData.rate,
      });
    } else if (name.includes(".")) {
      // Handle nested properties (e.g., vehicleDetails.vehicleNumber)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a copy of the form data to modify before sending
      const submissionData = { ...formData };

      // Remove empty ObjectId fields that would cause BSON errors
      if (submissionData.roomAssigned === "") {
        delete submissionData.roomAssigned;
      }

      // Also handle category field which is another ObjectId
      if (submissionData.category === "") {
        delete submissionData.category;
      }

      const url = isEditMode
        ? `${BACKEND_URL}/api/reservation/${id}`
        : `${BACKEND_URL}/api/reservation`;

      const method = isEditMode ? "put" : "post";

      const response = await axios[method](url, submissionData);

      if (response.data.success) {
        navigate("/reservations");
      } else {
        toast.error(response.data.message || "Failed to save reservation");
      }
    } catch (err) {
      toast.error("An error occurred while saving the reservation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 1;
    }
    return 1;
  };

  const calculateSubtotal = () => {
    const days = calculateDays();
    const rate = formData.rate || 0;
    return rate * days * formData.noOfRooms;
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountPercent = formData.discountPercent || 0;
    return (subtotal * discountPercent) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    const advance = formData.advancePaid || 0;
    return total - advance;
  };

  if (initialLoading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-12 h-12 text-secondary animate-spin" />
          <span className="mt-4 text-dark">Loading reservation data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full bg-white/50 hover:bg-white/80"
        >
          <ArrowLeft className="w-5 h-5 text-dark" />
        </button>
        <h2 className="text-2xl font-bold text-dark">
          {isEditMode ? "Edit Reservation" : "New Reservation"}
        </h2>
      </div>



      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "basic"
              ? "border-b-2 border-secondary text-dark"
              : "text-dark/60"
          }`}
          onClick={() => setActiveTab("basic")}
        >
          Basic Info
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "guest"
              ? "border-b-2 border-secondary text-dark"
              : "text-dark/60"
          }`}
          onClick={() => setActiveTab("guest")}
        >
          Guest Details
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "stay"
              ? "border-b-2 border-secondary text-dark"
              : "text-dark/60"
          }`}
          onClick={() => setActiveTab("stay")}
        >
          Stay Info
        </button>

        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "vehicle"
              ? "border-b-2 border-secondary text-dark"
              : "text-dark/60"
          }`}
          onClick={() => setActiveTab("vehicle")}
        >
          Vehicle
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "payment"
              ? "border-b-2 border-secondary text-dark"
              : "text-dark/60"
          }`}
          onClick={() => setActiveTab("payment")}
        >
          Payment
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Reservation Info */}
        {activeTab === "basic" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
            <h4 className="font-medium mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Reservation Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  GRC Number*
                </label>
                <input
                  type="text"
                  name="grcNo"
                  value={formData.grcNo}
                  onChange={handleGrcChange}
                  placeholder="Have GRC number?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Booking Reference
                </label>
                <input
                  type="text"
                  name="bookingRefNo"
                  value={formData.bookingRefNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Reservation Type
                </label>
                <select
                  name="reservationType"
                  value={formData.reservationType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Walk-in">Walk-in</option>
                  <option value="Online">Online</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Mode of Reservation
                </label>
                <select
                  name="modeOfReservation"
                  value={formData.modeOfReservation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Mode</option>
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="Website">Website</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Tentative">Tentative</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Booking Date
                </label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div> */}
              {formData.status === "Cancelled" && (
                <>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-dark/70 mb-1">
                      Cancellation Reason
                    </label>
                    <textarea
                      name="cancellationReason"
                      value={formData.cancellationReason}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">
                      Cancelled By
                    </label>
                    <input
                      type="text"
                      name="cancelledBy"
                      value={formData.cancelledBy}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vip"
                  name="vip"
                  checked={formData.vip}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="vip" className="text-sm text-dark">
                  VIP Guest
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isForeignGuest"
                  name="isForeignGuest"
                  checked={formData.isForeignGuest}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="isForeignGuest" className="text-sm text-dark">
                  Foreign Guest
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isNoShow"
                  name="isNoShow"
                  checked={formData.isNoShow}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="isNoShow" className="text-sm text-dark">
                  No Show
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Guest Information */}
        {activeTab === "guest" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
            <h4 className="font-medium mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Guest Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Salutation
                </label>
                <select
                  name="salutation"
                  value={formData.salutation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Guest Name*
                </label>
                <input
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gstApplicable"
                  name="gstApplicable"
                  checked={formData.gstApplicable}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="gstApplicable" className="text-sm text-dark">
                  GST Applicable
                </label>
              </div>
              {formData.gstApplicable && (
                <div>
                  <label className="block text-sm font-medium text-dark/70 mb-1">
                    Company GSTIN
                  </label>
                  <input
                    type="text"
                    name="companyGSTIN"
                    value={formData.companyGSTIN}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stay Information */}
        {activeTab === "stay" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
            <h4 className="font-medium mb-3">Stay Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Check-in Date*
                </label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={(e) => {
                    handleChange(e);
                    // Clear checkout date if it's before the new checkin date
                    if (
                      formData.checkOutDate &&
                      e.target.value >= formData.checkOutDate
                    ) {
                      setFormData((prev) => ({ ...prev, checkOutDate: "" }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Check-in Time
                </label>
                <input
                  type="time"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Check-out Date*
                </label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  min={formData.checkInDate || undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Check-out Time
                </label>
                <input
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Room Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Assign Room
                </label>
                <select
                  name="roomAssigned"
                  value={formData.roomAssigned}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Room</option>
                  {filteredRooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      Room {room.room_number} - {room.title} (₹{room.price}
                      /night)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Rate per Night*
                </label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Room Hold Status
                </label>
                <select
                  name="roomHoldStatus"
                  value={formData.roomHoldStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Pending">Pending</option>
                  <option value="Held">Held</option>
                  <option value="Released">Released</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Room Hold Until
                </label>
                <input
                  type="date"
                  name="roomHoldUntil"
                  value={formData.roomHoldUntil}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Number of Rooms
                </label>
                <input
                  type="number"
                  name="noOfRooms"
                  value={formData.noOfRooms}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Plan Package
                </label>
                <select
                  name="planPackage"
                  value={formData.planPackage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="EP">EP (Room Only)</option>
                  <option value="CP">CP (Breakfast)</option>
                  <option value="MAP">MAP (Breakfast + Dinner)</option>
                  <option value="AP">AP (All Meals)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Purpose of Visit
                </label>
                <select
                  name="purposeOfVisit"
                  value={formData.purposeOfVisit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Leisure">Leisure</option>
                  <option value="Business">Business</option>
                  <option value="Family">Family</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Arrived From
                </label>
                <input
                  type="text"
                  name="arrivalFrom"
                  value={formData.arrivalFrom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Bed Type
                </label>
                <select
                  name="roomPreferences.bedType"
                  value={formData.roomPreferences.bedType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="King">King</option>
                  <option value="Queen">Queen</option>
                  <option value="Twin">Twin</option>
                  <option value="Single">Single</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smoking"
                  name="roomPreferences.smoking"
                  checked={formData.roomPreferences.smoking}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="smoking" className="text-sm text-dark">
                  Smoking Room
                </label>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="2"
                ></textarea>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="2"
                ></textarea>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Billing Instructions
                </label>
                <textarea
                  name="billingInstruction"
                  value={formData.billingInstruction}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="2"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {activeTab === "payment" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
            <h4 className="font-medium mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Referred By
                </label>
                <input
                  type="text"
                  name="refBy"
                  value={formData.refBy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdvancePaid"
                  name="isAdvancePaid"
                  checked={formData.isAdvancePaid}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="isAdvancePaid" className="text-sm text-dark">
                  Advance Payment Received
                </label>
              </div>
              {formData.isAdvancePaid && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">
                      Advance Amount
                    </label>
                    <input
                      type="number"
                      name="advancePaid"
                      value={formData.advancePaid}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
            {/* Reservation Summary */}
            <div className="bg-secondary/20 backdrop-blur-sm rounded-xl p-3 mt-6 shadow-sm">
              <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
                <CreditCard className="w-5 h-5 mr-2" />
                Reservation Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-dark/10">
                  <span className="text-dark/70">Room Rate (per night):</span>
                  <span className="font-medium text-dark">
                    ₹{formData.rate || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-dark/10">
                  <span className="text-dark/70">Number of Days:</span>
                  <span className="font-medium text-dark">
                    {calculateDays()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-dark/10">
                  <span className="text-dark/70">Number of Rooms:</span>
                  <span className="font-medium text-dark">
                    {formData.noOfRooms}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-dark/10">
                  <span className="text-dark/70">Subtotal:</span>
                  <span className="font-medium text-dark">
                    ₹{calculateSubtotal()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-dark/10">
                  <span className="text-dark/70">
                    Discount ({formData.discountPercent}%):
                  </span>
                  <span className="font-medium text-red-600">
                    -₹{calculateDiscount()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-dark/10">
                  <span className="text-dark/70">Advance Paid:</span>
                  <span className="font-medium text-green-600">
                    ₹{formData.advancePaid || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-t-2 border-dark/20">
                  <span className="text-lg font-semibold text-dark">
                    Total Amount:
                  </span>
                  <span className="text-xl font-bold text-dark">
                    ₹{calculateTotal()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-dark/70">Balance Due:</span>
                  <span
                    className={`font-medium ${
                      calculateBalance() > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ₹{calculateBalance()}
                  </span>
                </div>

                {formData.checkInDate && formData.checkOutDate && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Stay Duration:</strong> {calculateDays()} night
                      {calculateDays() > 1 ? "s" : ""}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      Check-in:{" "}
                      {new Date(formData.checkInDate).toLocaleDateString()} •
                      Check-out:{" "}
                      {new Date(formData.checkOutDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Details */}
        {activeTab === "vehicle" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
            <h4 className="font-medium mb-3 flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Vehicle Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicleDetails.vehicleNumber"
                  value={formData.vehicleDetails.vehicleNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  name="vehicleDetails.vehicleType"
                  value={formData.vehicleDetails.vehicleType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  name="vehicleDetails.vehicleModel"
                  value={formData.vehicleDetails.vehicleModel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="vehicleDetails.driverName"
                  value={formData.vehicleDetails.driverName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  Driver Mobile
                </label>
                <input
                  type="text"
                  name="vehicleDetails.driverMobile"
                  value={formData.vehicleDetails.driverMobile}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-dark/70 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-secondary text-dark rounded-lg hover:shadow-md flex items-center"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {isEditMode ? "Update Reservation" : "Save Reservation"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
