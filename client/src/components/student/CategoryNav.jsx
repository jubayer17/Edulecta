import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const CategoryNav = () => {
  const { backendUrl } = useContext(AppContext);
  const [categoriesWithCourses, setCategoriesWithCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/category/with-courses`);
        const data = await response.json();

        if (data.success) {
          setCategoriesWithCourses(data.categories);
        } else {
          setError("Failed to fetch categories with courses");
        }
      } catch (error) {
        console.error("Error fetching categories with courses:", error);
        setError("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40 py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40 py-20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              const loadCategories = async () => {
                try {
                  setLoading(true);
                  const response = await fetch(
                    `${backendUrl}/api/category/with-courses`
                  );
                  const data = await response.json();

                  if (data.success) {
                    setCategoriesWithCourses(data.categories);
                  } else {
                    setError("Failed to fetch categories with courses");
                  }
                } catch (error) {
                  console.error(
                    "Error fetching categories with courses:",
                    error
                  );
                  setError("Failed to load category data");
                } finally {
                  setLoading(false);
                }
              };
              loadCategories();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800">
              Course Categories
            </h1>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {categoriesWithCourses.length} Categories
            </div>
          </div>
          <p className="text-gray-600">
            Explore courses by category and discover the most popular content
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesWithCourses.map((category) => (
          <div
            key={category._id}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() =>
              setSelectedCategory(
                selectedCategory === category._id ? null : category._id
              )
            }
          >
            {/* Category Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <h3 className="text-xl font-bold mb-2">{category.name}</h3>
              {category.description && (
                <p className="text-blue-100 text-sm mb-3">
                  {category.description}
                </p>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {category.courseCount}
                    </div>
                    <div className="text-xs text-blue-100">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {category.totalEnrollments}
                    </div>
                    <div className="text-xs text-blue-100">Students</div>
                  </div>
                </div>
                <img
                  src={assets.dropdown_icon}
                  alt="expand"
                  className={`w-5 h-5 transition-transform duration-300 ${
                    selectedCategory === category._id ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* Category Courses (Expandable) */}
            {selectedCategory === category._id && (
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Top Courses ({category.courses.length})
                </h4>
                {category.courses.length > 0 ? (
                  <div className="space-y-4">
                    {category.courses.slice(0, 5).map((course) => (
                      <div
                        key={course._id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <img
                          src={
                            course.courseThumbnail ||
                            "https://via.placeholder.com/60x40/4F46E5/FFFFFF?text=Course"
                          }
                          alt={course.courseTitle}
                          className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-800 truncate text-sm">
                            {course.courseTitle}
                          </h5>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {course.enrolledStudents} students
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              ${course.coursePrice}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {category.courses.length > 5 && (
                      <div className="text-center pt-2">
                        <span className="text-sm text-gray-500">
                          +{category.courses.length - 5} more courses
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      No courses in this category yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categoriesWithCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
            <img
              src={assets.search_icon}
              alt="No categories"
              className="w-8 h-8 opacity-50"
            />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            No categories available
          </p>
          <p className="text-gray-400 text-sm">
            Categories will appear here once they are created
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryNav;
