import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { UserButton, useUser, useClerk } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiUser,
  FiBook,
  FiPlus,
  FiBarChart2,
  FiUsers,
  FiEdit3,
} from "react-icons/fi";

const Navbar = ({ toggleSidebar, sidebarOpen, isMobile = false }) => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when sidebar opens
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      setMenuOpen(false);
    }
  }, [sidebarOpen, isMobile]);

  // Check if we're on educator pages
  const isEducatorPage = location.pathname.includes("/educator");

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/educator",
      icon: FiBarChart2,
    },
    {
      label: "My Courses",
      path: "/educator/my-courses",
      icon: FiBook,
    },
    {
      label: "Add Course",
      path: "/educator/add-course",
      icon: FiPlus,
    },
    {
      label: "Update Courses",
      path: "/educator/update-courses",
      icon: FiEdit3,
    },
    {
      label: "Students",
      path: "/educator/students-enrolled",
      icon: FiUsers,
    },
  ];

  return (
    <div
      className={`px-3 sm:px-4 md:px-6 lg:px-8 border-b border-gray-200 py-2 sm:py-3 shadow-sm ${
        isEducatorPage
          ? "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50"
          : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Sidebar Toggle & Logo */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Sidebar Toggle Button - Show when sidebar is closed OR on mobile */}
          {(!sidebarOpen || isMobile) && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group flex-shrink-0"
              title="Open Sidebar"
            >
              <FiMenu
                size={isMobile ? 24 : 20}
                className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200"
              />
            </button>
          )}

          {/* Logo - Show when sidebar is closed or always on mobile */}
          {(!sidebarOpen || isMobile) && (
            <Link to="/" className="flex items-center min-w-0">
              <img
                src={assets.edulecta}
                alt="Edulecta Logo"
                className="w-20 sm:w-24 md:w-28 lg:w-32 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          )}
        </div>

        {/* Desktop Navigation - Hide on mobile */}
        <div className="hidden xl:flex items-center gap-3 lg:gap-8 mr-8 lg:mr-15">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <IconComponent size={16} />
                <span className="text-xs lg:text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* User Greeting - Hidden on small screens */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800 truncate">
                Hi, {user ? user.firstName : "Educator"}!
              </p>
              <p className="text-xs text-gray-500">
                {user ? "Educator Dashboard" : "Welcome"}
              </p>
            </div>
          </div>

          {/* User Button/Profile */}
          <div className="flex items-center">
            {user ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      "w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-blue-100 hover:ring-blue-200 transition-all",
                  },
                }}
              />
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src={assets.profile_img}
                  alt="Profile"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-gray-200"
                />
                <button
                  onClick={openSignIn}
                  className="hidden sm:block bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Only show on very small screens and when sidebar is closed */}
          <div className="xl:hidden">
            <button
              onClick={() => {
                // Close sidebar first if it's open on mobile, then toggle menu
                if (sidebarOpen && isMobile) {
                  toggleSidebar();
                } else {
                  setMenuOpen(!menuOpen);
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="xl:hidden mt-2 sm:mt-4 py-2 sm:py-4 border-t border-gray-200 bg-white rounded-lg shadow-lg mx-2 sm:mx-0 relative z-20">
          <div className="flex flex-col gap-1 sm:gap-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 mx-2 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <IconComponent size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile User Info */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 mx-2">
              <div className="flex items-center gap-3 px-2 sm:px-4 py-2">
                <FiUser size={18} className="text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user ? user.firstName : "Educator"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user
                      ? user.emailAddresses?.[0]?.emailAddress
                      : "Not signed in"}
                  </p>
                </div>
              </div>

              {!user && (
                <button
                  onClick={() => {
                    openSignIn();
                    setMenuOpen(false);
                  }}
                  className="w-full mt-3 mx-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  style={{ width: "calc(100% - 16px)" }}
                >
                  Sign In to Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
