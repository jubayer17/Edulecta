import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBookOpen,
  FiShoppingCart,
  FiUser,
  FiPlus,
} from "react-icons/fi";
import { AppContext } from "../../context/AppContext";

const BottomNavigation = () => {
  const location = useLocation();
  const { cartItems = [] } = useContext(AppContext);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      id: "home",
      icon: FiHome,
      label: "Home",
      path: "/",
      color: "blue",
    },
    {
      id: "enrollments",
      icon: FiBookOpen,
      label: "Enrollments",
      path: "/my-enrollments",
      color: "green",
    },
    {
      id: "explore",
      icon: FiPlus,
      label: "Explore",
      path: "/course-list",
      color: "purple",
      isCenter: true,
    },
    {
      id: "cart",
      icon: FiShoppingCart,
      label: "Cart",
      path: "/course-list", // Redirect to course list since no cart page exists yet
      color: "orange",
      badge: cartItems.length > 0 ? cartItems.length : null,
    },
    {
      id: "profile",
      icon: FiUser,
      label: "Profile",
      path: "/my-enrollments", // Redirect to enrollments as profile placeholder
      color: "gray",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-lg"></div>

      {/* Navigation Content */}
      <div className="relative px-2 py-2">
        <div className="flex items-end justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => window.scrollTo(0, 0)}
                className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
                  item.isCenter
                    ? "transform -translate-y-4" // Lifted center button
                    : ""
                }`}
              >
                {/* Center button special styling */}
                {item.isCenter ? (
                  <div
                    className={`relative p-4 rounded-full shadow-xl transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 scale-110"
                        : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:scale-105"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 transition-all duration-300 ${
                        active ? "text-white scale-110" : "text-white"
                      }`}
                    />

                    {/* Ripple effect for center button */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        active
                          ? "ring-4 ring-purple-200 animate-pulse"
                          : "ring-0"
                      }`}
                    ></div>
                  </div>
                ) : (
                  /* Regular buttons */
                  <div
                    className={`relative p-3 rounded-2xl transition-all duration-300 ${
                      active
                        ? `bg-${item.color}-100 scale-110`
                        : "hover:bg-gray-100 hover:scale-105"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-all duration-300 ${
                        active
                          ? `text-${item.color}-600`
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    />

                    {/* Badge for cart */}
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {item.badge > 9 ? "9+" : item.badge}
                      </div>
                    )}

                    {/* Active indicator */}
                    {active && !item.isCenter && (
                      <div
                        className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-${item.color}-600 rounded-full animate-pulse`}
                      ></div>
                    )}
                  </div>
                )}

                {/* Label */}
                <span
                  className={`text-xs font-medium mt-1 transition-all duration-300 ${
                    active
                      ? item.isCenter
                        ? "text-purple-600"
                        : `text-${item.color}-600`
                      : "text-gray-500"
                  } ${item.isCenter ? "mt-2" : ""}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Safe area for iPhone notches */}
      <div className="h-safe-area-bottom"></div>
    </div>
  );
};

export default BottomNavigation;
