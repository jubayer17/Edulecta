import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import Footer from "../../components/student/Footer";

const MyEnrollments = () => {
  const {
    navigate,
    fullEnrolledCourses, // <-- use fullEnrolledCourses here
    calculateCourseDuration,
    calculateRating,
  } = useContext(AppContext);

  // Function to calculate total lectures in a course
  const getTotalLectures = (course) => {
    if (!course.courseContent || !Array.isArray(course.courseContent)) return 0;

    return course.courseContent.reduce((total, chapter) => {
      if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
        return total + chapter.chapterContent.length;
      }
      return total;
    }, 0);
  };

  // Function to get completed lectures (for demo purposes, using simulated progress)
  const getCompletedLectures = (course) => {
    const totalLectures = getTotalLectures(course);
    if (totalLectures === 0) return 0;

    // For demo purposes, simulate different completion levels based on course ID
    const courseIndex = course._id ? parseInt(course._id.slice(-1)) || 0 : 0;
    const progressLevels = [4, 2, 4, 3, 4, 1, 4, 3]; // Completed lectures per course
    const completedLectures =
      progressLevels[courseIndex % progressLevels.length] || 0;

    // Ensure completed doesn't exceed total
    return Math.min(completedLectures, totalLectures);
  };

  // Function to calculate completion percentage based on lectures
  const getCompletionPercentage = (course) => {
    const totalLectures = getTotalLectures(course);
    const completedLectures = getCompletedLectures(course);

    if (totalLectures === 0) return 0;
    return Math.round((completedLectures / totalLectures) * 100);
  };

  // Function to get status based on completion
  const getCourseStatus = (completionPercentage) => {
    if (completionPercentage === 100)
      return { text: "Completed", color: "bg-green-100 text-green-700" };
    if (completionPercentage > 0)
      return { text: "In Progress", color: "bg-yellow-100 text-yellow-700" };
    return { text: "Not Started", color: "bg-gray-100 text-gray-700" };
  };

  return (
    <>
      {console.log("Rendering MyEnrollments page...")}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 md:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-16">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              My Enrollments
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track your learning progress and manage your enrolled courses
            </p>
          </div>

          {/* Mobile Card View (visible on small screens) */}
          <div className="block md:hidden space-y-3 sm:space-y-4">
            {fullEnrolledCourses && fullEnrolledCourses.length > 0 ? (
              fullEnrolledCourses.map((course) => {
                const totalLectures = getTotalLectures(course);
                const completedLectures = getCompletedLectures(course);
                const completionPercentage = getCompletionPercentage(course);
                const courseStatus = getCourseStatus(completionPercentage);

                return (
                  <div
                    key={course._id}
                    className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-3 sm:p-4"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate mb-1">
                          {course.courseTitle}
                        </h3>

                        {/* Progress Bar */}
                        <div className="mt-2 mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">
                              Progress
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              {completedLectures}/{totalLectures} lectures
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                completionPercentage === 100
                                  ? "bg-green-600"
                                  : "bg-blue-600"
                              }`}
                              style={{ width: `${completionPercentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {calculateCourseDuration(course)}
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              {completionPercentage}%
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs mb-3">
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`${courseStatus.color} px-2 py-0.5 rounded-full text-xs font-medium`}
                          >
                            {courseStatus.text}
                          </span>
                        </div>

                        <button
                          onClick={() => navigate(`/player/${course._id}`)}
                          className={`w-full font-medium py-2 px-4 rounded-lg text-xs sm:text-sm transition-all duration-300 ${
                            completionPercentage === 100
                              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          }`}
                        >
                          {completionPercentage === 100
                            ? "View Certificate"
                            : "Continue Learning"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty state for mobile */
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No enrollments yet
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Start your learning journey by enrolling in courses that
                      interest you.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/course-list")}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform active:scale-95 text-sm"
                  >
                    Browse Courses
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Table View (hidden on small screens) */}
          <div className="hidden md:block bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Course Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Duration
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Completed
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fullEnrolledCourses && fullEnrolledCourses.length > 0 ? (
                    fullEnrolledCourses.map((course) => {
                      const totalLectures = getTotalLectures(course);
                      const completedLectures = getCompletedLectures(course);
                      const completionPercentage =
                        getCompletionPercentage(course);
                      const courseStatus =
                        getCourseStatus(completionPercentage);

                      return (
                        <tr
                          key={course._id}
                          className="hover:bg-blue-50/50 transition-colors duration-200"
                        >
                          <td className="pl-2 lg:pl-4 pr-1 lg:pr-3 py-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={course.courseThumbnail}
                                alt={course.courseTitle}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {course.courseTitle}
                                </p>
                                {/* Progress Bar under title */}
                                <div className="mt-1">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-48 bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                          completionPercentage === 100
                                            ? "bg-green-600"
                                            : "bg-blue-600"
                                        }`}
                                        style={{
                                          width: `${completionPercentage}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">
                                      {completionPercentage}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 text-center">
                            {calculateCourseDuration(course)}
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-gray-900">
                                {completedLectures}/{totalLectures}
                              </div>
                              <div className="text-xs text-gray-500">
                                lectures completed
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <span
                                className={`${courseStatus.color} px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap`}
                              >
                                {courseStatus.text}
                              </span>
                              <button
                                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
                                  completionPercentage === 100
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                                onClick={() =>
                                  navigate(
                                    completionPercentage === 100
                                      ? `/certificate/${course._id}`
                                      : `/player/${course._id}`
                                  )
                                }
                              >
                                {completionPercentage === 100
                                  ? "Certificate"
                                  : "Continue"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    /* Empty state for desktop */
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 lg:px-6 py-8 lg:py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-12 lg:w-16 h-12 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-6 lg:w-8 h-6 lg:h-8 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                              ></path>
                            </svg>
                          </div>
                          <div className="text-center">
                            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                              No enrollments yet
                            </h3>
                            <p className="text-gray-500 text-sm lg:text-base max-w-md">
                              Start your learning journey by enrolling in
                              courses that interest you.
                            </p>
                          </div>
                          <button
                            onClick={() => navigate("/course-list")}
                            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-sm lg:text-base"
                          >
                            Browse Courses
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Footer with proper spacing */}
      <div className="mt-8 md:mt-12">
        <Footer />
      </div>
    </>
  );
};

export default MyEnrollments;
