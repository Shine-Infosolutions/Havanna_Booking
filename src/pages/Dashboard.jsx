import React, { useState, useEffect, useContext } from "react";
import { Plus, BarChart3, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const Dashboard = () => {
  const { BACKEND_URL } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch bookings and rooms in parallel
        const [bookingsResponse, roomsResponse] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/bookings/all`),
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
  const availableRooms = rooms.filter((room) => room.status === true).length;
  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + (booking.totalAmount || 0),
    0
  );
  const occupancyRate =
    rooms.length > 0
      ? Math.round(
          (rooms.filter((room) => room.status === false).length /
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
      value: availableRooms.toString(),
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

  // Get recent bookings (latest 3)
  const recentBookings = bookings.slice(0, 3);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 text-secondary animate-spin" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">Dashboard</h2>
        <button
          onClick={() => navigate("/booking/new")}
          className="bg-secondary text-dark px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          New Booking
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-primary/50 hover:bg-primary backdrop-blur-sm rounded-xl p-6 shadow-md transition-colors duration-400"
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

      <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-dark mb-4">
          Recent Bookings
        </h3>
        <div className="space-y-3">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <div
                key={booking._id}
                className="flex items-center justify-between p-3 bg-primary/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-dark">
                    {booking.salutation} {booking.name}
                  </p>
                  <p className="text-sm text-dark/70">
                    Room {booking.roomNo || booking.roomNumber} -{" "}
                    {booking.roomType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-dark">
                    ₹{booking.rate * booking.days}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === "Booked" ||
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "Checked In" ||
                          booking.status === "checked-in"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-dark/70">No recent bookings</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
