import React, { useContext, useMemo } from "react";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";
import { FaPlus, FaArrowRight } from "react-icons/fa";

const NewlyAddedCourses = () => {
  const { allCourses, navigate } = useContext(AppContext);

  // Get 4 newest courses based on creation date
  const newlyAddedCourses = useMemo(() => {
    if (!allCourses?.length) return [];

    // Filter published courses only
    const publishedCourses = allCourses.filter((course) => course.isPublished);

    // Sort by creation date (newest first)
    const sortedCourses = publishedCourses.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sortedCourses.slice(0, 4);
  }, [allCourses]);

  if (!newlyAddedCourses.length) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-4 md:px-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 px-2 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg">
            <FaPlus className="text-white text-lg sm:text-xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Newly Added
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              Fresh courses just added to our platform
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/newly-added-courses")}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
        >
          <span className="hidden sm:inline">View All</span>
          <span className="sm:hidden">All</span>
          <FaArrowRight className="text-sm" />
        </button>
      </div>

      {/* Courses Grid - Better mobile padding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
        {newlyAddedCourses.map((course) => (
          <div
            key={course._id}
            className="transform hover:scale-[1.02] transition duration-300 ease-in-out w-full max-w-[300px] mx-auto sm:max-w-none"
          >
            <CourseCard course={course} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewlyAddedCourses;
