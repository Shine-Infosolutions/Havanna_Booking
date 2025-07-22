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
  const { BACKEND_URL, categories, rooms } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    grcNo: "",
    bookingRefNo: "",
    reservationType: "Walk-in",
    modeOfReservation: "",
    category: "",
    bookingDate: new Date().toISOString().split("T")[0],
    status: "Confirmed",

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
          } else {
            setError("Failed to load reservation data");
          }
        } catch (err) {
          setError("An error occurred while loading reservation data");
          console.error(err);
        } finally {
          setInitialLoading(false);
        }
      };

      fetchReservation();
    }
  }, [id, isEditMode, BACKEND_URL]);

  const handleGrcChange = async (e) => {
    const { value } = e.target;
    setFormData({ ...formData, grcNo: value });

    if (value.length >= 7) {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/guests/${value}`);

        if (response.data.success) {
          const guest = response.data.guest;
          toast.success("Guest details loaded successfully");

          setFormData((prevData) => ({
            ...prevData,
            grcNo: value,
            guestName: guest.name,
            salutation: guest.salutation || prevData.salutation,
            email: guest.contactDetails.email || "",
            mobileNo: guest.contactDetails.phone || "",
            address: guest.contactDetails.address || "",
            city: guest.contactDetails.city || "",
            nationality: guest.nationality || "Indian",
            companyName: guest.companyName || "",
            companyGSTIN: guest.companyGSTIN || "",
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

    if (name.includes(".")) {
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
        setError(response.data.message || "Failed to save reservation");
      }
    } catch (err) {
      setError("An error occurred while saving the reservation");
      console.error(err);
    } finally {
      setLoading(false);
    }
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

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
            activeTab === "payment"
              ? "border-b-2 border-secondary text-dark"
              : "text-dark/60"
          }`}
          onClick={() => setActiveTab("payment")}
        >
          Payment
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
              <div>
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
              </div>
              {formData.status === "Cancelled" && (
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-dark/70 mb-1">
                    Cancellation Reason
                  </label>
                  <textarea
                    name="cancellationReason"
                    value={formData.cancellationReason}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="2"
                  ></textarea>
                </div>
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
                  onChange={handleChange}
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
                  Room Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
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
                  Check-out Date*
                </label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
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
                  Assign Room
                </label>
                <select
                  name="roomAssigned"
                  value={formData.roomAssigned}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Room</option>
                  {rooms &&
                    rooms
                      .filter((room) => room.status === true)
                      .map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.room_number} - {room.title}
                        </option>
                      ))}
                </select>
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
