import React, { useState } from "react";
import { dummyCourses } from "../../assets/assets";
import Loading from "../../components/student/Loading";

const MyCourses = () => {
  const [myCourses, setMyCourses] = useState(null);

  const fetchMyCourses = async () => {
    // Simulate fetching data
    setMyCourses(dummyCourses);
  };

  // Fetch courses when component mounts
  React.useEffect(() => {
    fetchMyCourses();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to calculate earnings per course
  const calculateEarnings = (course) => {
    const studentsCount = course.enrolledStudents?.length || 0;
    const coursePrice = course.courseOfferPrice || course.coursePrice || 0;
    return (studentsCount * coursePrice).toFixed(2);
  };

  // Helper function to get status badge
  const getStatusBadge = (isPublished) => {
    return isPublished ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        Published
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
        Draft
      </span>
    );
  };

  return myCourses ? (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pt-0 p-4 pt-8 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40">
      {/* Header Section */}
      <div className="w-full mb-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {myCourses.length} Courses
            </div>
          </div>
          <p className="text-gray-600">
            Manage and track performance of your published courses
          </p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="w-full flex-1">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
            <h2 className="text-lg font-semibold">Course Management</h2>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200/60">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Course Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Earnings
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Students
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Published Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {myCourses.map((course, index) => (
                  <tr
                    key={course._id}
                    className="hover:bg-green-50/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            course.courseThumbnail ||
                            "https://via.placeholder.com/60x40/4F46E5/FFFFFF?text=Course"
                          }
                          alt={course.courseTitle}
                          className="w-12 h-8 rounded object-cover border border-gray-200"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 max-w-xs truncate">
                            {course.courseTitle}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {course._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-green-600">
                          ${calculateEarnings(course)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${course.courseOfferPrice || course.coursePrice} per
                          student
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-blue-600">
                          {course.enrolledStudents?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Enrolled</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <p>{formatDate(course.createdAt)}</p>
                        <p className="text-xs text-gray-500">
                          Updated: {formatDate(course.updatedAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(course.isPublished)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-gray-50/80 border-t border-gray-200/60 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {myCourses.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {myCourses.length}
                </span>{" "}
                courses
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs">
                  Last updated: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {myCourses.length}
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Courses</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            $
            {myCourses
              .reduce(
                (total, course) =>
                  total + parseFloat(calculateEarnings(course)),
                0
              )
              .toFixed(2)}
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {myCourses.reduce(
              (total, course) => total + (course.enrolledStudents?.length || 0),
              0
            )}
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Students</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            {myCourses.filter((course) => course.isPublished).length}
          </div>
          <p className="text-gray-600 text-sm font-medium">Published</p>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MyCourses;
