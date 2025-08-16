import React, { useContext, useMemo } from "react";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";
import { FaTrophy, FaArrowRight } from "react-icons/fa";

const TopPicksCourses = () => {
  const { allCourses, navigate, calculateRating } = useContext(AppContext);

  // Get top 4 courses based on enrolled students count and rating
  const topPicksCourses = useMemo(() => {
    if (!allCourses?.length) return [];

    // Filter published courses only
    const publishedCourses = allCourses.filter((course) => course.isPublished);

    // Sort by popularity score (enrolled students * 0.6 + rating * 0.4)
    const sortedCourses = publishedCourses.sort((a, b) => {
      const aRating = calculateRating(a);
      const bRating = calculateRating(b);
      const aEnrolled = a.enrolledStudents?.length || 0;
      const bEnrolled = b.enrolledStudents?.length || 0;

      const aScore = aEnrolled * 0.6 + aRating * 0.4;
      const bScore = bEnrolled * 0.6 + bRating * 0.4;

      return bScore - aScore;
    });

    return sortedCourses.slice(0, 4);
  }, [allCourses, calculateRating]);

  if (!topPicksCourses.length) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-4 md:px-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 px-2 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <FaTrophy className="text-white text-lg sm:text-xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Top Picks
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              Most popular courses based on ratings and enrollments
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/top-picks-courses")}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
        >
          <span className="hidden sm:inline">View All</span>
          <span className="sm:hidden">All</span>
          <FaArrowRight className="text-sm" />
        </button>
      </div>

      {/* Courses Grid - Better mobile padding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
        {topPicksCourses.map((course) => (
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

export default TopPicksCourses;
