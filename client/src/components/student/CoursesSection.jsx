import React, { useContext } from "react";
import { Link } from "react-router-dom";

import CourseCard from "./CourseCard";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <div className="flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8 xl:px-12 w-full relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 w-full max-w-[1600px] flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Popular Courses
          </div>

          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4">
            Learn from the best
          </h2>

          <p className="text-center text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Discover our top-rated courses across various categories. From
            coding and design to business and wellness, our courses are crafted
            to deliver
            <span className="text-blue-600 font-semibold"> real results</span>.
          </p>

          {/* Stats - Enhanced mobile responsiveness */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>5,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Expert Instructors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Industry Certified</span>
            </div>
          </div>
        </div>

        {/* Grid for 4 cards - Enhanced width and mobile responsiveness */}
        <div className="w-full max-w-[1400px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-12 px-4 sm:px-6 lg:px-8 relative">
          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl animate-pulse"></div>
          <div
            className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-pink-200/30 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          {allCourses.slice(0, 4).map((course, index) => (
            <div
              key={index}
              className="transform transition-all duration-500 hover:scale-[1.02] opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: "forwards",
              }}
            >
              <CourseCard course={course} assets={assets} />
            </div>
          ))}
        </div>

        {/* Enhanced Show All Button */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <Link
            to="/course-list"
            onClick={() => window.scrollTo(0, 0)}
            className="group relative inline-flex items-center gap-3 bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:border-blue-300 hover:text-blue-700 hover:shadow-xl hover:scale-105 overflow-hidden"
          >
            {/* Button background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <span className="relative z-10">Show all courses</span>
            <svg
              className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>

          {/* Additional info */}
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span>Explore 100+ courses</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>New courses added weekly</span>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CoursesSection;
