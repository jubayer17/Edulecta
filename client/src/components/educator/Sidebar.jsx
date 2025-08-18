import React from "react";
import { assets } from "../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiPlus,
  FiBook,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiChevronRight,
  FiX,
  FiGrid,
} from "react-icons/fi";

const Sidebar = ({ isOpen = true, toggleSidebar, isMobile = false }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/educator",
      icon: FiBarChart2,
      description: "Overview & Analytics",
    },
    {
      name: "Add Course",
      path: "/educator/add-course",
      icon: FiPlus,
      description: "Create New Course",
    },
    {
      name: "My Courses",
      path: "/educator/my-courses",
      icon: FiBook,
      description: "Manage Your Courses",
    },
    {
      name: "Update Courses",
      path: "/educator/update-courses",
      icon: FiSettings,
      description: "Edit Existing Courses",
    },
    {
      name: "Categories",
      path: "/educator/categories",
      icon: FiGrid,
      description: "Manage Categories",
    },
    {
      name: "Students Enrolled",
      path: "/educator/students-enrolled",
      icon: FiUsers,
      description: "View Student List",
    },
  ];

  return (
    <div
      className={`w-64 sm:w-72 lg:w-64 h-screen bg-white border-r border-gray-200 shadow-lg fixed left-0 top-0 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${isMobile ? "shadow-2xl" : "shadow-lg"}`}
    >
      {/* Sidebar Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src={assets.logo}
              alt="Edulecta"
              className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                Educator
              </h2>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>

          {/* Close Button - Enhanced for mobile */}
          {isOpen && toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group flex-shrink-0"
              title="Close Sidebar"
            >
              <FiX
                size={isMobile ? 24 : 20}
                className="text-gray-600 group-hover:text-red-500 transition-colors duration-200"
              />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto">
        <div className="space-y-1 sm:space-y-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/educator" &&
                location.pathname === "/educator/dashboard");

            return (
              <Link
                key={index}
                to={item.path}
                onClick={isMobile ? toggleSidebar : undefined} // Auto-close on mobile
                className={`group flex items-center justify-between p-3 sm:p-3 rounded-xl transition-all duration-200 hover:bg-blue-50 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div
                    className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? "bg-white/20"
                        : "bg-gray-100 group-hover:bg-blue-100"
                    }`}
                  >
                    <IconComponent
                      size={isMobile ? 20 : 18}
                      className={
                        isActive
                          ? "text-white"
                          : "text-gray-600 group-hover:text-blue-600"
                      }
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-medium text-sm sm:text-sm truncate ${
                        isActive
                          ? "text-white"
                          : "text-gray-800 group-hover:text-blue-600"
                      }`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        isActive ? "text-blue-100" : "text-gray-500"
                      } ${isMobile ? "hidden" : "block"}`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                <FiChevronRight
                  size={14}
                  className={`transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? "text-white transform translate-x-1"
                      : "text-gray-400 group-hover:text-blue-500 group-hover:transform group-hover:translate-x-1"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Section - Hide on mobile to save space */}
        {!isMobile && (
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Total Courses</span>
                <span className="text-xs font-medium text-blue-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Students</span>
                <span className="text-xs font-medium text-green-600">124</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Revenue</span>
                <span className="text-xs font-medium text-purple-600">
                  $2,450
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="p-2 bg-gray-200 rounded-lg">
            <FiSettings size={16} className="text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Settings</p>
            <p className="text-xs text-gray-500">Preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
