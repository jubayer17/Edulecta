import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import CourseCard from "./CourseCard";

const CategoryCourses = ({ selectedCategory }) => {
  const { backendUrl } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses based on selected category
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = `${backendUrl}/api/course/all`;
        if (selectedCategory) {
          url += `?category=${encodeURIComponent(selectedCategory)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.courses) {
          // Sort courses by enrollment count (most enrolled first)
          const sortedCourses = data.courses.sort((a, b) => {
            const aEnrollments =
              a.enrollments?.length || a.enrolledStudents?.length || 0;
            const bEnrollments =
              b.enrollments?.length || b.enrolledStudents?.length || 0;
            return bEnrollments - aEnrollments;
          });
          setCourses(sortedCourses);
        } else {
          setError("Failed to fetch courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedCategory, backendUrl]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium">{error}</div>
          <p className="text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <img
            src={assets.search_icon}
            alt="No courses"
            className="w-16 h-16 mx-auto mb-4 opacity-50"
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-500">
            {selectedCategory
              ? `No courses available in "${selectedCategory}" category`
              : "No courses available at the moment"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedCategory ? `${selectedCategory} Courses` : "All Courses"}
        </h2>
        <p className="text-gray-600">
          {courses.length} {courses.length === 1 ? "course" : "courses"} found
          {selectedCategory && ` in ${selectedCategory}`}
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default CategoryCourses;
