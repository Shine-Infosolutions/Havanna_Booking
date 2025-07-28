import React from "react";
import { X } from "lucide-react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const RoomCalendarModal = ({ isOpen, onClose, room }) => {
  if (!isOpen || !room) return null;

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only style future dates
      if (date < today) {
        return "past-date";
      }

      // Check if date is booked
      if (room.bookedTillDate) {
        const bookedTill = new Date(room.bookedTillDate);
        bookedTill.setHours(0, 0, 0, 0);
        if (date <= bookedTill) {
          return "booked-date";
        }
      }

      // Check if date is reserved
      if (room.reservedDates && room.reservedDates.length > 0) {
        const isReserved = room.reservedDates.some((reservedDate) => {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
  );
};

export default RoomCalendarModal;
