import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "https://havana-backend.vercel.app";
  const [user, setUser] = useState({
    name: "Admin",
    role: "Administrator",
    avatar: "A",
  });

  // Fetch categories once when the app loads
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/room-categories`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const contextValue = {
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    activeTab,
    setActiveTab,
    user,
    setUser,
    categories,
    categoriesLoading,
    BACKEND_URL,
    setCategories,
    fetchCategories,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
