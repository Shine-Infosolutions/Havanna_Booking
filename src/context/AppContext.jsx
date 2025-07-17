import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState({
    name: "Admin",
    role: "Administrator",
    avatar: "A",
  });

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
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
