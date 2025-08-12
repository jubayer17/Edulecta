/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import { assets } from "./../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiUser,
  FiBook,
  FiUsers,
  FiBookOpen,
  FiClock,
} from "react-icons/fi";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const location = useLocation();
  const isCourseListPage = location.pathname.includes("/course-list");
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const { navigate, isEducator, backendUrl, setIsEducator, getToken } =
    useContext(AppContext);

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }
      const token = await getToken();

      if (!token) {
        toast.error("Authentication token missing. Please sign in again.");
        openSignIn();
        return;
      }

      const { data } = await axios.post(
        backendUrl + "/api/educator/update-role-educator",
        null, // sending no body explicitly
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setIsEducator(true);
        toast.success("You are now an educator!");
        navigate("/educator");
      } else {
        toast.error(data.message || "Failed to become educator");
      }
    } catch (error) {
      console.error("Error becoming educator:", error);
      // More detailed error message
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error becoming educator";
      toast.error(message);
    }
  };

  const navigationItems = [
    {
      label: "Browse Courses",
      path: "/course-list",
      icon: FiBook,
      onClick: () => navigate("/course-list"),
    },
    {
      label: "My Enrollments",
      path: "/my-enrollments",
      icon: FiBookOpen,
      onClick: () => navigate("/my-enrollments"),
    },
    {
      label: "Pending Purchases",
      path: "/pending-purchases",
      icon: FiClock,
      onClick: () => navigate("/pending-purchases"),
    },
  ];

  return (
    <div
      className={`px-3 sm:px-4 md:px-6 lg:px-8 border-b border-gray-200 py-2 sm:py-3 shadow-sm ${
        isCourseListPage
          ? "bg-white"
          : "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Link to="/" className="flex items-center min-w-0">
            <img
              onClick={() => navigate("/")}
              src={assets.edulecta}
              alt="Edulecta Logo"
              className="w-20 sm:w-24 md:w-28 lg:w-32 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden xl:flex items-center gap-3 lg:gap-8 mr-8 lg:mr-15">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={item.onClick}
                className={`flex items-center gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <IconComponent size={16} />
                <span className="text-xs lg:text-sm">{item.label}</span>
              </button>
            );
          })}

          {/* Educator Button */}
          <button
            onClick={becomeEducator}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
              location.pathname === "/educator"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FiUsers size={16} />
            <span className="text-xs lg:text-sm">
              {isEducator ? "Educator Dashboard" : "Become Educator"}
            </span>
          </button>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* User Greeting - Hidden on small screens */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800 truncate">
                Hi, {user ? user.firstName : "Student"}!
              </p>
              <p className="text-xs text-gray-500">
                {user ? "Learning Dashboard" : "Welcome"}
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

          {/* Mobile Menu Button */}
          <div className="xl:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            >
              {menuOpen ? (
                <FiX
                  size={20}
                  className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200"
                />
              ) : (
                <FiMenu
                  size={20}
                  className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200"
                />
              )}
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
                <button
                  key={item.path}
                  onClick={() => {
                    setMenuOpen(false);
                    item.onClick();
                  }}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 mx-2 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <IconComponent size={18} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}

            {/* Educator Button */}
            <button
              onClick={() => {
                setMenuOpen(false);
                becomeEducator();
              }}
              className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 mx-2 ${
                location.pathname === "/educator"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <FiUsers size={18} />
              <span className="text-sm">
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </span>
            </button>

            {/* Mobile User Info */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 mx-2">
              <div className="flex items-center gap-3 px-2 sm:px-4 py-2">
                <FiUser size={18} className="text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user ? user.firstName : "Student"}
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
