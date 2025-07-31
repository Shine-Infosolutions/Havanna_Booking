import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Rooms from "./pages/Rooms";
import Categories from "./pages/Categories";
import NewBooking from "./components/BookingForm";
import NewRoom from "./components/NewRoom";
import ReservationForm from "./components/ReservationForm";
import Reservations from "./pages/Reservations";
import { ToastContainer, Zoom } from "react-toastify";
import Guests from "./pages/Guests";
import BookingForm from "./components/BookingForm";
import AvailableRooms from "./components/AvailableRooms";

const App = () => {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-white to-primary/60 -z-10"></div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        transition={Zoom}
      />
      <div className=" min-h-screen flex">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/room-categories" element={<Categories />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/booking/new" element={<BookingForm />} />
            <Route path="/rooms/new" element={<NewRoom />} />
            <Route path="/booking/edit/:id" element={<BookingForm />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="/reservations/new" element={<ReservationForm />} />
            <Route
              path="/reservations/edit/:id"
              element={<ReservationForm />}
            />
            <Route path="/guests" element={<Guests />} />
            <Route path="/rooms-available" element={<AvailableRooms />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

export default App;
