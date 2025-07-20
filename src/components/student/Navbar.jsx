/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { assets } from "./../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const location = useLocation();
  const isCourseListPage = location.pathname.includes("/course-list");
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`px-4 sm:px-6 md:px-10 lg:px-36 border-b border-gray-300 py-3 ${
        isCourseListPage ? "bg-white" : "bg-green-200/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <Link to="/">
          <img
            src={assets.edulecta}
            alt="Edulecta Logo"
            className="w-24 sm:w-28 md:w-32 cursor-pointer"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-gray-600 text-sm sm:text-base">
          <Link to="/educator" className="hover:text-blue-600 font-medium">
            Become Educator
          </Link>
          <Link
            to="/my-enrollments"
            className="hover:text-blue-600 font-medium"
          >
            My Enrollments
          </Link>
          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <button
              onClick={openSignIn}
              className="bg-blue-600 text-white px-5 py-2 rounded-full"
            >
              Create Account
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="flex flex-col mt-3 gap-3 md:hidden text-gray-700 text-base border-t pt-4">
          <Link
            to="/educator"
            className="hover:text-blue-600 font-medium px-2"
            onClick={() => setMenuOpen(false)}
          >
            Become Educator
          </Link>
          <Link
            to="/my-enrollments"
            className="hover:text-blue-600 font-medium px-2"
            onClick={() => setMenuOpen(false)}
          >
            My Enrollments
          </Link>

          {user ? (
            <div className="flex justify-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-full w-full text-left flex justify-center"
              onClick={() => {
                openSignIn();
                setMenuOpen(false);
              }}
            >
              Create Account
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
