import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import {
  Calendar,
  Search,
  Home,
  Users,
  Loader,
  Clock,
  Eye,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const AvailableRooms = () => {
  const { BACKEND_URL } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [allRooms, setAllRooms] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const searchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/rooms/available?all=true`
      );

      if (response.data.success) {
        setAllRooms(response.data.availableRooms);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDateInRange = (date, bookedTillDate, reservedDates) => {
    if (!selectedDate) return false;

    const checkDate = new Date(selectedDate);

    // Check if date is in booked range
    if (bookedTillDate) {
      const bookedTill = new Date(bookedTillDate);
      if (checkDate <= bookedTill) return true;
    }

    // Check if date is in reserved dates
    if (reservedDates && reservedDates.length > 0) {
      return reservedDates.some((reservedDate) => {
        const reserved = new Date(reservedDate);
        return checkDate.toDateString() === reserved.toDateString();
      });
    }

    return false;
  };

  const getBookedRooms = () => {
    if (!selectedDate) return [];

    const bookedRooms = [];

    allRooms.forEach((category) => {
      const categoryBookedRooms = category.rooms.filter((room) =>
        isDateInRange(selectedDate, room.bookedTillDate, room.reservedDates)
      );

      if (categoryBookedRooms.length > 0) {
        bookedRooms.push({
          ...category,
          rooms: categoryBookedRooms,
        });
      }
    });

    return bookedRooms;
  };

  const getAvailableRooms = () => {
    const availableRooms = [];

    allRooms.forEach((category) => {
      const categoryAvailableRooms = category.rooms.filter(
        (room) =>
          room.status === "available" ||
          (!isDateInRange(
            selectedDate,
            room.bookedTillDate,
            room.reservedDates
          ) &&
            room.status !== "booked")
      );

      if (categoryAvailableRooms.length > 0) {
        availableRooms.push({
          ...category,
          rooms: categoryAvailableRooms,
        });
      }
    });

    return availableRooms;
  };

  const formatBookingInfo = (room) => {
    if (
      room.bookedTillDate &&
      isDateInRange(selectedDate, room.bookedTillDate, [])
    ) {
      return `Booked till ${new Date(
        room.bookedTillDate
      ).toLocaleDateString()}`;
    }

    if (room.reservedDates && room.reservedDates.length > 0) {
      const reservedDatesStr = room.reservedDates
        .map((date) => new Date(date).toLocaleDateString())
        .join(", ");
      return `Reserved: ${reservedDatesStr}`;
    }

    return "";
  };

  const openCalendarModal = (room) => {
    setSelectedRoom(room);
    setShowCalendarModal(true);
  };

  const closeCalendarModal = () => {
    setShowCalendarModal(false);
    setSelectedRoom(null);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month" && selectedRoom) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only style future dates
      if (date < today) {
        return "past-date";
      }

      // Check if date is booked
      if (selectedRoom.bookedTillDate) {
        const bookedTill = new Date(selectedRoom.bookedTillDate);
        bookedTill.setHours(0, 0, 0, 0);
        if (date <= bookedTill) {
          return "booked-date";
        }
      }

      // Check if date is reserved
      if (selectedRoom.reservedDates && selectedRoom.reservedDates.length > 0) {
        const isReserved = selectedRoom.reservedDates.some((reservedDate) => {
          const reserved = new Date(reservedDate);
          reserved.setHours(0, 0, 0, 0);
          return date.getTime() === reserved.getTime();
        });

        if (isReserved) {
          return "reserved-date";
        }
      }

      return "available-date";
    }
    return null;
  };

  const bookedRooms = getBookedRooms();
  const availableRooms = getAvailableRooms();

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      <style jsx>{`
        .react-calendar {
          border: none !important;
          font-family: inherit !important;
        }
        .booked-date {
          background-color: #fee2e2 !important;
          color: #dc2626 !important;
        }
        .reserved-date {
          background-color: #fef3c7 !important;
          color: #d97706 !important;
        }
        .available-date {
          background-color: #dcfce7 !important;
          color: #16a34a !important;
        }
        .past-date {
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
        }
      `}</style>

      <div className="mb-6">
        <h2 className="text-2xl sm:text-2xl font-bold mb-2 text-dark ml-12">
          Room Availability
        </h2>
        <p className="text-dark/70">
          Check room availability for a specific date
        </p>
      </div>

      {/* Search Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
          <Calendar className="w-5 h-5 mr-2" />
          Select Date
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Check Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div>
            <button
              onClick={searchRooms}
              disabled={loading}
              className="w-full px-4 py-2 bg-secondary text-dark rounded-lg hover:shadow-md flex items-center justify-center"
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search Rooms
            </button>
          </div>
        </div>
      </div>

      {/* Booked/Reserved Rooms for Selected Date */}
      {selectedDate && bookedRooms.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-red-800 flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2" />
            Booked/Reserved Rooms for{" "}
            {new Date(selectedDate).toLocaleDateString()}
          </h3>

          {bookedRooms.map((category) => (
            <div key={category.categoryId} className="mb-4">
              <h4 className="text-md font-medium text-red-700 mb-3">
                {category.categoryName} ({category.rooms.length} rooms)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.rooms.map((room) => (
                  <div
                    key={room._id}
                    className="border border-red-300 bg-red-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-red-800">{room.title}</h5>
                      <span className="text-lg font-bold text-red-600">
                        ₹{room.price}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-red-700 mb-2">
                      <Users className="w-4 h-4 mr-1" />
                      Room {room.room_number}
                    </div>

                    <p className="text-sm text-red-600 mb-2">
                      {room.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-red-700 font-medium">
                        {formatBookingInfo(room)}
                      </div>
                      <button
                        onClick={() => openCalendarModal(room)}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 flex items-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Calendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Rooms */}
      {availableRooms.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Available Rooms
            </h3>
            <span className="text-sm text-dark/70">
              {availableRooms.reduce(
                (total, cat) => total + cat.rooms.length,
                0
              )}{" "}
              room(s) available
            </span>
          </div>

          {availableRooms.map((category) => (
            <div key={category.categoryId} className="mb-6">
              <h4 className="text-md font-medium text-dark mb-3 border-b border-gray-200 pb-2">
                {category.categoryName} ({category.rooms.length} rooms)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.rooms.map((room) => (
                  <div
                    key={room._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-dark">{room.title}</h5>
                      <span className="text-lg font-bold text-secondary">
                        ₹{room.price}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-dark/70 mb-2">
                      <Users className="w-4 h-4 mr-1" />
                      Room {room.room_number}
                    </div>

                    <p className="text-sm text-dark/60 mb-3">
                      {room.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-green-600 font-medium">
                        Available
                      </div>
                      <button
                        onClick={() => openCalendarModal(room)}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 flex items-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Calendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendarModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-dark">
                Room {selectedRoom.room_number} - {selectedRoom.title}
              </h3>
              <button
                onClick={closeCalendarModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <ReactCalendar
                tileClassName={tileClassName}
                minDate={new Date()}
                className="w-full"
              />
            </div>

            <div className="text-xs space-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-200 rounded mr-2"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-200 rounded mr-2"></div>
                <span>Reserved</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && allRooms.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm text-center">
          <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark mb-2">No Data</h3>
          <p className="text-dark/60">
            Click "Search Rooms" to load room availability data.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableRooms;
