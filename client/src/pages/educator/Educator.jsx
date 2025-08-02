import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/educator/Navbar";
import Sidebar from "../../components/educator/Sidebar";
import Footer from "../../components/educator/Footer";

const Educator = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile and adjust sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);

      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative flex flex-col">
      {/* Sidebar - Responsive positioning */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content Area - Responsive layout */}
      <div
        className={`min-h-screen transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen && !isMobile ? "lg:ml-64" : "ml-0"
        }`}
      >
        {/* Navbar - Always visible */}
        <Navbar
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />

        {/* Main Content - Flexible grow */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-full min-h-full">
            <Outlet />
          </div>
        </main>

        {/* Footer - Always at bottom */}
        <Footer />
      </div>
    </div>
  );
};

export default Educator;
