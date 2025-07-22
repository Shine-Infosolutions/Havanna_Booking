import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Rooms from "./pages/Rooms";
import Categories from "./pages/Categories";
import NewBooking from "./components/NewBooking";
import NewRoom from "./components/NewRoom";
import ReservationForm from "./components/ReservationForm";
import Reservations from "./pages/Reservations";

const App = () => {
  return (
    <>
      <div className="fixed top-0 left-0 min-w-full bg-gradient-to-b from-white to-primary/60 min-h-screen -z-10"></div>
      <div className=" min-h-screen flex">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/room-categories" element={<Categories />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/booking/new" element={<NewBooking />} />
            <Route path="/rooms/new" element={<NewRoom />} />
            <Route path="/booking/edit/:id" element={<NewBooking />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="reservations/form" element={<ReservationForm />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

export default App;
