import React, { useContext, useState } from "react";
import {
  Home,
  Calendar,
  Users,
  BedDouble,
  CreditCard,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Grid3X3,
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { isSidebarOpen, openSidebar, closeSidebar } = useContext(AppContext);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
    { id: "bookings", label: "Bookings", icon: Calendar, path: "/bookings" },
    {
      id: "reservations",
      label: "Reservations",
      icon: Calendar,
      path: "/reservations",
    },
    { id: "guests", label: "Guests", icon: Users, path: "/guests" },
  ];

  const roomManagementItems = [
    { id: "categories", label: "Categories", path: "/room-categories" },
    { id: "rooms", label: "Rooms", path: "/rooms" },
  ];

  const isActive = (path) => location.pathname === path;
  const isRoomManagementActive = () =>
    location.pathname === "/room-categories" || location.pathname === "/rooms";

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={isSidebarOpen ? closeSidebar : openSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-[var(--color-primary)] text-[var(--color-dark)] rounded-lg shadow-lg md:hidden"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 bg-dark w-64 min-h-screen p-6 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white">Hotel Havanna</h2>
          <p className="text-amber-50 text-sm">Management System</p>
        </div>

        <nav className="space-y-2">
          {/* Regular Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  closeSidebar();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${
                  isActive(item.path)
                    ? "bg-[var(--color-secondary)] text-[var(--color-dark)] font-medium"
                    : "text-amber-50 hover:bg-[var(--color-secondary)]/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Room Management Dropdown */}
          <div>
            <button
              onClick={() => setRoomDropdownOpen(!roomDropdownOpen)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                isRoomManagementActive()
                  ? " text-amber-50 font-medium"
                  : "text-amber-50/80 hover:bg-[var(--color-secondary)]/50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <BedDouble className="w-5 h-5" />
                <span>Room Manage..</span>
              </div>
              {roomDropdownOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Dropdown Items */}
            {roomDropdownOpen && (
              <div className="ml-4 mt-2 space-y-1">
                {roomManagementItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      closeSidebar();
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center space-x-3 ${
                      isActive(item.path)
                        ? "bg-[var(--color-secondary)] text-[var(--color-dark)] font-medium"
                        : "text-amber-50 hover:bg-[var(--color-secondary)]/30"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
