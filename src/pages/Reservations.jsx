// src/pages/Reservations.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader,
  Calendar,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import ReservationForm from "../components/ReservationForm";
import StatusUpdateModal from "../components/StatusUpdateModal";

const Reservations = () => {
  const { BACKEND_URL } = useContext(AppContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, [BACKEND_URL]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/reservation`);

      if (response.data.success) {
        setReservations(response.data.reservations);
      } else {
        setError("Failed to load reservations");
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setError("Failed to load reservations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewReservation = () => {
    setSelectedReservation(null);
    setShowForm(true);
  };

  const handleEditReservation = (reservation) => {
    setSelectedReservation(reservation);
    navigate(`/reservations/edit/${reservation._id}`);
  };

  const handleSaveReservation = () => {
    fetchReservations();
    setShowForm(false);
    setSelectedReservation(null);
  };

  const handleDeleteReservation = async (id) => {
    if (!confirm("Are you sure you want to delete this reservation?")) return;

    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/api/reservation/${id}`);
      fetchReservations();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      setError("Failed to delete reservation");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBookingFromReservation = (reservationId) => {
    navigate("/booking/new", { state: { reservationId } });
  };

  const handleStatusClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = (updatedReservation) => {
    // Update the reservation in the list
    setReservations((prev) =>
      prev.map((res) =>
        res._id === updatedReservation._id
          ? { ...res, status: updatedReservation.status }
          : res
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Tentative":
        return "bg-yellow-100 text-yellow-800";
      case "Waiting":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredReservations = reservations
    .filter(
      (reservation) =>
        statusFilter === "all" || reservation.status === statusFilter
    )
    .filter(
      (reservation) =>
        searchTerm === "" ||
        reservation.guestName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.grcNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-2xl font-bold text-dark ml-12">
          Reservations
        </h2>
        <button
          onClick={() => navigate("/reservations/new")}
          className="bg-secondary text-dark px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          New Reservation
        </button>
        <button onClick={() => navigate("/available-rooms")}>
          Check Room Availability
        </button>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by guest name or GRC number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div className="flex space-x-2">
          {["all", "Confirmed", "Tentative", "Waiting", "Cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors text-sm ${
                  statusFilter === status
                    ? "bg-secondary text-dark font-medium"
                    : "bg-white/50 text-dark/70 hover:bg-secondary/50"
                }`}
              >
                {status === "all" ? "All" : status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  GRC No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Room No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Check-out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <Loader className="w-8 h-8 text-secondary animate-spin" />
                      <span className="ml-2 text-dark">
                        Loading reservations...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredReservations.length > 0 ? (
                filteredReservations.map((reservation) => (
                  <tr key={reservation._id} className="hover:bg-primary/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark">
                        {reservation.grcNo}
                      </div>
                      <div className="text-xs text-dark/70">
                        {reservation.bookingRefNo || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark">
                        {reservation.salutation} {reservation.guestName}
                      </div>
                      <div className="text-xs text-dark/70">
                        {reservation.mobileNo || "No phone"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark">
                        {reservation.roomAssigned.room_number}
                      </div>
                      <div className="text-xs text-dark/70">
                        {reservation.roomAssigned.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                      {new Date(reservation.checkInDate).toLocaleDateString()}
                      <div className="text-xs text-dark/70">
                        {reservation.checkInTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                      {new Date(reservation.checkOutDate).toLocaleDateString()}
                      <div className="text-xs text-dark/70">
                        {reservation.checkOutTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">
                      ₹{reservation.rate}
                    </td>
                    <td
                      onClick={() => handleStatusClick(reservation)}
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    >
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditReservation(reservation)}
                          className="text-dark/60 hover:text-dark"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteReservation(reservation._id)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleCreateBookingFromReservation(reservation._id)
                          }
                          className="text-blue-500 hover:text-blue-700"
                          title="Create Booking"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-dark/70"
                  >
                    No reservations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showStatusModal && selectedReservation && (
        <StatusUpdateModal
          booking={selectedReservation}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleStatusUpdate}
          type="reservation"
        />
      )}

      {/* Reservation Form Modal */}
      {/* {showForm && (
        <ReservationForm
          onClose={() => setShowForm(false)}
          onSave={handleSaveReservation}
          initialData={selectedReservation}
        />
      )} */}
    </div>
  );
};

export default Reservations;
