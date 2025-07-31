// src/pages/Guests.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Search,
  Loader,
  User,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Guests = () => {
  const { BACKEND_URL } = useContext(AppContext);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchGuests();
  }, [page, searchTerm, BACKEND_URL]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (searchTerm) {
        params.append("name", searchTerm);
        params.append("phone", searchTerm);
      }
      const response = await axios.get(
        `${BACKEND_URL}/api/guests?${params.toString()}`
      );

      if (response.data.success) {
        setGuests(response.data.guests);
        setTotal(response.data.total);
        setTotalPages(response.data.pages);
      } else {
        toast.error("Failed to load guests");
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      toast.error("Failed to load guests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-2xl font-bold text-dark ml-12">
          Guests ({total})
        </h2>
      </div>



      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark/50 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name, GRC number, or phone..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        />
      </div>

      {/* Guests List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 text-secondary animate-spin" />
            <span className="ml-2 text-dark">Loading guests...</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {guests.length > 0 ? (
              guests.map((guest) => (
                <div key={guest._id} className="p-6 hover:bg-primary/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-dark" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-dark">
                          {guest.salutation} {guest.name}
                        </h3>
                        <p className="text-sm text-dark/70">
                          GRC: {guest.grcNo}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          {guest.contactDetails?.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4 text-dark/50" />
                              <span className="text-sm text-dark/70">
                                {guest.contactDetails.phone}
                              </span>
                            </div>
                          )}
                          {guest.contactDetails?.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4 text-dark/50" />
                              <span className="text-sm text-dark/70">
                                {guest.contactDetails.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-dark/70">
                        Total Visits: {guest.visitStats?.totalVisits || 1}
                      </p>
                      {guest.visitStats?.lastVisit && (
                        <p className="text-xs text-dark/50">
                          Last Visit:{" "}
                          {new Date(
                            guest.visitStats.lastVisit
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-dark/70">
                No guests found
              </div>
            )}
          </div>
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark/70">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} guests
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm text-dark">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;
