import React, { useState } from "react";
import { dummyStudentEnrolled } from "../../assets/assets";
import Loading from "../../components/student/Loading";

const StudentsEnrolled = () => {
  const [enrolledStudents, setEnrolledStudents] = useState(null);

  const fetchEnrolledStudents = async () => {
    // Simulate fetching data
    setEnrolledStudents(dummyStudentEnrolled);
  };

  // Fetch enrolled students when component mounts
  React.useEffect(() => {
    fetchEnrolledStudents();
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

  return enrolledStudents ? (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pt-0 p-4 pt-8 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40">
      {/* Header Section */}
      <div className="w-full mb-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800">
              Students Enrolled
            </h1>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {enrolledStudents.length} Students
            </div>
          </div>
          <p className="text-gray-600">
            Track and manage your enrolled students across all courses
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="w-full flex-1">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
            <h2 className="text-lg font-semibold">Enrollment Records</h2>
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
                    Enrollment Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {enrolledStudents.map((enrollment, index) => (
                  <tr
                    key={`${enrollment.student._id}-${enrollment.courseTitle}-${index}`}
                    className="hover:bg-blue-50/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={enrollment.student.imageUrl}
                          alt={enrollment.student.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {enrollment.student.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {enrollment.student._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {enrollment.courseTitle}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(enrollment.purchaseDate)}
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

          {/* Table Footer */}
          <div className="bg-gray-50/80 border-t border-gray-200/60 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {enrolledStudents.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {enrolledStudents.length}
                </span>{" "}
                enrollments
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
      <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {enrolledStudents.length}
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Enrollments</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {new Set(enrolledStudents.map((e) => e.student._id)).size}
          </div>
          <p className="text-gray-600 text-sm font-medium">Unique Students</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {new Set(enrolledStudents.map((e) => e.courseTitle)).size}
          </div>
          <p className="text-gray-600 text-sm font-medium">Active Courses</p>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default StudentsEnrolled;
