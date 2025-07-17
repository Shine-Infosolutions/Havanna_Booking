import React from "react";
import { Search, Bell } from "lucide-react";
import { useAppContext } from "./AppContext";

const Header = () => {
  const { user } = useAppContext();

  return (
    <header className="bg-white border-b border-amber-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              placeholder="Search guests, rooms, bookings..."
              className="pl-10 pr-4 py-2 w-80 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.avatar}
              </span>
            </div>
            <span className="text-amber-800 font-medium">{user.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
