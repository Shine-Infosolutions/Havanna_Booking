// src/utils/localStorage.js
export const STORAGE_KEYS = {
  CATEGORIES: "hotel_categories",
  ROOMS: "hotel_rooms",
  BOOKINGS: "hotel_bookings",
};

export const getStoredData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return null;
  }
};

export const storeData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
    return false;
  }
};
