import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import YouTube from "react-youtube";
import axios from "axios";
import { toast } from "react-toastify";

const CourseDetails = () => {
  const { id } = useParams();
  const {
    allCourses,
    calculateRating,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    formatLectureDuration,
    backendUrl,
    userData,
    getToken,
  } = useContext(AppContext);
  const [courseData, setCourseData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [isPendingPurchase, setIsPendingPurchase] = useState(false);
  const [playerRef, setPlayerRef] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({
    0: true, // First chapter open by default
    1: true, // Second chapter open by default
  });
  console.log(userData);
  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex],
    }));
  };

  // YouTube player options
  const videoPlayerOptions = {
    height: "208", // matches md:h-52 (208px)
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      start: 0,
    },
  };

  // Handle when YouTube player is ready
  const onPlayerReady = (event) => {
    setPlayerRef(event.target);
    // Auto-play the video when player is ready
    setTimeout(() => {
      event.target.playVideo();
    }, 500);
  };

  // Handle player state change
  const onPlayerStateChange = (event) => {
    // Optionally handle state changes
  };

  // const fetchCourseData = async () => {
  //   try {
  //     const { data } = await axios.get(backendUrl + "/api/course/" + id);
  //     if (data.success) {
  //       setCourseData(data);
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     console.error(error.message);
  //   }
  // };

  // function to handle the when enroll course is pressed
  const enrollCourse = async () => {
    try {
      if (!userData) {
        toast.warn("Please login to enroll in the course");
        return;
      }

      if (isAlreadyEnrolled) {
        toast.warn("You are already enrolled in this course");
        return;
      }

      const token = await getToken();

      console.log("Sending purchase request for course:", courseData._id);

      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { courseId: courseData._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success && data.sessionUrl) {
        toast.info("Redirecting to payment...");
        window.location.href = data.sessionUrl;
      } else {
        toast.error(data.error || "Failed to start enrollment process");
      }
    } catch (error) {
      const errorData = error.response?.data;
      console.error("Error details:", errorData || error.message);

      if (
        errorData?.error ===
        "You already have a pending purchase for this course."
      ) {
        setIsPendingPurchase(true);
        toast.warn(
          "You have a pending purchase for this course. Would you like to continue with your payment?",
          {
            autoClose: 10000, // Keep the message visible longer
            onClick: () => (window.location.href = "/my-enrollments"), // Redirect to enrollments page when clicked
          }
        );
      } else {
        const errorMessage =
          errorData?.error ||
          error.message ||
          "Something went wrong. Please try again.";
        toast.error(errorMessage);
      }
    }
  };

  useEffect(() => {
    const found = allCourses.find((c) => c._id === id);
    setCourseData(found || null);
  }, [allCourses, id]);

  useEffect(() => {
    if (userData && courseData) {
      const isEnrolled = userData.enrolledCourses.includes(courseData._id);
      setIsAlreadyEnrolled(isEnrolled);
    }
  }, [userData, courseData]);

  if (!courseData) return <Loading />;

  // console.log("Course Data:", courseData);
  console.log("Course Data from details:", courseData);

  // Use the helper functions from context
  const rating = calculateRating(courseData);
  const totalLectures = calculateNoOfLectures(courseData);
  const courseDuration = calculateCourseDuration(courseData);

  return (
    <>
      <div className="flex md:flex-row flex-col gap-8 relative items-start justify-between md:px-16 lg:px-24 xl:px-32 px-6 md:pt-32 pt-24 text-left bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Left column */}
        <div className="flex-1 max-w-5xl z-10 text-gray-500 order-2 md:order-1">
          {/* Course Category Badge */}
          <div className="mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
              {courseData.courseCategory || "Programming"}
            </span>
          </div>

          {/* Course Title */}
          <h2 className="text-course-details-heading text-gray-800 font-bold leading-tight mb-4">
            {courseData.courseTitle}
          </h2>

          {/* Course Subtitle/Description */}
          <p
            className="text-md  md:text-md text-gray-700 font-medium mb-6 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription.slice(0, 250),
            }}
          />

          {/* Course Stats Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-6 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">{rating}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Rating
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">
                  {courseData.enrolledStudents &&
                    courseData.enrolledStudents.length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Students
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">
                  {totalLectures}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Lectures
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">
                  {courseDuration}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Duration
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Rating & Reviews */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-500">
                  {rating}
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => {
                    const filled = rating >= i + 1;
                    const half = rating >= i + 0.5;
                    return (
                      <img
                        key={i}
                        src={
                          filled
                            ? assets.star
                            : half
                            ? assets.star
                            : assets.star_blank
                        }
                        alt="star"
                        className="w-5 h-5"
                      />
                    );
                  })}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">
                  {courseData.courseRatings.length}{" "}
                  {courseData.courseRatings.length === 1 ? "review" : "reviews"}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {courseData.enrolledStudents &&
                    courseData.enrolledStudents.length}{" "}
                  {courseData.enrolledStudents &&
                  courseData.enrolledStudents.length === 0
                    ? "student"
                    : "students"}
                </span>
              </div>
            </div>
          </div>

          {/* Instructor Information */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                JA
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Instructor</p>
                <p className="text-lg font-semibold text-gray-800">
                  {courseData.educator.username}
                </p>
                <p className="text-sm text-gray-600">
                  Senior Full Stack Developer
                </p>
              </div>
            </div>
          </div>

          {/* Course Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              What you'll learn
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">
                  Master the fundamentals and advanced concepts
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">
                  Build real-world projects from scratch
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">
                  Industry best practices and coding standards
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">
                  Lifetime access and certificate of completion
                </span>
              </div>
            </div>
          </div>

          {/* Course Requirements */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Requirements
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <span className="text-sm text-gray-700">
                  Basic computer literacy and internet access
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <span className="text-sm text-gray-700">
                  No prior programming experience required
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <span className="text-sm text-gray-700">
                  Willingness to learn and practice regularly
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-gray-800">
            <h2 className="text-lg font-semibold">Course Structure</h2>
            <p className="text-sm text-gray-600 mb-4">
              {totalLectures} lectures • {courseDuration}
            </p>
            <div className="pt-5">
              {courseData.courseContent &&
                courseData.courseContent.map((chapter, index) => (
                  <div
                    key={index}
                    className="mb-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 cursor-pointer transition-all duration-300 ease-in-out"
                      onClick={() => toggleChapter(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-full bg-white shadow-sm transition-transform duration-300 hover:scale-110">
                          <img
                            src={assets.down_arrow_icon}
                            alt="arrow icon"
                            className={`w-4 h-4 transition-all duration-500 ease-in-out ${
                              expandedChapters[index]
                                ? "rotate-180 text-blue-600"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <p className="font-semibold text-gray-800 text-base transition-colors duration-300 hover:text-blue-600">
                          {chapter.chapterTitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-200">
                          {chapter.chapterContent.length} lectures
                        </span>
                        <span className="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 font-medium">
                          {calculateChapterTime(chapter)}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-700 ease-in-out ${
                        expandedChapters[index]
                          ? "max-h-[2000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
                        {chapter.chapterContent.map((lecture, lectureIndex) => (
                          <div
                            key={lectureIndex}
                            className="group flex items-center justify-between px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 cursor-pointer hover:to-indigo-50 border-b border-gray-100 last:border-b-0 transition-all duration-300 ease-in-out transform hover:translate-x-1"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                                <img
                                  src={assets.play_icon}
                                  alt="play icon"
                                  className="w-3.5 h-3.5"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                                  {lecture.lectureTitle}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-500 transition-colors duration-300">
                                  Lesson {lectureIndex + 1}
                                </p>
                              </div>
                              {lecture.isPreviewFree && (
                                <span
                                  onClick={() => {
                                    // First scroll to top
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });

                                    // Then set player data after a brief delay
                                    setTimeout(() => {
                                      setPlayerData({
                                        videoId: lecture.lectureUrl
                                          .split("/")
                                          .pop(),
                                      });
                                    }, 300);
                                  }}
                                  className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full cursor-pointer hover:bg-green-200 transition-colors duration-200 border border-green-200 font-medium"
                                >
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-full border border-blue-200 group-hover:bg-blue-100 group-hover:scale-105 transition-all duration-300">
                              {formatLectureDuration(lecture.lectureDuration)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Course Description Section */}
          <div className="pt-8 text-gray-800 py-8">
            <h2 className="text-lg font-semibold">Course Description</h2>
            <div className="pt-5">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200">
                <div
                  className="rich-text prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: courseData.courseDescription,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Course Enrollment Card */}
        <div className="w-full md:w-[380px] lg:w-[400px] z-10 md:flex-shrink-0 order-1 md:order-2">
          <div className="md:sticky md:top-8 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden transition-all duration-300 hover:shadow-3xl mb-8 md:mb-0">
            {/* Course Thumbnail with Play Button Overlay */}
            <div className="relative group overflow-hidden cursor-pointer">
              {playerData ? (
                <div className="relative">
                  <YouTube
                    key={playerData.videoId} // Force re-render for new videos
                    videoId={playerData.videoId}
                    opts={videoPlayerOptions}
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                  />
                  {/* Close button to return to thumbnail */}
                  <button
                    onClick={() => {
                      setPlayerData(null);
                      setPlayerRef(null);
                    }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-200 z-10"
                  >
                    <img
                      src={assets.cross_icon}
                      alt="close"
                      className="w-3 h-3"
                    />
                  </button>
                </div>
              ) : (
                <>
                  <img
                    src={courseData.courseThumbnail}
                    alt={courseData.courseTitle}
                    className="w-full h-48 md:h-52 object-cover transition-all duration-500 group-hover:scale-110 filter brightness-100 group-hover:brightness-110 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-all duration-300"></div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-2xl hover:shadow-white/20">
                      <img
                        src={assets.play_icon}
                        alt="play"
                        className="w-8 h-8 ml-1"
                      />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20">
                    Preview
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                    HD Quality
                  </div>
                </>
              )}
            </div>

            {/* Card Content */}
            <div className="p-5 md:p-7 space-y-4 md:space-y-6">
              {/* Price Section - Left Aligned */}
              <div className="text-left">
                <div className="flex items-baseline gap-2 md:gap-3 mb-3">
                  <span className="text-xl md:text-2xl font-bold text-green-600">
                    ${courseData.courseOfferPrice}
                  </span>
                  <span className="text-base md:text-lg text-gray-400 line-through font-medium">
                    ${courseData.coursePrice}
                  </span>
                  <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md animate-pulse">
                    SAVE $
                    {(
                      courseData.coursePrice - courseData.courseOfferPrice
                    ).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="text-xs md:text-sm font-bold text-green-600 bg-green-50 px-2 md:px-3 py-1 rounded-full inline-block border border-green-200">
                    {Math.round(
                      ((courseData.coursePrice - courseData.courseOfferPrice) /
                        courseData.coursePrice) *
                        100
                    )}
                    % OFF
                  </div>
                  <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full font-medium border border-orange-200">
                    🔥 Hot Deal
                  </div>
                </div>
                <div className="text-xs text-gray-500 italic">
                  💰 You save $
                  {(
                    courseData.coursePrice - courseData.courseOfferPrice
                  ).toFixed(2)}{" "}
                  on this course
                </div>
              </div>

              {/* Time Limited Offer */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    className="w-4 h-4"
                    src={assets.time_left_clock_icon}
                    alt="time left clock icon"
                  />
                  <p className="text-red-600 font-semibold text-sm">
                    5 days left at this price!
                  </p>
                </div>
                <div className="text-xs text-red-500">
                  Limited time offer - Don't miss out!
                </div>
              </div>

              {/* Course Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold text-gray-800">
                    {courseDuration}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lectures:</span>
                  <span className="font-semibold text-gray-800">
                    {totalLectures}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Students:</span>
                  <span className="font-semibold text-gray-800">
                    {courseData.enrolledStudents &&
                      courseData.enrolledStudents.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-semibold text-gray-800">
                    {courseData.courseLevel || "All Levels"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-800">
                      {rating}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <img
                          key={i}
                          src={
                            rating >= i + 1 ? assets.star : assets.star_blank
                          }
                          alt="star"
                          className="w-3 h-3"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={enrollCourse}
                  disabled={isAlreadyEnrolled}
                  className={`cursor-pointer w-full bg-gradient-to-r from-blue-600 to-indigo-600 
    hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 md:py-4 px-6 
    rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
    active:scale-95 text-sm md:text-base
    ${
      isAlreadyEnrolled || isPendingPurchase
        ? "opacity-60 cursor-not-allowed hover:scale-100 hover:shadow-none"
        : ""
    }`}
                >
                  {isAlreadyEnrolled
                    ? "Already Enrolled"
                    : isPendingPurchase
                    ? "Pending Purchase"
                    : "Enroll Now"}
                </button>

                <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:space-y-3 md:gap-0">
                  <button className="cursor-pointer w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl transition-all duration-300 hover:shadow-lg text-sm md:text-base">
                    Add to Wishlist
                  </button>
                  <button className="cursor-pointer w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl transition-all duration-300 text-sm md:text-base">
                    Share Course
                  </button>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  This course includes:
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{courseDuration} on-demand video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Access on mobile and TV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>

              {/* Money Back Guarantee */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <img
                    src={assets.blue_tick_icon}
                    alt="guarantee"
                    className="w-4 h-4"
                  />
                  <span className="font-semibold">
                    30-day money-back guarantee
                  </span>
                </div>
                <div className="text-xs">Full refund within 30 days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CourseDetails;
