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
  FiShoppingBag,
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
  const {
    navigate,
    isEducator,
    backendUrl,
    setIsEducator,
    getToken,
    cartItems,
    toggleCartDrawer,
  } = useContext(AppContext);

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
    <>
      {/* Mobile Navigation Bar */}
      <div
        className={`md:hidden px-3 py-2 border-b border-gray-200/50 shadow-sm backdrop-blur-lg ${
          isCourseListPage
            ? "bg-white/95"
            : "bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-purple-50/90"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={assets.edulecta}
              alt="Edulecta"
              className="w-24 h-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Right side: Cart + Profile + Menu */}
          <div className="flex items-center gap-3">
            {/* Cart Icon - Enhanced */}
            <button
              onClick={toggleCartDrawer}
              className="relative p-2.5 rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg border border-white/50 group"
            >
              <FiShoppingBag className="w-5 h-5 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
              {cartItems.length > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse border-2 border-white">
                    {cartItems.length > 9 ? "9+" : cartItems.length}
                  </span>
                  <span className="absolute -top-1 -right-1 bg-red-400 rounded-full w-6 h-6 animate-ping"></span>
                </>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center">
              {user ? (
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-9 h-9 ring-2 ring-blue-100 hover:ring-blue-200 transition-all",
                    },
                  }}
                />
              ) : (
                <button
                  onClick={openSignIn}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                >
                  <FiUser size={14} />
                  <span className="hidden xs:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative p-2.5 rounded-full hover:bg-white/80 transition-all duration-300 group shadow-md border border-white/50"
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute block w-5 h-0.5 bg-gray-600 group-hover:bg-blue-600 transition-all duration-300 ${
                    menuOpen
                      ? "rotate-45 translate-y-0"
                      : "rotate-0 -translate-y-1.5"
                  }`}
                ></span>
                <span
                  className={`absolute block w-5 h-0.5 bg-gray-600 group-hover:bg-blue-600 transition-all duration-300 ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`absolute block w-5 h-0.5 bg-gray-600 group-hover:bg-blue-600 transition-all duration-300 ${
                    menuOpen
                      ? "-rotate-45 translate-y-0"
                      : "rotate-0 translate-y-1.5"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu with Enhanced Animation */}
        <div
          className={`absolute left-0 right-0 top-full z-50 transition-all duration-300 ease-in-out ${
            menuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="mx-3 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
            {/* User Info Header */}
            {user && (
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.firstName?.[0] || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      Hi, {user.firstName}!
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {user.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <div className="py-2">
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setMenuOpen(false);
                      item.onClick();
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                );
              })}

              {/* Educator Button */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  becomeEducator();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-200 ${
                  location.pathname === "/educator"
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    location.pathname === "/educator"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <FiUsers size={16} />
                </div>
                <span className="font-medium text-sm">
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </span>
              </button>
            </div>

            {/* Sign In Button for non-users */}
            {!user && (
              <div className="p-4 border-t border-gray-100/50">
                <button
                  onClick={() => {
                    openSignIn();
                    setMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  Sign In to Continue
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop */}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
          ></div>
        )}
      </div>

      {/* Desktop Navigation Bar */}
      <div
        className={`hidden md:block px-6 lg:px-8 border-b border-gray-200 py-3 shadow-sm ${
          isCourseListPage
            ? "bg-white"
            : "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Link to="/" className="flex items-center min-w-0">
              <img
                onClick={() => navigate("/")}
                src={assets.edulecta}
                alt="Edulecta Logo"
                className="w-28 lg:w-32 cursor-pointer hover:opacity-80 transition-opacity duration-200"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center gap-8 mr-15">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={item.onClick}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <IconComponent size={16} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}

            {/* Educator Button */}
            <button
              onClick={becomeEducator}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === "/educator"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <FiUsers size={16} />
              <span className="text-sm">
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </span>
            </button>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Cart Icon - Enhanced for Desktop */}
            <button
              onClick={toggleCartDrawer}
              className="relative p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 border border-gray-200 hover:border-blue-300 group shadow-sm hover:shadow-md"
            >
              <FiShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
              {cartItems.length > 0 && (
                <>
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold animate-pulse border-2 border-white shadow-lg">
                    {cartItems.length > 9 ? "9+" : cartItems.length}
                  </span>
                  <span className="absolute -top-2 -right-2 bg-red-400 rounded-full w-7 h-7 animate-ping"></span>
                </>
              )}
              {cartItems.length === 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gray-300 rounded-full opacity-60"></span>
              )}
            </button>

            {/* User Greeting */}
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
                        "w-10 h-10 ring-2 ring-blue-100 hover:ring-blue-200 transition-all",
                    },
                  }}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <img
                    src={assets.profile_img}
                    alt="Profile"
                    className="w-10 h-10 rounded-full ring-2 ring-gray-200"
                  />
                  <button
                    onClick={openSignIn}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
