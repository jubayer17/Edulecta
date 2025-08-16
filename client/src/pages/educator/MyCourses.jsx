import React, { useContext, useEffect, useState } from "react";
import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";

const MyCourses = () => {
  const { educatorDashboard, isEducator, syncEducatorDashboard } =
    useContext(AppContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!isEducator) return;
      setLoading(true);
      await syncEducatorDashboard();
      setLoading(false);
    };
    fetchDashboard();
  }, [isEducator]);

  if (loading) return <Loading />;

  const {
    totalCourses = 0,
    totalEnrollments = 0,
    totalEarnings = 0,
    publishedCourses = [],
  } = educatorDashboard || {};

  return (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pt-0 p-4 pt-8 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40">
      {/* Header Section */}
      <div className="w-full mb-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {totalCourses} Courses
            </div>
          </div>
          <p className="text-gray-600">
            Manage and track performance of your published courses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {totalCourses}
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Courses</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ${totalEarnings.toFixed(2)}
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {totalEnrollments}
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Students</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            {publishedCourses.filter((c) => c.isPublished).length}
          </div>
          <p className="text-gray-600 text-sm font-medium">Published</p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="w-full flex-1 mt-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
            <h2 className="text-lg font-semibold">Course Management</h2>
          </div>

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
                {publishedCourses.map((course) => (
                  <tr
                    key={course.courseId}
                    className="hover:bg-green-50/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-full max-h-16 w-16 object-cover rounded"
                          />
                        </div>

                        {/* Text */}
                        <div className="flex flex-col justify-center">
                          <p className="text-sm font-semibold text-gray-800 max-w-xs truncate">
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {course.courseId.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-green-600">
                          ${course.totalEarnings.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${course.price} per student
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-blue-600">
                          {course.totalEnrollments}
                        </p>
                        <p className="text-xs text-gray-500">Enrolled</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <p>{new Date(course.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">
                          Updated:{" "}
                          {new Date(course.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          course.isPublished
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
