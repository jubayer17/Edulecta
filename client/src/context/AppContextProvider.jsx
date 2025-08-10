/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback, useMemo } from "react";
import { AppContext } from "./AppContext";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContextProvider = ({ children }) => {
  const [users, setUsers] = useState(null); // Backend user profile
  const [theme, setTheme] = useState("light");
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]); // likely course IDs or partial
  const [userData, setUserData] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/all`);
      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(data.message || "Failed to fetch courses");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch courses");
    }
  };

  // Fetch enrolled courses - expects token and user to be ready
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("User not authenticated");
        return [];
      }

      const { data } = await axios.get(
        `${backendUrl}/api/user/enrolled-courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setEnrolledCourses(data.enrolledCourses || []);
        toast.success("Enrolled courses fetched successfully");
        return data.enrolledCourses || [];
      } else {
        toast.error("Failed to fetch enrolled courses");
        setEnrolledCourses([]);
        return [];
      }
    } catch (error) {
      toast.error(error.message || "Error fetching enrolled courses");
      setEnrolledCourses([]);
      return [];
    }
  };

  //fetch user data and set enrolled courses only once here
  const fetchUserData = async () => {
    if (user?.publicMetadata?.role === "educator") {
      setIsEducator(true);
    }

    try {
      const token = await getToken();
      console.log("Token:", token);
      if (!token) {
        toast.error("User not authenticated");
        return;
      }

      const { data } = await axios.get(backendUrl + "/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setUsers(data.user);
        setUserData(data.user);
        // Set enrolledCourses once here
        setEnrolledCourses(data.user.enrolledCourses || []);
      } else {
        toast.error(data.message || "Failed to fetch user data");
        setEnrolledCourses([]); // clear on failure
      }
    } catch (error) {
      toast.error(error.message || "Error fetching user data");
      setEnrolledCourses([]); // clear on error
    }
  };

  // Memoize full enrolled courses with complete course info from allCourses
  const fullEnrolledCourses = useMemo(() => {
    if (
      !enrolledCourses ||
      enrolledCourses.length === 0 ||
      !allCourses ||
      allCourses.length === 0
    )
      return [];

    const enrolledCourseIds = enrolledCourses.map((c) =>
      typeof c === "string" ? c : c._id
    );

    return allCourses.filter((course) =>
      enrolledCourseIds.includes(course._id)
    );
  }, [enrolledCourses, allCourses]);

  const calculateRating = useCallback((course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) return 0;
    let totalRating = 0;
    course.courseRatings.forEach((value) => {
      totalRating += value.rating;
    });
    return Math.round((totalRating / course.courseRatings.length) * 2) / 2;
  }, []);

  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.forEach((lecture) => {
      time += lecture.lectureDuration;
    });
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    if (!course || !Array.isArray(course.courseContent)) return "0h 0m";

    let totalMinutes = 0;

    course.courseContent.forEach((chapter) => {
      if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
        chapter.chapterContent.forEach((lecture) => {
          if (lecture.lectureDuration) {
            totalMinutes += lecture.lectureDuration;
          }
        });
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    if (course.courseContent && Array.isArray(course.courseContent)) {
      course.courseContent.forEach((chapter) => {
        if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
          totalLectures += chapter.chapterContent.length;
        }
      });
    }
    return totalLectures;
  };
  console.log("User Data:", userData);
  const formatLectureDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Run when Clerk auth user changes
  useEffect(() => {
    if (user) {
      fetchUserData(); // fetch backend user profile + enrolled courses once
      fetchAllCourses();
    } else {
      // Clear state on logout
      setEnrolledCourses([]);
      setUsers(null);
      setUserData(null);
      setIsEducator(false);
    }
  }, [user]);

  const value = {
    fullEnrolledCourses,
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
    isEducator,
    setIsEducator,
    userData,
    setUserData,
    backendUrl,
    getToken,
    fetchAllCourses,
    fetchUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
