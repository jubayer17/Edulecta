import React, { useEffect, useState } from "react";
import { assets, dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/student/Loading";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    // Simulate fetching data
    const data = await new Promise((resolve) =>
      setTimeout(() => resolve("Dashboard Data"), 1000)
    );
    setDashboardData(dummyDashboardData);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return dashboardData ? (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pt-0 p-4 pt-8 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40">
      {/* Header Section */}
      <div className="w-full mb-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard Overview
            </h1>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Welcome Back!
            </div>
          </div>
          <p className="text-gray-600">
            Track your course performance and student engagement in one place
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <img
                src={assets.user_icon}
                alt="students icon"
                className="w-6 h-6"
              />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {dashboardData.enrolledStudentsData.length}
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Enrollments</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <img
                src={assets.my_course_icon}
                alt="courses icon"
                className="w-6 h-6"
              />
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {dashboardData.totalCourses}
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Courses</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <img
                src={assets.earning_icon}
                alt="earnings icon"
                className="w-6 h-6"
              />
            </div>
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            ${dashboardData.totalEarnings}
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
        </div>
      </div>

      {/* Enrolled Students Table */}
      <div className="w-full flex-1">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
            <h2 className="text-lg font-semibold">
              Recent Student Enrollments
            </h2>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200/60">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Course Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {dashboardData.enrolledStudentsData.map((item, index) => (
                  <tr
                    key={item.student._id + item.courseTitle + index}
                    className="hover:bg-purple-50/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.student.imageUrl}
                          alt={item.student.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {item.student.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {item.student._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {item.courseTitle}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {dashboardData.enrolledStudentsData.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                <img
                  src={assets.user_icon}
                  alt="No students"
                  className="w-8 h-8 opacity-50"
                />
              </div>
              <p className="text-gray-500 text-sm font-medium">
                No enrolled students yet
              </p>
              <p className="text-gray-400 text-xs">
                Students will appear here when they enroll in your courses
              </p>
            </div>
          )}

          {/* Table Footer */}
          <div className="bg-gray-50/80 border-t border-gray-200/60 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {dashboardData.enrolledStudentsData.length}
                </span>{" "}
                recent enrollments
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
    </div>
  ) : (
    <Loading />
  );
};

export default Dashboard;
