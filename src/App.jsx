import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Rooms from "./pages/Rooms";
import Categories from "./pages/Categories";

const App = () => {
  return (
    <div className="main-gradient min-h-screen flex">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/room-categories" element={<Categories />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/bookings" element={<Bookings />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
