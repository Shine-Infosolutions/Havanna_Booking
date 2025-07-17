// src/utils/initData.js
import { STORAGE_KEYS, getStoredData, storeData } from "./LocalStorage";

export const initializeData = () => {
  // Initialize rooms if they don't exist
  const rooms = getStoredData(STORAGE_KEYS.ROOMS);
  if (!rooms || rooms.length === 0) {
    const defaultRooms = [
      {
        id: 1,
        number: "101",
        type: "Standard Room",
        status: "occupied",
        guest: "Rahul Sharma",
        price: 1200,
        amenities: ["WiFi", "AC", "TV", "Breakfast"],
        floor: 1,
        capacity: 2,
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=200&fit=crop",
      },
      {
        id: 2,
        number: "102",
        type: "Standard Room",
        status: "available",
        guest: null,
        price: 1200,
        amenities: ["WiFi", "AC", "TV", "Breakfast"],
        floor: 1,
        capacity: 2,
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=200&fit=crop",
      },
      {
        id: 3,
        number: "201",
        type: "Deluxe Suite",
        status: "occupied",
        guest: "Priya Patel",
        price: 2500,
        amenities: ["WiFi", "AC", "TV", "Mini Bar", "Balcony", "Breakfast"],
        floor: 2,
        capacity: 3,
        image:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=200&fit=crop",
      },
      {
        id: 4,
        number: "202",
        type: "Deluxe Suite",
        status: "available",
        guest: null,
        price: 2500,
        amenities: ["WiFi", "AC", "TV", "Mini Bar", "Balcony", "Breakfast"],
        floor: 2,
        capacity: 3,
        image:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=200&fit=crop",
      },
      {
        id: 5,
        number: "301",
        type: "Presidential Suite",
        status: "maintenance",
        guest: null,
        price: 5000,
        amenities: [
          "WiFi",
          "AC",
          "TV",
          "Mini Bar",
          "Jacuzzi",
          "Balcony",
          "Butler Service",
          "Breakfast",
        ],
        floor: 3,
        capacity: 4,
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=200&fit=crop",
      },
      {
        id: 6,
        number: "302",
        type: "Presidential Suite",
        status: "available",
        guest: null,
        price: 5000,
        amenities: [
          "WiFi",
          "AC",
          "TV",
          "Mini Bar",
          "Jacuzzi",
          "Balcony",
          "Butler Service",
          "Breakfast",
        ],
        floor: 3,
        capacity: 4,
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=200&fit=crop",
      },
    ];
    storeData(STORAGE_KEYS.ROOMS, defaultRooms);
  }

  // Initialize categories if they don't exist
  const categories = getStoredData(STORAGE_KEYS.CATEGORIES);
  if (!categories || categories.length === 0) {
    const defaultCategories = [
      {
        id: 1,
        name: "Standard Room",
        description:
          "Comfortable room with essential amenities for a pleasant stay",
        basePrice: 1200,
        maxOccupancy: 2,
        amenities: ["WiFi", "AC", "TV", "Breakfast"],
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=200&fit=crop",
      },
      {
        id: 2,
        name: "Deluxe Suite",
        description:
          "Spacious suite with premium amenities and a beautiful view",
        basePrice: 2500,
        maxOccupancy: 3,
        amenities: ["WiFi", "AC", "TV", "Mini Bar", "Balcony", "Breakfast"],
        image:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=200&fit=crop",
      },
      {
        id: 3,
        name: "Presidential Suite",
        description:
          "Luxurious suite with exclusive services and amenities for a memorable experience",
        basePrice: 5000,
        maxOccupancy: 4,
        amenities: [
          "WiFi",
          "AC",
          "TV",
          "Mini Bar",
          "Jacuzzi",
          "Balcony",
          "Butler Service",
          "Breakfast",
        ],
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=200&fit=crop",
      },
    ];
    storeData(STORAGE_KEYS.CATEGORIES, defaultCategories);
  }

  // Initialize bookings if they don't exist
  const bookings = getStoredData(STORAGE_KEYS.BOOKINGS);
  if (!bookings || bookings.length === 0) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const formatDate = (date) => date.toISOString().split("T")[0];

    const defaultBookings = [
      {
        id: 1,
        guestName: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        roomId: 1,
        roomNumber: "101",
        roomType: "Standard Room",
        checkIn: formatDate(yesterday),
        checkOut: formatDate(tomorrow),
        nights: 2,
        adults: 2,
        children: 0,
        totalAmount: 2400,
        paymentMethod: "card",
        paymentStatus: "paid",
        specialRequests: "Early check-in requested",
        status: "checked-in",
        createdAt: new Date(yesterday).toISOString(),
      },
      {
        id: 2,
        guestName: "Priya Patel",
        email: "priya.patel@example.com",
        phone: "+91 87654 32109",
        roomId: 3,
        roomNumber: "201",
        roomType: "Deluxe Suite",
        checkIn: formatDate(today),
        checkOut: formatDate(nextWeek),
        nights: 7,
        adults: 2,
        children: 1,
        totalAmount: 17500,
        paymentMethod: "upi",
        paymentStatus: "paid",
        specialRequests: "Need extra bed for child",
        status: "checked-in",
        createdAt: new Date(lastWeek).toISOString(),
      },
      {
        id: 3,
        guestName: "Amit Kumar",
        email: "amit.kumar@example.com",
        phone: "+91 76543 21098",
        roomId: 6,
        roomNumber: "302",
        roomType: "Presidential Suite",
        checkIn: formatDate(nextWeek),
        checkOut: formatDate(
          new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000)
        ),
        nights: 3,
        adults: 2,
        children: 2,
        totalAmount: 15000,
        paymentMethod: "card",
        paymentStatus: "pending",
        specialRequests: "Airport pickup required",
        status: "confirmed",
        createdAt: new Date().toISOString(),
      },
      {
        id: 4,
        guestName: "Neha Singh",
        email: "neha.singh@example.com",
        phone: "+91 65432 10987",
        roomId: 4,
        roomNumber: "202",
        roomType: "Deluxe Suite",
        checkIn: formatDate(lastWeek),
        checkOut: formatDate(yesterday),
        nights: 6,
        adults: 2,
        children: 0,
        totalAmount: 15000,
        paymentMethod: "cash",
        paymentStatus: "paid",
        specialRequests: "",
        status: "checked-out",
        createdAt: new Date(lastWeek).toISOString(),
      },
      {
        id: 5,
        guestName: "Vikram Malhotra",
        email: "vikram.m@example.com",
        phone: "+91 54321 09876",
        roomId: 2,
        roomNumber: "102",
        roomType: "Standard Room",
        checkIn: formatDate(tomorrow),
        checkOut: formatDate(
          new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000)
        ),
        nights: 2,
        adults: 1,
        children: 0,
        totalAmount: 2400,
        paymentMethod: "upi",
        paymentStatus: "pending",
        specialRequests: "Late check-out if possible",
        status: "confirmed",
        createdAt: new Date().toISOString(),
      },
    ];
    storeData(STORAGE_KEYS.BOOKINGS, defaultBookings);
  }
};
