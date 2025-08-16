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
  const [cartItems, setCartItems] = useState([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [educatorDashboard, setEducatorDashboard] = useState({
    totalEarnings: 0,
    enrolledStudents: 0,
    numberOfCourses: 0,
    publishedCourses: [],
  });
  const [syncEducatorData, setSyncEducatorData] = useState({
    totalEarnings: 0,
    enrolledStudents: 0,
    numberOfCourses: 0,
    publishedCourses: [],
  });
  const [enrolledStudentInfo, setEnrolledStudentInfo] = useState([]);

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
  console.log(userData);

  // Memoized full enrolled courses
  const fullEnrolledCourses = useMemo(() => {
    if (!enrolledCourses?.length || !allCourses?.length) return [];
    const enrolledIds = enrolledCourses.map((c) =>
      typeof c === "string" ? c : c._id
    );
    return allCourses.filter((course) => enrolledIds.includes(course._id));
  }, [enrolledCourses, allCourses]);

  //get educator info
  const fetchEducatorDashboard = async () => {
    try {
      const token = await getToken();
      console.log(token);
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/educator/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setEducatorDashboard(data.data);
        toast.success("Educator dashboard fetched successfully!");
      }
    } catch (error) {
      console.error("Error fetching educator dashboard:", error);
    }
  };
  console.log("Educator Dashboard:", educatorDashboard);

  // Educator dashboard calculation & sync function
  const syncEducatorDashboard = async () => {
    if (!isEducator) return;

    try {
      const token = await getToken();
      console.log(token);
      if (!token) return;

      // Call backend to sync dashboard
      const { data } = await axios.patch(
        `${backendUrl}/api/educator/update-dashboard`,
        {}, // no body needed
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // Update state with full returned educator data
        setSyncEducatorData(data.data);
        toast.success("Educator dashboard synced successfully!");
      } else {
        toast.error(data.message || "Failed to sync dashboard");
      }
    } catch (error) {
      console.error("Error syncing dashboard:", error);
      toast.error(error.response?.data?.message || "Dashboard sync failed");
    }
  };
  console.log("Sync Educator Data:", syncEducatorData);

  //update course by id
  const updateCourse = async (updatedCourse) => {
    try {
      const token = await getToken();
      if (!token) return;

      // Send the full course object as required by backend
      const { _id, educator, ...updateData } = updatedCourse;
      const educatorField = educator?._id
        ? educator
        : { _id: educatorDashboard._id };

      const { data } = await axios.patch(
        `${backendUrl}/api/course/update`,
        { _id, educator: educatorField, ...updateData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Course updated successfully!");
        return data.course;
      } else {
        toast.error(data.message || "Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(error.response?.data?.message || "Course update failed");
    }
  };

  //   // Get Enrolled Students Info
  const enrolledStudentsInfo = async () => {
    if (!isEducator) return;

    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get(
        `${backendUrl}/api/educator/enrolled-students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.enrolledStudentsData) {
        setEnrolledStudentInfo(data.enrolledStudentsData);
        // console.log("Enrolled Students Info:", data.enrolledStudentsData);
        toast.success("Enrolled students fetched successfully!");
      } else {
        toast.error(data.message || "Failed to fetch enrolled students");
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch enrolled students"
      );
    }
  };

  console.log("Enrolled Students Info:", enrolledStudentInfo);

  // Utility functions
  const calculateRating = useCallback((course) => {
    if (!course.courseRatings?.length) return 0;
    const total = course.courseRatings.reduce(
      (acc, val) => acc + val.rating,
      0
    );
    return Math.round((total / course.courseRatings.length) * 2) / 2;
  }, []);

  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.forEach((lecture) => {
      time += lecture.lectureDuration;
    });
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // const calculateCourseDuration = (course) => {
  //   let totalMinutes = 0;
  //   course.courseContent?.forEach((chapter) =>
  //     chapter.chapterContent?.forEach((lecture) => {
  //       totalMinutes += lecture.lectureDuration || 0;
  //     })
  //   );
  //   const hours = Math.floor(totalMinutes / 60);
  //   const minutes = totalMinutes % 60;
  //   return `${hours}h ${minutes}m`;
  // };

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

    return `${hours}h ${minutes}m`; // ✅ Fixed: now using backticks
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

  // console.log("User Data:", userData);

  const formatLectureDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);

    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Initialize
  useEffect(() => {
    if (!user) return;
    const init = async () => {
      await fetchUserData();
      await fetchAllCourses();
      await fetchEducatorDashboard();

      if (user?.publicMetadata?.role === "educator")
        await syncEducatorDashboard();
    };
    init();
  }, [user]);
  useEffect(() => {
    if (isEducator) {
      enrolledStudentsInfo();
    }
  }, [isEducator]);

  // Cart functions
  const addToCart = (course) => {
    if (!course) return;

    // Check if course is already in cart
    const existingItem = cartItems.find((item) => item._id === course._id);
    if (existingItem) {
      toast.info("Course is already in your cart!");
      setIsCartDrawerOpen(true); // Open drawer to show existing items
      return;
    }

    // Check if user is already enrolled
    const isEnrolled = enrolledCourses.some(
      (enrolled) => enrolled._id === course._id
    );
    if (isEnrolled) {
      toast.info("You are already enrolled in this course!");
      return;
    }

    setCartItems((prev) => [...prev, course]);
    toast.success("Course added to cart!");
    // Don't auto-open drawer here - let CourseCard handle it
  };

  const removeFromCart = (courseId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== courseId));
    toast.success("Course removed from cart!");
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCartDrawer = () => {
    setIsCartDrawerOpen((prev) => !prev);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, course) => {
      const coursePrice = parseFloat(course.coursePrice) || 0;
      const courseOfferPrice = parseFloat(course.courseOfferPrice) || 0;
      const discount = parseFloat(course.discount) || 0;

      const finalPrice =
        courseOfferPrice > 0
          ? courseOfferPrice
          : coursePrice - (discount * coursePrice) / 100;

      return total + finalPrice;
    }, 0);
  };

  const value = {
    enrolledStudentInfo,
    setEnrolledStudentInfo,
    user,
    updateCourse,
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
    calculateChapterTime,
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
    syncEducatorDashboard, // <--- call this anywhere to push totals to DB
    educatorDashboard,
    // Cart functionality
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    isCartDrawerOpen,
    toggleCartDrawer,
    getCartTotal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
