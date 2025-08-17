import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";

import CourseCard from "./CourseCard";
import { AppContext } from "../../context/AppContext";

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);

  // Filter to show only published courses (first 4)
  const publishedCourses = useMemo(() => {
    if (!allCourses?.length) return [];
    return allCourses.filter((course) => course.isPublished).slice(0, 4);
  }, [allCourses]);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-4 md:px-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 px-2 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Popular Courses
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              Learn from the best courses across various categories
            </p>
          </div>
        </div>

        <Link
          to="/course-list"
          onClick={() => window.scrollTo(0, 0)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
        >
          <span className="hidden sm:inline">View All</span>
          <span className="sm:hidden">All</span>
          <svg
            className="w-4 h-4 transform transition-transform duration-300"
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
      </div>

      {/* Courses Grid - Better mobile padding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
        {publishedCourses.map((course) => (
          <div
            key={course._id}
            className="transform hover:scale-[1.02] transition duration-300 ease-in-out w-full max-w-[300px] mx-auto sm:max-w-none"
          >
            <CourseCard course={course} />
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-8 text-sm text-gray-500">
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
    </section>
  );
};

export default CoursesSection;
