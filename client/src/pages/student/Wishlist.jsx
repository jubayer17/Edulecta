import React, { useContext, useEffect, useState, useCallback } from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiHeart, FiTrash2 } from "react-icons/fi";

const Wishlist = () => {
  const { backendUrl, getToken, userData } = useContext(AppContext);
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingCourseId, setRemovingCourseId] = useState(null);

  // Fetch wishlist courses
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        toast.error("Please sign in to view your wishlist");
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/user/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        // Filter out any wishlist items with null or undefined courses
        const validWishlistItems = data.wishlist.filter(
          (item) => item && item.course
        );

        // Debug: Log the wishlist data to see educator structure
        console.log("📝 Wishlist data received:", data.wishlist);
        console.log("📝 Valid wishlist items:", validWishlistItems);
        if (validWishlistItems.length > 0) {
          console.log(
            "📝 First course educator:",
            validWishlistItems[0].course.educator
          );
        }

        setWishlistCourses(validWishlistItems);
      } else {
        toast.error(data.error || "Failed to load wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, getToken]);

  // Remove course from wishlist
  const removeFromWishlist = async (courseId) => {
    try {
      setRemovingCourseId(courseId);
      const token = await getToken();

      const { data } = await axios.delete(
        `${backendUrl}/api/user/remove-from-wishlist`,
        {
          data: { courseId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setWishlistCourses((prev) =>
          prev.filter((item) => item.course._id !== courseId)
        );
        toast.success("Course removed from wishlist");
      } else {
        toast.error(data.error || "Failed to remove course");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove course from wishlist");
    } finally {
      setRemovingCourseId(null);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchWishlist();
    }
  }, [userData, fetchWishlist]);

  if (loading) {
    return (
      <div className="px-4 md:px-6 lg:px-8 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 p-4 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40">
      {/* Header Section */}
      <div className="w-full mb-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FiHeart className="w-8 h-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {wishlistCourses.length} Courses
            </div>
          </div>
          <p className="text-gray-600">
            {wishlistCourses.length > 0
              ? `${wishlistCourses.length} course${
                  wishlistCourses.length > 1 ? "s" : ""
                } saved for later`
              : "No courses in your wishlist yet"}
          </p>
        </div>
      </div>

      {/* Content */}
      {wishlistCourses.length === 0 ? (
        // Empty State
        <div className="w-full flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
              <FiHeart className="w-12 h-12 text-red-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start browsing courses and add them to your wishlist to keep track
              of courses you're interested in.
            </p>
            <Link
              to="/course-list"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      ) : (
        // Wishlist Table
        <div className="w-full flex-1">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-4">
              <h2 className="text-lg font-semibold">Saved Courses</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-200/60">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Course Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Instructor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {wishlistCourses.map((item) => {
                    const course = item.course;

                    // Safety check: skip if course is null or undefined
                    if (!course) {
                      console.warn(
                        "Course data is missing for wishlist item:",
                        item
                      );
                      return null;
                    }

                    return (
                      <tr
                        key={course._id}
                        className="hover:bg-red-50/30 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {/* Thumbnail */}
                            <div className="flex-shrink-0">
                              <img
                                src={
                                  course.courseThumbnail ||
                                  "/placeholder-course.jpg"
                                }
                                alt={course.courseTitle || "Course"}
                                className="h-full max-h-16 w-16 object-cover rounded"
                              />
                            </div>

                            {/* Text */}
                            <div className="flex flex-col justify-center">
                              <p className="text-sm font-semibold text-gray-800 max-w-xs truncate">
                                {course.courseTitle || "Untitled Course"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Added:{" "}
                                {new Date(item.addedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-800">
                              {course.educator?.username ||
                                "Unknown Instructor"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-semibold text-blue-600">
                              $
                              {course.courseOfferPrice ||
                                course.coursePrice ||
                                0}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/course/${course._id}`}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => removeFromWishlist(course._id)}
                              disabled={removingCourseId === course._id}
                              className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                              title="Remove from wishlist"
                            >
                              {removingCourseId === course._id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FiTrash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="text-center mt-8">
            <Link
              to="/course-list"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
