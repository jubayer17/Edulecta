import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const CategoryManagement = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [categoriesWithCourses, setCategoriesWithCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: ""
  });
  const [addingCategory, setAddingCategory] = useState(false);
  const [error, setError] = useState(null);

  // Load categories data
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load both simple categories and categories with course details
        const [categoriesResponse, coursesResponse] = await Promise.all([
          fetch(`${backendUrl}/api/category`),
          fetch(`${backendUrl}/api/category/with-courses`),
        ]);

        const categoriesData = await categoriesResponse.json();
        const coursesData = await coursesResponse.json();

        if (categoriesData.success) {
          setCategories(categoriesData.categories);
        }

        if (coursesData.success) {
          setCategoriesWithCourses(coursesData.categories);
        }

        if (!categoriesData.success && !coursesData.success) {
          setError("Failed to load categories");
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [backendUrl]);

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setAddingCategory(true);

      // Get the authentication token
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        return;
      }

      const response = await fetch(`${backendUrl}/api/category/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Category added successfully!");
        setNewCategory({ name: "", description: "" });
        setShowAddForm(false);

        // Reload categories
        const loadCategories = async () => {
          const [categoriesResponse, coursesResponse] = await Promise.all([
            fetch(`${backendUrl}/api/category`),
            fetch(`${backendUrl}/api/category/with-courses`),
          ]);

          const categoriesData = await categoriesResponse.json();
          const coursesData = await coursesResponse.json();

          if (categoriesData.success) {
            setCategories(categoriesData.categories);
          }

          if (coursesData.success) {
            setCategoriesWithCourses(coursesData.categories);
          }
        };

        loadCategories();
      } else {
        toast.error(data.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    } finally {
      setAddingCategory(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the category "${categoryName}"?`
      )
    ) {
      return;
    }

    try {
      // Get the authentication token
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        return;
      }

      const response = await fetch(`${backendUrl}/api/category/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Category deleted successfully!");

        // Remove from local state
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
        setCategoriesWithCourses((prev) =>
          prev.filter((cat) => cat._id !== categoryId)
        );

        if (selectedCategory === categoryId) {
          setSelectedCategory(null);
        }
      } else {
        toast.error(data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Category Management
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <img src={assets.add_icon} alt="Add" className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Category
          </h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter category name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter category description"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={addingCategory}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {addingCategory ? "Adding..." : "Add Category"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewCategory({ name: "", description: "" });
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Overview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Categories Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {categories.length}
            </div>
            <div className="text-sm text-blue-700">Total Categories</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {categoriesWithCourses.reduce(
                (sum, cat) => sum + cat.courseCount,
                0
              )}
            </div>
            <div className="text-sm text-green-700">Total Courses</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {categoriesWithCourses.reduce(
                (sum, cat) => sum + cat.totalEnrollments,
                0
              )}
            </div>
            <div className="text-sm text-purple-700">Total Enrollments</div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Categories & Courses
        </h3>

        {categoriesWithCourses.length > 0 ? (
          categoriesWithCourses
            .sort((a, b) => b.totalEnrollments - a.totalEnrollments) // Sort by most enrolled
            .map((category) => (
              <div
                key={category._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Category Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {category.name}
                      </h4>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {category.courseCount} courses •{" "}
                          {category.totalEnrollments} students
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setSelectedCategory(
                              selectedCategory === category._id
                                ? null
                                : category._id
                            )
                          }
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <img
                            src={assets.dropdown_icon}
                            alt="expand"
                            className={`w-4 h-4 transition-transform duration-300 ${
                              selectedCategory === category._id
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCategory(category._id, category.name)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <img
                            src={assets.cross_icon}
                            alt="delete"
                            className="w-4 h-4"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Courses */}
                {selectedCategory === category._id && (
                  <div className="p-4">
                    {category.courses.length > 0 ? (
                      <div className="space-y-3">
                        {category.courses
                          .sort(
                            (a, b) => b.enrolledStudents - a.enrolledStudents
                          ) // Sort by most enrolled
                          .map((course) => (
                            <div
                              key={course._id}
                              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
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
                                <h5 className="font-medium text-gray-800 truncate">
                                  {course.courseTitle}
                                </h5>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-sm text-gray-500">
                                    👥 {course.enrolledStudents} students
                                  </span>
                                  <span className="text-sm font-semibold text-green-600">
                                    ${course.coursePrice}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No courses in this category yet
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Courses will appear here when they are assigned to
                          this category
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
        ) : (
          <div className="text-center py-8 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-500 text-lg font-medium">
              No categories available
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Create your first category to organize your courses
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
