import React, { useState, useEffect, useContext } from "react";
import { Plus, BarChart3, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import RevenueCharts from "../components/RevenueCharts";

const Dashboard = () => {
  const { BACKEND_URL } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeCard, setActiveCard] = useState("Total Bookings");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch bookings and rooms in parallel
        const [bookingsResponse, roomsResponse] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/bookings`),
          axios.get(`${BACKEND_URL}/api/rooms`),
        ]);

        if (bookingsResponse.data) {
          if (
            bookingsResponse.data.success &&
            Array.isArray(bookingsResponse.data.bookings)
          ) {
            setBookings(bookingsResponse.data.bookings);
          } else if (Array.isArray(bookingsResponse.data)) {
            // If API returns array directly
            setBookings(bookingsResponse.data);
          } else {
            console.error(
              "Unexpected bookings data format:",
              bookingsResponse.data
            );
          }
        }

        if (roomsResponse.data && roomsResponse.data.success) {
          setRooms(roomsResponse.data.rooms);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [BACKEND_URL]);

  // Calculate stats
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + (booking.paymentDetails?.totalAmount || 0),
    0
  );
  const availableRoomsData = rooms.filter(
    (room) => room.status === "available"
  );

  const occupancyRate =
    rooms.length > 0
      ? Math.round(
          (rooms.filter((room) => room.status === "booked").length /
            rooms.length) *
            100
        )
      : 0;

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings.toString(),
      change: "+12%",
    },
    {
      title: "Available Rooms",
      value: availableRoomsData.length.toString(),
      change: "-5%",
    },
    {
      title: "Monthly Revenue",
      value: `₹${totalRevenue}`,
      change: "+8%",
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      change: "+3%",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Booked":
        return "bg-green-100 text-green-800";
      case "Checked In":
        return "bg-blue-100 text-blue-800";
      case "Checked Out":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Get recent bookings (latest 3)
  const recentBookings = bookings.slice(0, 3);

  const renderDetailSection = () => {
    switch (activeCard) {
      case "Total Bookings":
        return (
          <div className="bg-white/20 backdrop-blur-lg rounded-xl sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-dark mb-4">
              Recent Bookings
            </h3>
            <div className="space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-3 hover:bg-primary/5 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-dark">
                        {booking.guestDetails?.name || "N/A"}
                      </div>
                      <div className="text-sm text-dark/70">
                        Room {booking.roomNumber} •{" "}
                        {booking.categoryId?.category || "Standard"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-dark">
                        ₹{booking.paymentDetails?.totalAmount || 0}
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-dark/70">No recent bookings</p>
              )}
            </div>
          </div>
        );

      case "Available Rooms":
        return (
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 shadow-sm overflow-y-auto">
            <h3 className="text-lg font-semibold text-dark mb-4 ">
              Available Rooms
            </h3>
            <div className="space-y-3">
              {availableRoomsData.length > 0 ? (
                availableRoomsData.map((room) => (
                  <div
                    key={room._id}
                    className="flex items-center justify-between p-3 hover:bg-primary/5 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-dark">
                        Room {room.room_number}
                      </div>
                      <div className="text-sm text-dark/70">
                        {room.category?.category || "Standard"} • Floor{" "}
                        {room.floor}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-dark">
                        ₹{room.price || 0}/night
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Available
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-dark/70">No available rooms</p>
              )}
            </div>
          </div>
        );

      case "Monthly Revenue":
        return (
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 sm:my-2 my-25 shadow-sm">
            <h3 className="text-lg font-semibold text-dark mb-4">
              Revenue Charts
            </h3>
            <div className="h-64 flex items-center justify-center text-dark/70">
              <RevenueCharts bookings={bookings} />
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-dark mb-4">
              Occupancy Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 hover:bg-primary/5 rounded-lg">
                <span className="text-dark">Total Rooms</span>
                <span className="font-medium text-dark">{rooms.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-primary/5 rounded-lg">
                <span className="text-dark">Available Rooms</span>
                <span className="font-medium text-dark">
                  {availableRoomsData.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-primary/5 rounded-lg">
                <span className="text-dark">Occupied Rooms</span>
                <span className="font-medium text-dark">
                  {rooms.filter((room) => room.status === "booked").length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-primary/5 rounded-lg">
                <span className="text-dark">Reserved Rooms</span>
                <span className="font-medium text-dark">
                  {rooms.filter((room) => room.status === "reserved").length}
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 text-secondary animate-spin" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-2xl font-bold text-dark ml-12">
          Dashboard
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/reservations/new")}
            className="bg-secondary text-dark px-3 sm:px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            New Reservation
          </button>
          <button
            onClick={() => navigate("/booking/new")}
            className="bg-secondary text-dark px-3 sm:px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            New Booking
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => setActiveCard(stat.title)}
            className={`cursor-pointer backdrop-blur-sm rounded-xl p-6 shadow-md ${
              activeCard === stat.title
                ? "bg-primary border-2 border-secondary"
                : "bg-primary/50 hover:bg-primary"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark/70 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-dark mt-1">
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-dark/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-dark" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">
                {stat.change}
              </span>
              <span className="text-sm text-dark/70 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {renderDetailSection()}
    </div>
  );
};

export default Dashboard;
