import React, { useContext, useEffect, useState, useMemo } from "react";
import { FaTrophy, FaHome } from "react-icons/fa";
import { AppContext } from "../../context/AppContext";
import CourseCard from "../../components/student/CourseCard";
import Footer from "../../components/student/Footer";

const TopPicksCoursesPage = () => {
  const { navigate, allCourses, calculateRating } = useContext(AppContext);
  const [sortOption, setSortOption] = useState("rating");
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Get all courses sorted by rating (highest rated first)
  const topPicksCourses = useMemo(() => {
    if (!allCourses?.length) return [];

    // Filter published courses only
    const publishedCourses = allCourses.filter((course) => course.isPublished);

    // Sort by rating (highest first)
    return publishedCourses.sort((a, b) => {
      const aRating = calculateRating(a);
      const bRating = calculateRating(b);
      return bRating - aRating; // Descending order (highest rating first)
    });
  }, [allCourses, calculateRating]);

  useEffect(() => {
    let tempCourses = [...topPicksCourses];

    // Apply additional sorting
    switch (sortOption) {
      case "newest":
        tempCourses.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "priceLow":
        tempCourses.sort((a, b) => a.coursePrice - b.coursePrice);
        break;
      case "priceHigh":
        tempCourses.sort((a, b) => b.coursePrice - a.coursePrice);
        break;
      case "popular":
        tempCourses.sort((a, b) => {
          const aEnrolled = a.enrolledStudents?.length || 0;
          const bEnrolled = b.enrolledStudents?.length || 0;
          return bEnrolled - aEnrolled; // Most enrolled first
        });
        break;
      case "rating":
      default:
        // Already sorted by rating
        break;
    }

    setFilteredCourses(tempCourses);
  }, [topPicksCourses, sortOption, calculateRating]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                  <FaTrophy className="text-white text-xl md:text-2xl" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Top Picks Courses
                </h1>
              </div>
              <nav className="text-gray-500 text-sm space-x-2">
                <span
                  onClick={() => navigate("/")}
                  className="text-indigo-600 cursor-pointer hover:underline active:text-indigo-800 flex items-center gap-1"
                >
                  <FaHome className="text-xs" />
                  Home
                </span>
                <span>/</span>
                <span className="font-semibold text-gray-700">Top Picks</span>
              </nav>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full md:w-auto rounded-lg border border-gray-300 px-4 py-3 md:px-3 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white shadow-sm"
              >
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Enrolled</option>
                <option value="newest">Newest</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Course Stats */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <p className="text-gray-600 text-sm">
              Showing{" "}
              <span className="font-semibold text-orange-600">
                {filteredCourses.length}
              </span>{" "}
              top-rated courses
              {filteredCourses.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="transform hover:scale-[1.02] transition duration-300 ease-in-out"
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-20 text-gray-400 px-4">
              <div className="max-w-md mx-auto">
                <FaTrophy className="text-6xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg md:text-xl mb-2">
                  No top picks available yet
                </p>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  Check back later for our most popular courses!
                </p>
                <button
                  onClick={() => navigate("/course-list")}
                  className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Browse All Courses
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TopPicksCoursesPage;
