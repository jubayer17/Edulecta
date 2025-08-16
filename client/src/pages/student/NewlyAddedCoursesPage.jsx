import React, { useContext, useEffect, useState, useMemo } from "react";
import { FaPlus, FaHome, FaClock } from "react-icons/fa";
import { AppContext } from "../../context/AppContext";
import CourseCard from "../../components/student/CourseCard";
import Footer from "../../components/student/Footer";

const NewlyAddedCoursesPage = () => {
  const { navigate, allCourses, calculateRating } = useContext(AppContext);
  const [sortOption, setSortOption] = useState("newest");
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Get all courses sorted by creation date (newest first)
  const newlyAddedCourses = useMemo(() => {
    if (!allCourses?.length) return [];

    // Filter published courses only
    const publishedCourses = allCourses.filter((course) => course.isPublished);

    // Sort by creation date (newest first)
    return publishedCourses.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [allCourses]);

  useEffect(() => {
    let tempCourses = [...newlyAddedCourses];

    // Apply additional sorting
    switch (sortOption) {
      case "popular":
        tempCourses.sort((a, b) => {
          const aRating = calculateRating(a);
          const bRating = calculateRating(b);
          const aEnrolled = a.enrolledStudents?.length || 0;
          const bEnrolled = b.enrolledStudents?.length || 0;

          const aScore = aEnrolled * 0.6 + aRating * 0.4;
          const bScore = bEnrolled * 0.6 + bRating * 0.4;

          return bScore - aScore;
        });
        break;
      case "priceLow":
        tempCourses.sort((a, b) => a.coursePrice - b.coursePrice);
        break;
      case "priceHigh":
        tempCourses.sort((a, b) => b.coursePrice - a.coursePrice);
        break;
      case "rating":
        tempCourses.sort((a, b) => calculateRating(b) - calculateRating(a));
        break;
      case "newest":
      default:
        // Already sorted by newest
        break;
    }

    setFilteredCourses(tempCourses);
  }, [newlyAddedCourses, sortOption, calculateRating]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg">
                  <FaPlus className="text-white text-xl md:text-2xl" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Newly Added Courses
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
                <span className="font-semibold text-gray-700">Newly Added</span>
              </nav>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full md:w-auto rounded-lg border border-gray-300 px-4 py-3 md:px-3 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Course Stats */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                Showing{" "}
                <span className="font-semibold text-green-600">
                  {filteredCourses.length}
                </span>{" "}
                recently added course
                {filteredCourses.length !== 1 ? "s" : ""}
              </p>
              {filteredCourses.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FaClock className="text-xs" />
                  <span>
                    Latest: {formatDate(filteredCourses[0]?.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="transform hover:scale-[1.02] transition duration-300 ease-in-out relative"
                >
                  {/* New badge for courses added within last 7 days */}
                  {(() => {
                    const daysSinceCreated = Math.ceil(
                      Math.abs(new Date() - new Date(course.createdAt)) /
                        (1000 * 60 * 60 * 24)
                    );
                    return daysSinceCreated <= 7 ? (
                      <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        NEW
                      </div>
                    ) : null;
                  })()}
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-20 text-gray-400 px-4">
              <div className="max-w-md mx-auto">
                <FaPlus className="text-6xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg md:text-xl mb-2">
                  No new courses available yet
                </p>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  Check back later for the latest course additions!
                </p>
                <button
                  onClick={() => navigate("/course-list")}
                  className="mt-6 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
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

export default NewlyAddedCoursesPage;
