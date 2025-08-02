import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import YouTube from "react-youtube";
import Footer from "../../components/student/Footer";
import Rating from "../../components/student/Rating";

const Player = () => {
  const { courseId } = useParams();
  const {
    allCourses,
    enrolledCourses,
    calculateRating,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    formatLectureDuration,
  } = useContext(AppContext);

  const [courseData, setCourseData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [playerRef, setPlayerRef] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [expandedChapters, setExpandedChapters] = useState({
    0: true, // First chapter open by default
    1: true, // Second chapter open by default
  });

  useEffect(() => {
    console.log("URL param courseId:", courseId);
    console.log("allCourses:", allCourses);
    console.log("enrolledCourses:", enrolledCourses);

    if (courseId) {
      // Try to find the course in allCourses first, then in enrolledCourses
      let found = allCourses.find((c) => c._id === courseId);
      if (!found) {
        found = enrolledCourses.find((c) => c._id === courseId);
      }
      console.log("Found course:", found);
      setCourseData(found || null);
    }
  }, [courseId, allCourses, enrolledCourses]);
  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex],
    }));
  };

  // YouTube player options
  const videoPlayerOptions = {
    width: "100%",
    height: "100%",
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
    setTimeout(() => {
      event.target.playVideo();
    }, 500);
  };

  // Handle player state change
  const onPlayerStateChange = (event) => {
    // Optionally handle state changes
  };

  // Handle rating submission
  const handleRateSubmit = (ratingValue) => {
    setUserRating(ratingValue);
    // Here you would typically send the rating to your backend
    console.log("User rated the course:", ratingValue);
    // You can add an API call here to save the rating
  };

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">
            Loading course...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Course ID: {courseId || "No ID"}
          </p>
          <p className="text-sm text-gray-500">
            Available courses: {allCourses.length}
          </p>
          <p className="text-sm text-gray-500">
            Enrolled courses: {enrolledCourses.length}
          </p>
        </div>
      </div>
    );
  }

  const rating = calculateRating(courseData);
  const totalLectures = calculateNoOfLectures(courseData);
  const courseDuration = calculateCourseDuration(courseData);
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col-reverse p-4 sm:p-6 lg:p-10 lg:grid lg:grid-cols-2 gap-6 lg:gap-10 lg:px-36 lg:items-start">
          {/* left column - Course Structure */}
          <div className="pt-2 text-gray-800 flex flex-col">
            <h2 className="text-lg lg:text-xl font-semibold">
              Course Structure
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {totalLectures} lectures • {courseDuration}
            </p>
            <div className="pt-3 lg:pt-5 flex-1">
              {courseData.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="mb-3 lg:mb-4 border border-gray-200 rounded-lg lg:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div
                    className="flex items-center justify-between p-3 lg:p-5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 cursor-pointer transition-all duration-300 ease-in-out"
                    onClick={() => toggleChapter(index)}
                  >
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="p-1 lg:p-1.5 rounded-full bg-white shadow-sm transition-transform duration-300 hover:scale-110">
                        <img
                          src={assets.down_arrow_icon}
                          alt="arrow icon"
                          className={`w-3 h-3 lg:w-4 lg:h-4 transition-all duration-500 ease-in-out ${
                            expandedChapters[index]
                              ? "rotate-180 text-blue-600"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <p className="font-semibold text-gray-800 text-sm lg:text-base transition-colors duration-300 hover:text-blue-600">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full font-medium border border-blue-200">
                        {chapter.chapterContent.length} lectures
                      </span>
                      <span className="hidden sm:inline text-xs text-gray-600 bg-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-full border border-gray-200 font-medium">
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
                          className="group flex items-center justify-between px-3 lg:px-6 py-3 lg:py-4 hover:bg-gradient-to-r hover:from-blue-50 cursor-pointer hover:to-indigo-50 border-b border-gray-100 last:border-b-0 transition-all duration-300 ease-in-out transform hover:translate-x-1"
                        >
                          <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                            <div className="p-1.5 lg:p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                              <img
                                src={assets.play_icon}
                                alt="play icon"
                                className="w-3 h-3 lg:w-3.5 lg:h-3.5"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-300 truncate">
                                {lecture.lectureTitle}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-500 transition-colors duration-300">
                                Lesson {lectureIndex + 1}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                            <span
                              onClick={() => {
                                // Set player data to play the selected lecture
                                setPlayerData({
                                  videoId: lecture.lectureUrl.split("/").pop(),
                                  chapterTitle: chapter.chapterTitle,
                                  lectureTitle: lecture.lectureTitle,
                                  chapterNumber: chapter.chapterOrder,
                                  lectureNumber: lecture.lectureOrder,
                                });
                              }}
                              className="text-xs text-blue-700 bg-blue-100 px-2 lg:px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors duration-200 border border-blue-200 font-medium"
                            >
                              Play
                            </span>
                            <div className="hidden sm:block text-xs font-semibold text-blue-700 bg-blue-50 px-2 lg:px-3 py-1 lg:py-2 rounded-full border border-blue-200 group-hover:bg-blue-100 group-hover:scale-105 transition-all duration-300">
                              {formatLectureDuration(lecture.lectureDuration)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Course Rating Section */}
            <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg lg:rounded-xl border border-blue-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-1">
                    Rate This Course
                  </h3>
                  <p className="text-sm text-gray-600">
                    Share your experience with other students
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Rating
                    initialRating={userRating}
                    onRate={handleRateSubmit}
                    size="lg"
                  />
                  {userRating > 0 && (
                    <span className="text-sm text-green-600 font-medium">
                      Thank you for rating!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* right column - Video Player */}
          <div className="lg:mt-10 flex flex-col">
            {/* Course Info Header */}
            <div className="mb-4 p-4 lg:p-6 bg-white rounded-lg lg:rounded-xl border border-gray-200 shadow-sm">
              <h1 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">
                {courseData.courseTitle}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Rating initialRating={rating} readOnly={true} size="sm" />
                  <span className="font-medium">({rating.toFixed(1)})</span>
                </div>
                <span className="hidden sm:inline text-gray-400">•</span>
                <span>{totalLectures} lectures</span>
                <span className="hidden sm:inline text-gray-400">•</span>
                <span>{courseDuration}</span>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {playerData ? (
                <div className="space-y-3 lg:space-y-0">
                  {console.log("Player Data:", playerData)}
                  <YouTube
                    videoId={playerData.videoId}
                    opts={videoPlayerOptions}
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                    iframeClassName="w-full aspect-video rounded-lg lg:rounded-xl"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 p-3 lg:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold flex-shrink-0">
                        {playerData.chapterNumber}.{playerData.lectureNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm lg:text-base truncate">
                          {playerData.lectureTitle}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 truncate">
                          {playerData.chapterTitle}
                        </p>
                      </div>
                    </div>
                    <button
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm lg:text-base flex-shrink-0"
                      onClick={() => setPlayerData(null)}
                    >
                      Mark as Completed
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[250px] sm:h-[315px] flex items-center justify-center bg-gray-50 rounded-lg lg:rounded-xl">
                  <img
                    src={courseData.courseThumbnail}
                    alt="course thumbnail"
                    className="max-w-full max-h-full object-contain rounded-lg lg:rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Player;
