import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { X, Loader } from "lucide-react";
import axios from "axios";

const ReservationForm = ({ onClose, onSave, initialData = null }) => {
  const { BACKEND_URL, categories, rooms } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    grcNo: initialData?.grcNo || "",
    bookingRefNo: initialData?.bookingRefNo || "",
    reservationType: initialData?.reservationType || "Walk-in",
    modeOfReservation: initialData?.modeOfReservation || "",
    category: initialData?.category || "",
    bookingDate: initialData?.bookingDate
      ? new Date(initialData.bookingDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    status: initialData?.status || "Confirmed",

    // Guest Details
    salutation: initialData?.salutation || "Mr",
    guestName: initialData?.guestName || "",
    nationality: initialData?.nationality || "Indian",
    city: initialData?.city || "",
    address: initialData?.address || "",
    phoneNo: initialData?.phoneNo || "",
    mobileNo: initialData?.mobileNo || "",
    email: initialData?.email || "",
    companyName: initialData?.companyName || "",
    gstApplicable: initialData?.gstApplicable ?? true,
    companyGSTIN: initialData?.companyGSTIN || "",

    // Stay Info
    roomHoldStatus: initialData?.roomHoldStatus || "Pending",
    roomAssigned: initialData?.roomAssigned || "",
    checkInDate: initialData?.checkInDate
      ? new Date(initialData.checkInDate).toISOString().split("T")[0]
      : "",
    checkInTime: initialData?.checkInTime || "12:00",
    checkOutDate: initialData?.checkOutDate
      ? new Date(initialData.checkOutDate).toISOString().split("T")[0]
      : "",
    checkOutTime: initialData?.checkOutTime || "10:00",
    noOfRooms: initialData?.noOfRooms || 1,
    noOfAdults: initialData?.noOfAdults || 1,
    noOfChildren: initialData?.noOfChildren || 0,
    planPackage: initialData?.planPackage || "EP",
    rate: initialData?.rate || "",

    arrivalFrom: initialData?.arrivalFrom || "",
    purposeOfVisit: initialData?.purposeOfVisit || "Leisure",

    roomPreferences: {
      smoking: initialData?.roomPreferences?.smoking || false,
      bedType: initialData?.roomPreferences?.bedType || "King",
    },

    specialRequests: initialData?.specialRequests || "",
    remarks: initialData?.remarks || "",
    billingInstruction: initialData?.billingInstruction || "",

    // Payment Info
    paymentMode: initialData?.paymentMode || "Cash",
    refBy: initialData?.refBy || "",
    advancePaid: initialData?.advancePaid || 0,
    isAdvancePaid: initialData?.isAdvancePaid || false,
    transactionId: initialData?.transactionId || "",
    discountPercent: initialData?.discountPercent || 0,

    // Vehicle Details
    vehicleDetails: {
      vehicleNumber: initialData?.vehicleDetails?.vehicleNumber || "",
      vehicleType: initialData?.vehicleDetails?.vehicleType || "",
      vehicleModel: initialData?.vehicleDetails?.vehicleModel || "",
      driverName: initialData?.vehicleDetails?.driverName || "",
      driverMobile: initialData?.vehicleDetails?.driverMobile || "",
    },

    vip: initialData?.vip || false,
    isForeignGuest: initialData?.isForeignGuest || false,

    cancellationReason: initialData?.cancellationReason || "",
    isNoShow: initialData?.isNoShow || false,
  });

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
      const url = initialData
        ? `${BACKEND_URL}/api/reservation/${initialData._id}`
        : `${BACKEND_URL}/api/reservation`;

      const method = initialData ? "put" : "post";

      const response = await axios[method](url, submissionData);

      if (response.data.success) {
        onSave(response.data.reservation);
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

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-6">
      <div
        className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-auto max-h-[90vh] overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
          <h3 className="text-lg font-semibold text-dark">
            {initialData ? "Edit Reservation" : "New Reservation"}
          </h3>
          <button onClick={onClose} className="text-dark/60 hover:text-dark">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Reservation Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Reservation Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-1">
                  GRC Number*
                </label>
                <input
                  type="text"
                  name="grcNo"
                  value={formData.grcNo}
                  onChange={handleChange}
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
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Tentative">Tentative</option>
                <option value="Waiting">Waiting</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Guest Information</h4>
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
            </div>
          </div>

          {/* Stay Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
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
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
                "Save Reservation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;
