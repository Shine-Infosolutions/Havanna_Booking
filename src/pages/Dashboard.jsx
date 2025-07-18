import React, { useState, useEffect } from "react";
import { Plus, BarChart3 } from "lucide-react";
import { STORAGE_KEYS, getStoredData } from "../utils/LocalStorage";
import BookingForm from "../components/BookingForm";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load data from localStorage
    const storedBookings = getStoredData(STORAGE_KEYS.BOOKINGS) || [];
    const storedRooms = getStoredData(STORAGE_KEYS.ROOMS) || [];

    setBookings(storedBookings);
    setRooms(storedRooms);
  }, []);

  // Calculate stats
  const totalBookings = bookings.length;
  const availableRooms = rooms.filter(
    (room) => room.status === "available"
  ).length;
  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + (booking.totalAmount || 0),
    0
  );
  const occupancyRate =
    rooms.length > 0
      ? Math.round(
          (rooms.filter((room) => room.status === "occupied").length /
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

  const handleAddBooking = (newBooking) => {
    setBookings([newBooking, ...bookings]);
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6  h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--color-dark)]">
          Dashboard
        </h2>
        <button
          onClick={() => navigate("/booking/new")}
          className="bg-[var(--color-secondary)] text-[var(--color-dark)] px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-primary/50 hover:bg-primary backdrop-blur-sm rounded-xl p-6 shadow-md transition-colors duration-400`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-dark)]/70 font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-[var(--color-dark)] mt-1">
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[var(--color-dark)]/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[var(--color-dark)]" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">
                {stat.change}
              </span>
              <span className="text-sm text-[var(--color-dark)]/70 ml-1">
                from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[var(--color-dark)] mb-4">
          Recent Bookings
        </h3>
        <div className="space-y-3">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 bg-[var(--color-primary)]/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-[var(--color-dark)]">
                    {booking.guestName}
                  </p>
                  <p className="text-sm text-[var(--color-dark)]/70">
                    Room {booking.roomNumber} - {booking.roomType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--color-dark)]">
                    ₹{booking.totalAmount}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "checked-in"
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
            <p className="text-center text-[var(--color-dark)]/70">
              No recent bookings
            </p>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showForm && (
        <BookingForm
          onSubmit={handleAddBooking}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
