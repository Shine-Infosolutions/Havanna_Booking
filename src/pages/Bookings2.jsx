import React, { useState } from "react";
import { Plus, Filter, ChevronDown, Eye, Edit, Trash2 } from "lucide-react";

const Bookings = () => {
  const [filter, setFilter] = useState("all");

  const bookingsData = [
    {
      id: 1,
      guest: "John Smith",
      room: "Deluxe Suite 205",
      checkIn: "2024-07-20",
      checkOut: "2024-07-23",
      status: "confirmed",
      total: "$450",
      phone: "+1 234 567 8900",
      email: "john.smith@email.com",
    },
    {
      id: 2,
      guest: "Sarah Johnson",
      room: "Standard Room 101",
      checkIn: "2024-07-18",
      checkOut: "2024-07-20",
      status: "checked-in",
      total: "$280",
      phone: "+1 234 567 8901",
      email: "sarah.j@email.com",
    },
    {
      id: 3,
      guest: "Mike Wilson",
      room: "Presidential Suite 301",
      checkIn: "2024-07-25",
      checkOut: "2024-07-28",
      status: "pending",
      total: "$890",
      phone: "+1 234 567 8902",
      email: "mike.wilson@email.com",
    },
    {
      id: 4,
      guest: "Emily Davis",
      room: "Standard Room 103",
      checkIn: "2024-07-22",
      checkOut: "2024-07-24",
      status: "confirmed",
      total: "$240",
      phone: "+1 234 567 8903",
      email: "emily.davis@email.com",
    },
    {
      id: 5,
      guest: "Robert Brown",
      room: "Deluxe Suite 206",
      checkIn: "2024-07-19",
      checkOut: "2024-07-21",
      status: "checked-in",
      total: "$360",
      phone: "+1 234 567 8904",
      email: "robert.brown@email.com",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "checked-in":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings =
    filter === "all"
      ? bookingsData
      : bookingsData.filter((booking) => booking.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-800">Bookings</h2>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 border border-amber-200 rounded-lg hover:bg-amber-50">
            <Filter className="w-4 h-4 mr-2" />
            Filter
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          <button className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
            <Plus className="w-4 h-4 inline mr-2" />
            New Booking
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-amber-100">
        <div className="p-6 border-b border-amber-100">
          <div className="flex space-x-4">
            {["all", "confirmed", "checked-in", "pending"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === status
                    ? "bg-amber-400 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                {status.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                  Check-out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-amber-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-amber-800">
                        {booking.guest}
                      </div>
                      <div className="text-sm text-amber-600">
                        {booking.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-800">
                    {booking.room}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-800">
                    {booking.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-800">
                    {booking.checkOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-800">
                    {booking.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-800">
                    <div className="flex space-x-2">
                      <button className="text-amber-600 hover:text-amber-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-amber-600 hover:text-amber-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
