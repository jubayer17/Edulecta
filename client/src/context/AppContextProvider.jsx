/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import { AppContext } from "./AppContext";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContextProvider = ({ children }) => {
  const [users, setUsers] = useState(null);
  const [theme, setTheme] = useState("light");
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  const calculateRating = useCallback((course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) {
      return 0;
    }
    let totalRating = 0;
    course.courseRatings.forEach((value) => {
      totalRating += value.rating;
    });
    return Math.round((totalRating / course.courseRatings.length) * 2) / 2;
  }, []);

  // function to calculate course chapter time

  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => {
      time += lecture.lectureDuration;
    });
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  //function to calculate course duration
  const calculateCourseDuration = (course) => {
    let totalTime = 0;
    course.courseContent.forEach((chapter) => {
      totalTime += chapter.chapterContent.reduce(
        (sum, lecture) => sum + lecture.lectureDuration,
        0
      );
    });
    return humanizeDuration(totalTime * 60 * 1000, { units: ["h", "m"] });
  };

  //function to calculate no of lectures in a course
  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      totalLectures += chapter.chapterContent.length;
    });
    return totalLectures;
  };

  // Format individual lecture duration in hours, minutes, seconds
  const formatLectureDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  //fetch user enrolled courses
  const fetchUserEnrolledCourses = async (userId = null) => {
    try {
      // Use provided userId or current user's id, or default test user ID
      const targetUserId =
        userId || (users && users.id) || "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V";

      // Filter courses where the user is enrolled
      const userEnrolledCourses = dummyCourses.filter(
        (course) =>
          course.enrolledStudents &&
          course.enrolledStudents.includes(targetUserId)
      );

      setEnrolledCourses(userEnrolledCourses);
      return userEnrolledCourses;
    } catch (error) {
      console.error("Error fetching user enrolled courses:", error);
      setEnrolledCourses([]);
      return [];
    }
  };

  useEffect(() => {
    fetchAllCourses();
    // Fetch enrolled courses when component mounts
    fetchUserEnrolledCourses();
  }, [users]); // Re-fetch when user changes

  // If you want to log user data for debugging
  const consoleLogUser = async () => {
    console.log(await getToken());
  };

  useEffect(() => {
    // If user is authenticated, set user data
    if (user) {
      consoleLogUser();
    }
  }, [user]);

  const value = {
    users,
    setUsers,
    theme,
    setTheme,
    currency,
    allCourses,
    enrolledCourses,
    navigate,
    calculateRating,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    formatLectureDuration,
    fetchUserEnrolledCourses,
    isEducator,
    setIsEducator,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
