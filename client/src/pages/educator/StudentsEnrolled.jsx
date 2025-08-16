import React, { useState, useEffect, useContext } from "react";
import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";

const StudentsEnrolled = () => {
  const { enrolledStudentInfo, user } = useContext(AppContext);
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  // Map backend data to include a `student` object for UI consistency
  useEffect(() => {
    if (!enrolledStudentInfo || enrolledStudentInfo.length === 0) return;

    const mappedData = enrolledStudentInfo.map((enrollment) => ({
      ...enrollment,
      student: {
        name: enrollment.studentName || "Unknown Student", // fallback if name missing
        _id: enrollment.studentId,
        image: enrollment.studentImage,
      },
    }));

    setEnrolledStudents(mappedData);
  }, [enrolledStudentInfo]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) return <Loading />;
  console.log("or mayrebap", enrolledStudents);

  return (
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
            <h2 className="text-lg font-semibold">Enrollment Records</h2>
          </div>
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
                    key={`${enrollment.student._id}-${enrollment.courseId}-${index}`}
                    className="hover:bg-blue-50/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={enrollment.student.image}
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
        </div>
      </div>
    </div>
  );
};

export default StudentsEnrolled;
