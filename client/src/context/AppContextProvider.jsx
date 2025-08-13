/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback, useMemo } from "react";
import { AppContext } from "./AppContext";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContextProvider = ({ children }) => {
  const [users, setUsers] = useState(null);
  const [theme, setTheme] = useState("light");
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [educatorDashboard, setEducatorDashboard] = useState({
    totalEarnings: 0,
    enrolledStudents: 0,
    numberOfCourses: 0,
  });

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "https://server-phi-rust.vercel.app";
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  // Fetch all courses
  const fetchAllCourses = async () => {
    try {
      setAllCourses([]);
      const { data } = await axios.get(`${backendUrl}/api/course/all`);
      if (data.success && Array.isArray(data.courses)) {
        setAllCourses(data.courses);
      } else {
        toast.error(data.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error.message || "Failed to fetch courses");
    }
  };

  // Fetch enrolled courses
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      if (!token) return [];

      const { data } = await axios.get(
        `${backendUrl}/api/user/enrolled-courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setEnrolledCourses(data.enrolledCourses || []);
        return data.enrolledCourses || [];
      } else {
        setEnrolledCourses([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      setEnrolledCourses([]);
      return [];
    }
  };

  // Fetch user profile
  const fetchUserData = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUsers(data.user);
        setUserData(data.user);
        setEnrolledCourses(data.user.enrolledCourses || []);
        if (user?.publicMetadata?.role === "educator") setIsEducator(true);
      } else {
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setEnrolledCourses([]);
    }
  };

  // Memoized full enrolled courses
  const fullEnrolledCourses = useMemo(() => {
    if (!enrolledCourses?.length || !allCourses?.length) return [];
    const enrolledIds = enrolledCourses.map((c) =>
      typeof c === "string" ? c : c._id
    );
    return allCourses.filter((course) => enrolledIds.includes(course._id));
  }, [enrolledCourses, allCourses]);

  // Educator dashboard calculation & sync function
  const syncEducatorDashboard = async () => {
    const token = await getToken();
    console.log("✅ Token retrieved:", token);
    if (!isEducator) return;

    // calculate totals from allCourses
    const educatorCourses = allCourses.filter(
      (c) => c.educator === userData?._id
    );

    const totalCourses = educatorCourses.length;
    const totalEnrollments = educatorCourses.reduce(
      (acc, course) => acc + (course.enrolledStudents?.length || 0),
      0
    );
    const totalEarnings = educatorCourses.reduce(
      (acc, course) =>
        acc +
        (course.coursePrice || 0) * (course.enrolledStudents?.length || 0),
      0
    );

    const updateData = { totalCourses, totalEnrollments, totalEarnings };

    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.put(
        `${backendUrl}/api/educator/update-dashboard`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setEducatorDashboard(updateData);
        toast.success("Educator dashboard synced successfully!");
      } else {
        toast.error(data.message || "Failed to sync dashboard");
      }
    } catch (error) {
      console.error("Error syncing dashboard:", error);
      toast.error(error.response?.data?.message || "Dashboard sync failed");
    }
  };

  // Utility functions
  const calculateRating = useCallback((course) => {
    if (!course.courseRatings?.length) return 0;
    const total = course.courseRatings.reduce(
      (acc, val) => acc + val.rating,
      0
    );
    return Math.round((total / course.courseRatings.length) * 2) / 2;
  }, []);

  const calculateCourseDuration = (course) => {
    let totalMinutes = 0;
    course.courseContent?.forEach((chapter) =>
      chapter.chapterContent?.forEach((lecture) => {
        totalMinutes += lecture.lectureDuration || 0;
      })
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Initialize
  useEffect(() => {
    if (!user) return;
    const init = async () => {
      await fetchUserData();
      await fetchAllCourses();
      if (user?.publicMetadata?.role === "educator")
        await syncEducatorDashboard();
    };
    init();
  }, [user]);

  const value = {
    fetchUserEnrolledCourses,
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
    calculateCourseDuration,
    isEducator,
    setIsEducator,
    userData,
    setUserData,
    backendUrl,
    getToken,
    fetchAllCourses,
    fetchUserData,
    syncEducatorDashboard, // <--- call this anywhere to push totals to DB
    educatorDashboard,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
