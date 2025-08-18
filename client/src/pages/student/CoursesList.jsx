import React, { useContext, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import { AppContext } from "../../context/AppContext";
import SearchBar from "../../components/student/SearchBar";
import CourseCard from "../../components/student/CourseCard";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";

const CoursesList = () => {
  const { navigate, allCourses, fetchAllCourses, isEducator } =
    useContext(AppContext);
  const { input } = useParams();
  const location = useLocation();
  const [sortOption, setSortOption] = useState("popular");
  const [filteredCourse, setFilteredCourse] = useState([]);

  // Get category from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = searchParams.get('category');

  console.log("Current user is educator:", isEducator);
  console.log("Category filter from URL:", categoryFilter);

  useEffect(() => {
    console.log("CoursesList mounted, fetching fresh data...");
    fetchAllCourses();
  }, [fetchAllCourses]);

  useEffect(() => {
    console.log("\n📊 Course List Update:");
    console.log("All Courses from Context:", allCourses);

    if (!allCourses?.length) {
      console.log("❌ No courses available");
      return;
    }

    // Deep clone to avoid reference issues
    let tempCourses = JSON.parse(JSON.stringify(allCourses));

    console.log("Course Distribution:", {
      total: tempCourses.length,
      published: tempCourses.filter((c) => c.isPublished).length,
      unpublished: tempCourses.filter((c) => !c.isPublished).length,
    });

    // Show all courses before filtering
    console.log(
      "All available courses:",
      tempCourses.map((c) => ({
        id: c._id,
        title: c.courseTitle,
        isPublished: c.isPublished,
        price: c.coursePrice,
      }))
    );

    // If user is not an educator, show only published courses
    if (!isEducator) {
      console.log("Filtering for published courses only (student view)");
      tempCourses = tempCourses.filter((course) => course.isPublished);
    } else {
      console.log("Showing all courses (educator view)");
    }
    console.log(
      "Courses after publish filter:",
      tempCourses.map((c) => ({
        id: c._id,
        title: c.courseTitle,
        isPublished: c.isPublished,
      }))
    );

    if (input) {
      tempCourses = tempCourses.filter((course) =>
        course.courseTitle.toLowerCase().includes(input.toLowerCase())
      );
      console.log("After search filter:", tempCourses.length, "courses");
    }

    // Apply category filter if present
    if (categoryFilter) {
      tempCourses = tempCourses.filter((course) =>
        course.courseCategory && course.courseCategory.toLowerCase() === categoryFilter.toLowerCase()
      );
      console.log("After category filter:", tempCourses.length, "courses for category:", categoryFilter);
    }

    // Apply sorting
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
      default:
        // Sort by number of enrolled students
        tempCourses.sort(
          (a, b) =>
            (b.enrolledStudents?.length || 0) -
            (a.enrolledStudents?.length || 0)
        );
        break;
    }

    setFilteredCourse(tempCourses);
  }, [allCourses, input, sortOption, categoryFilter, isEducator]);

  return (
    <div className="pb-20 md:pb-0">
      {" "}
      {/* Bottom padding for mobile nav */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaBookOpen className="text-indigo-600 text-xl md:text-2xl" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 select-none">
                  Course List
                </h1>
              </div>
              <nav className="text-gray-500 text-sm space-x-2">
                <span
                  onClick={() => navigate("/")}
                  className="text-indigo-600 cursor-pointer hover:underline active:text-indigo-800"
                >
                  Home
                </span>
                <span>/</span>
                <span className="font-semibold text-gray-700">Courses</span>
              </nav>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:gap-4">
              <div className="w-full md:w-auto">
                <SearchBar />
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full md:w-auto rounded-lg border border-gray-300 px-4 py-3 md:px-3 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white shadow-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Search Indicator */}
          {input && (
            <div className="inline-flex items-center gap-3 md:gap-4 py-3 md:py-2 px-4 border rounded-lg text-sm bg-white shadow-sm mb-6 md:mb-8 text-gray-600 w-full md:w-auto">
              <span className="text-xs md:text-sm">Showing results for:</span>
              <strong className="text-indigo-600 text-sm md:text-base">
                {input}
              </strong>
              <img
                src={assets.cross_icon}
                alt="Clear"
                className="w-5 h-5 md:w-4 md:h-4 cursor-pointer hover:opacity-70 active:scale-95 transition-all duration-200 ml-auto"
                onClick={() => navigate("/course-list")}
              />
            </div>
          )}

          {/* Active Category Filter Indicator */}
          {categoryFilter && (
            <div className="inline-flex items-center gap-3 md:gap-4 py-3 md:py-2 px-4 border rounded-lg text-sm bg-blue-50 shadow-sm mb-6 md:mb-8 text-gray-600 w-full md:w-auto">
              <span className="text-xs md:text-sm">Category:</span>
              <strong className="text-blue-600 text-sm md:text-base">
                {categoryFilter}
              </strong>
              <img
                src={assets.cross_icon}
                alt="Clear"
                className="w-5 h-5 md:w-4 md:h-4 cursor-pointer hover:opacity-70 active:scale-95 transition-all duration-200 ml-auto"
                onClick={() => navigate("/course-list")}
              />
            </div>
          )}

          {/* Courses Grid */}
          {filteredCourse.length > 0 ? (
            <>
              {/* Results count for mobile */}
              <div className="mb-4 md:hidden">
                <p className="text-sm text-gray-600">
                  {filteredCourse.length} course
                  {filteredCourse.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 px-2 sm:px-0">
                {filteredCourse.map((course) => (
                  <div
                    key={course._id}
                    className="transform hover:scale-[1.02] md:hover:scale-[1.04] transition duration-300 ease-in-out w-full max-w-[300px] mx-auto sm:max-w-none"
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center mt-16 md:mt-20 text-gray-400 px-4">
              <div className="max-w-md mx-auto">
                <p className="text-lg md:text-xl mb-2 select-none">
                  No courses found 😞
                </p>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed select-none">
                  Try adjusting your search terms or clear the filter to see all
                  available courses.
                </p>
                {input && (
                  <button
                    onClick={() => navigate("/course-list")}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CoursesList;
