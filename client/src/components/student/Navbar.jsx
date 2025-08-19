/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from "react";
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
  FiHeart,
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
    cartVibrating,
    pendingPurchases = [],
    fetchPendingPurchases,
    fetchEducatorDashboard,
  } = useContext(AppContext);

  // Debug logging for pending purchases
  console.log("🔍 Navbar pendingPurchases:", pendingPurchases.length);

  // Fetch pending purchases when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchPendingPurchases();
    }
  }, [user, fetchPendingPurchases]);

  const becomeEducator = async () => {
    try {
      // If already an educator, just navigate to dashboard
      if (isEducator) {
        console.log("🏫 User is already an educator, navigating to dashboard");
        navigate("/educator");
        return;
      }

      // Check if user is signed in
      if (!user) {
        console.log("👤 User not signed in, opening sign-in modal");
        toast.info("Please sign in to become an educator");
        openSignIn();
        return;
      }

      console.log("🔄 Starting educator role assignment process...");

      const token = await getToken();
      if (!token) {
        console.error("❌ No authentication token available");
        toast.error("Authentication token missing. Please sign in again.");
        openSignIn();
        return;
      }

      // Show loading state
      toast.info("Setting up your educator account...");

      console.log("📡 Sending educator role update request...");
      const { data } = await axios.post(
        `${backendUrl}/api/educator/update-role-educator`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📥 Educator role update response:", data);

      if (data.success) {
        console.log("✅ Educator role assigned successfully");

        // Update local state immediately
        setIsEducator(true);

        // Refresh educator dashboard data
        try {
          await fetchEducatorDashboard();
        } catch (dashboardError) {
          console.warn(
            "⚠️ Failed to fetch educator dashboard after role assignment:",
            dashboardError
          );
        }

        // Show success message and navigate
        toast.success(
          "🎉 Welcome to Edulecta Educators! You can now create and manage courses."
        );

        // Add a small delay to let the success message show
        setTimeout(() => {
          navigate("/educator");
        }, 1000);
      } else {
        console.error("❌ Educator role assignment failed:", data);
        toast.error(
          data.message || "Failed to become educator. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Error in becomeEducator:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });

      // Enhanced error handling
      let errorMessage = "Error becoming educator. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "Authentication expired. Please sign in again.";
        setTimeout(() => openSignIn(), 1000);
      } else if (error.response?.status === 404) {
        errorMessage =
          "User account not found. Please ensure you're properly signed in.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again in a few moments.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
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
      badge: pendingPurchases.length > 0 ? pendingPurchases.length : null,
    },
  ];

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-2 border-b border-gray-200/60 shadow-lg backdrop-blur-lg ${
          isCourseListPage
            ? "bg-white/98"
            : "bg-gradient-to-r from-blue-50/98 via-indigo-50/98 to-purple-50/98"
        }`}
        style={{ backdropFilter: "blur(20px)" }}
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

          {/* Right side: Cart + Wishlist + Profile + Menu */}
          <div className="flex items-center gap-2">
            {/* Cart Icon - Enhanced */}
            <button
              onClick={toggleCartDrawer}
              className={`relative p-3 rounded-xl transition-all duration-300 group transform hover:scale-105 ${
                cartVibrating ? "animate-bounce" : ""
              } ${
                cartItems.length > 0
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-md"
                  : "bg-white/90 border border-gray-200 shadow-sm"
              }`}
            >
              <FiShoppingBag
                className={`w-5 h-5 transition-all duration-300 ${
                  cartItems.length > 0
                    ? "text-blue-600"
                    : "text-gray-600 group-hover:text-blue-600"
                } group-hover:scale-110`}
              />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white shadow-lg">
                  {cartItems.length > 9 ? "9+" : cartItems.length}
                </span>
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
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Wishlist"
                      labelIcon={<FiHeart />}
                      href="/wishlist"
                    />
                    <UserButton.Link
                      label="Cart"
                      labelIcon={<FiShoppingBag />}
                      href="/cart"
                    />
                  </UserButton.MenuItems>
                </UserButton>
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
              className="relative p-3 rounded-xl bg-white/90 hover:bg-white transition-all duration-300 group shadow-md border border-gray-200 hover:border-gray-300 transform hover:scale-105"
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute block w-5 h-0.5 bg-gray-700 group-hover:bg-blue-600 transition-all duration-300 ${
                    menuOpen
                      ? "rotate-45 translate-y-0"
                      : "rotate-0 -translate-y-1.5"
                  }`}
                ></span>
                <span
                  className={`absolute block w-5 h-0.5 bg-gray-700 group-hover:bg-blue-600 transition-all duration-300 ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`absolute block w-5 h-0.5 bg-gray-700 group-hover:bg-blue-600 transition-all duration-300 ${
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
                const isPendingPurchases = item.path === "/pending-purchases";

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setMenuOpen(false);
                      item.onClick();
                    }}
                    className={`w-full relative flex items-center gap-4 px-4 py-3 transition-all duration-200 ${
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

                    {/* Pending Purchases Counter Badge for Mobile */}
                    {isPendingPurchases && pendingPurchases.length > 0 && (
                      <div className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                        {pendingPurchases.length > 99
                          ? "99+"
                          : pendingPurchases.length}
                      </div>
                    )}

                    {isActive && !isPendingPurchases && (
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
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 px-6 lg:px-8 border-b border-gray-200/60 py-3 shadow-lg backdrop-blur-lg ${
          isCourseListPage
            ? "bg-white/98"
            : "bg-gradient-to-r from-blue-50/98 via-indigo-50/98 to-purple-50/98"
        }`}
        style={{ backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Link to="/" className="flex items-center min-w-0 group">
              <img
                onClick={() => navigate("/")}
                src={assets.edulecta}
                alt="Edulecta Logo"
                className="w-32 lg:w-36 cursor-pointer transition-all duration-300 transform group-hover:scale-105 drop-shadow-sm"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center gap-6 mr-8">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              const isPendingPurchases = item.path === "/pending-purchases";
              return (
                <button
                  key={item.path}
                  onClick={item.onClick}
                  className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:text-blue-600 hover:bg-white/80 hover:shadow-md border border-transparent hover:border-blue-200"
                  }`}
                >
                  <IconComponent
                    size={18}
                    className={`transition-transform duration-300 ${
                      isActive ? "" : "group-hover:scale-110"
                    }`}
                  />
                  <span className="text-sm font-semibold">{item.label}</span>

                  {/* Pending Purchases Counter Badge */}
                  {isPendingPurchases && pendingPurchases.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                      {pendingPurchases.length > 99
                        ? "99+"
                        : pendingPurchases.length}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Educator Button */}
            <button
              onClick={becomeEducator}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                location.pathname === "/educator"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                  : "text-gray-700 hover:text-purple-600 hover:bg-white/80 hover:shadow-md border border-transparent hover:border-purple-200"
              }`}
            >
              <FiUsers
                size={18}
                className={`transition-transform duration-300 ${
                  location.pathname === "/educator"
                    ? ""
                    : "group-hover:scale-110"
                }`}
              />
              <span className="text-sm font-semibold">
                {isEducator ? "Dashboard" : "Teach"}
              </span>
            </button>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Cart Icon - Enhanced for Desktop */}
            <button
              onClick={toggleCartDrawer}
              className={`relative p-3 rounded-xl transition-all duration-300 group transform hover:scale-105 ${
                cartVibrating ? "animate-bounce" : ""
              } ${
                cartItems.length > 0
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg"
                  : "bg-white/80 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
              }`}
            >
              <FiShoppingBag
                className={`w-6 h-6 transition-all duration-300 ${
                  cartItems.length > 0
                    ? "text-blue-600 group-hover:text-blue-700"
                    : "text-gray-600 group-hover:text-blue-600"
                } group-hover:scale-110`}
              />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold border-2 border-white shadow-lg animate-pulse">
                  {cartItems.length > 9 ? "9+" : cartItems.length}
                </span>
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
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Wishlist"
                      labelIcon={<FiHeart />}
                      href="/wishlist"
                    />
                    <UserButton.Link
                      label="Cart"
                      labelIcon={<FiShoppingBag />}
                      href="/cart"
                    />
                  </UserButton.MenuItems>
                </UserButton>
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
