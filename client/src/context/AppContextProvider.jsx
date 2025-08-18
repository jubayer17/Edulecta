/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  const [cartItems, setCartItems] = useState(() => {
    // Initialize cart from localStorage
    try {
      const savedCart = localStorage.getItem("edulecta_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [cartVibrating, setCartVibrating] = useState(false);
  const [pendingPurchasesCount, setPendingPurchasesCount] = useState(0);
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [pendingPurchasesLoading, setPendingPurchasesLoading] = useState(false);
  const hasInitialized = useRef(false);
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

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem("edulecta_cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  // Fetch all courses
  const fetchAllCourses = useCallback(async () => {
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
  }, [backendUrl]);

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

  // Fetch user profile with enhanced error handling and data validation
  const fetchUserData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.log("No token available, skipping user data fetch");
        return;
      }

      console.log("🔍 Fetching user data...");
      const { data } = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.user) {
        console.log("✅ User data fetched successfully:", {
          id: data.user._id,
          username: data.user.username,
          email: data.user.email,
          isEducator: data.user.isEducator,
        });

        setUserData(data.user);
        setEnrolledCourses(data.user.enrolledCourses || []);

        // Set educator status from both user data and Clerk metadata
        const isEducatorFromData = data.user.isEducator || false;
        const isEducatorFromClerk =
          user?.publicMetadata?.role === "educator" || false;
        const shouldBeEducator = isEducatorFromData || isEducatorFromClerk;

        console.log("🔍 Educator status check:", {
          fromUserData: isEducatorFromData,
          fromClerk: isEducatorFromClerk,
          currentIsEducator: isEducator,
          shouldBeEducator,
        });

        if (shouldBeEducator !== isEducator) {
          console.log(
            `🔄 Updating educator status from ${isEducator} to ${shouldBeEducator}`
          );
          setIsEducator(shouldBeEducator);
        }
      } else {
        console.warn(
          "⚠️ User data fetch failed or returned invalid data:",
          data
        );
        setEnrolledCourses([]);
        setUserData(null);
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setEnrolledCourses([]);
      setUserData(null);

      // Don't show toast for authentication errors to avoid spam
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error(
          "Failed to fetch user data. Please try refreshing the page."
        );
      }
    }
  }, [backendUrl, getToken, user?.publicMetadata?.role, isEducator]);
  console.log(userData);

  // Memoized full enrolled courses
  const fullEnrolledCourses = useMemo(() => {
    if (!enrolledCourses?.length || !allCourses?.length) return [];
    const enrolledIds = enrolledCourses.map((c) =>
      typeof c === "string" ? c : c._id
    );
    return allCourses.filter((course) => enrolledIds.includes(course._id));
  }, [enrolledCourses, allCourses]);

  //get educator info with enhanced validation
  const fetchEducatorDashboard = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.log("No token available, skipping educator dashboard fetch");
        return;
      }

      // Only fetch if user is an educator
      if (!isEducator && user?.publicMetadata?.role !== "educator") {
        console.log("User is not an educator, skipping dashboard fetch");
        return;
      }

      console.log("🔍 Fetching educator dashboard...");
      const { data } = await axios.get(`${backendUrl}/api/educator/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.data) {
        console.log("✅ Educator dashboard fetched successfully:", {
          totalCourses: data.data.totalCourses,
          totalEnrollments: data.data.totalEnrollments,
          totalEarnings: data.data.totalEarnings,
        });

        setEducatorDashboard(data.data);

        // Ensure educator status is set if we successfully fetched educator data
        if (!isEducator) {
          console.log(
            "🔄 Setting educator status to true based on successful dashboard fetch"
          );
          setIsEducator(true);
        }
      } else {
        console.warn("⚠️ Educator dashboard fetch failed:", data);
        // Don't reset educator status here - user might be a new educator with no courses yet
      }
    } catch (error) {
      console.error("❌ Error fetching educator dashboard:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Only show error for non-auth related errors
      if (error.response?.status === 404) {
        console.log(
          "📝 Educator record not found - user might need to create educator profile"
        );
      } else if (
        error.response?.status !== 401 &&
        error.response?.status !== 403
      ) {
        toast.error("Failed to fetch educator dashboard");
      }
    }
  }, [backendUrl, getToken, isEducator, user?.publicMetadata?.role]);
  console.log("Educator Dashboard:", educatorDashboard);

  // Educator dashboard calculation & sync function
  const syncEducatorDashboard = useCallback(async () => {
    if (!isEducator) return;

    // Check if educator has any courses before trying to sync
    if (
      !educatorDashboard.publishedCourses ||
      educatorDashboard.publishedCourses.length === 0
    ) {
      console.log("No courses found, skipping dashboard sync");
      return;
    }

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
  }, [backendUrl, getToken, isEducator, educatorDashboard.publishedCourses]);
  console.log("Sync Educator Data:", syncEducatorData);

  // Toggle course publication status
  const toggleCoursePublication = useCallback(
    async (courseId) => {
      if (!isEducator) return { success: false, error: "Not an educator" };

      try {
        const token = await getToken();
        if (!token) return { success: false, error: "No authentication token" };

        console.log(`🔄 Toggling publication status for course: ${courseId}`);

        const { data } = await axios.patch(
          `${backendUrl}/api/educator/toggle-publication/${courseId}`,
          {}, // no body needed
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          console.log(`✅ Course publication toggled:`, data.course);

          // Refresh the educator dashboard to get updated data
          await syncEducatorDashboard();

          toast.success(data.message);
          return { success: true, course: data.course };
        } else {
          toast.error(data.error || "Failed to toggle course publication");
          return { success: false, error: data.error };
        }
      } catch (error) {
        console.error("Error toggling course publication:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Failed to toggle course publication";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [backendUrl, getToken, isEducator, syncEducatorDashboard]
  );

  // Handle cart checkout with multiple courses
  const purchaseCart = useCallback(
    async (cartItems) => {
      if (!user || !cartItems || cartItems.length === 0) {
        return {
          success: false,
          error: "Invalid cart data or user not authenticated",
        };
      }

      try {
        const token = await getToken();
        if (!token) {
          return { success: false, error: "No authentication token" };
        }

        console.log(
          `🛒 Starting cart checkout with ${cartItems.length} courses`
        );

        // Extract course IDs from cart items
        const courseIds = cartItems.map((item) => item._id);

        const { data } = await axios.post(
          `${backendUrl}/api/user/purchase-cart`,
          { courseIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          console.log(`✅ Cart checkout session created:`, data);
          return {
            success: true,
            sessionUrl: data.sessionUrl,
            sessionId: data.sessionId,
            totalAmount: data.totalAmount,
            courseCount: data.courseCount,
          };
        } else {
          console.error("❌ Cart checkout failed:", data);
          return { success: false, error: data.error };
        }
      } catch (error) {
        console.error("Error during cart checkout:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Failed to process cart checkout";
        return { success: false, error: errorMessage };
      }
    },
    [backendUrl, getToken, user]
  );

  // Fetch pending purchases count
  const fetchPendingPurchasesCount = useCallback(async () => {
    console.log("🔄 fetchPendingPurchasesCount called", {
      user: !!user,
      userData: !!userData,
    });

    if (!user) {
      console.log("❌ No user, skipping pending purchases fetch");
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.log("❌ No token, skipping pending purchases fetch");
        return;
      }

      console.log("📡 Fetching pending purchases count...");
      const { data } = await axios.get(
        `${backendUrl}/api/user/pending-purchases-count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("📊 Pending purchases response:", data);
      if (data.success) {
        console.log("📊 Pending purchases debug:", data.debug);
        console.log("📊 Setting count to:", data.count);
        setPendingPurchasesCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching pending purchases count:", error);
      // Don't show error toast for this as it's background data
      setPendingPurchasesCount(0);
    }
  }, [user, userData, getToken, backendUrl]);

  // Fetch pending purchases with full details
  const fetchPendingPurchases = useCallback(async () => {
    if (!user) {
      console.log("❌ No user, skipping pending purchases fetch");
      return;
    }

    setPendingPurchasesLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        console.log("❌ No token, skipping pending purchases fetch");
        return;
      }

      console.log("📡 Fetching pending purchases...");
      const { data } = await axios.get(`${backendUrl}/api/user/purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter and format pending purchases
      const pendingPurchases = data.purchases
        .filter((purchase) =>
          ["pending", "incomplete", "failed"].includes(purchase.status)
        )
        .filter((purchase) => purchase.courseId); // Only include purchases with valid courseId

      console.log("📊 Raw pending purchases:", pendingPurchases.length);

      // Get course details for each purchase
      const purchasesWithDetails = await Promise.all(
        pendingPurchases.map(async (purchase) => {
          if (!purchase.courseId) return purchase;

          // Extract courseId string - handle both string and populated object cases
          const courseId =
            typeof purchase.courseId === "string"
              ? purchase.courseId
              : purchase.courseId._id || purchase.courseId.toString();

          console.log(
            `🔍 Processing purchase with courseId:`,
            `Type: ${typeof purchase.courseId}, Value: ${courseId}`
          );

          try {
            const courseResponse = await axios.get(
              `${backendUrl}/api/course/${courseId}?includeDrafts=true`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (courseResponse.data.success && courseResponse.data.course) {
              return {
                ...purchase,
                courseDetails: courseResponse.data.course,
              };
            } else {
              console.log(
                `No course data found for ${courseId}:`,
                courseResponse.data
              );
              // Return purchase without course details if course not found
              return {
                ...purchase,
                courseDetails: {
                  courseTitle: "Course Not Found",
                  courseDescription:
                    "This course may have been removed or unpublished",
                  coursePrice: purchase.amount || 0,
                },
              };
            }
          } catch (error) {
            console.error(
              `Error fetching course details for ${courseId}:`,
              error.response?.data || error.message
            );
            // Return purchase with fallback course details if API call fails
            return {
              ...purchase,
              courseDetails: {
                courseTitle: "Course Unavailable",
                courseDescription: "Unable to load course details",
                coursePrice: purchase.amount || 0,
              },
            };
          }
        })
      );

      // Keep all purchases - even those with fallback course details
      console.log(
        "📊 Pending purchases with details:",
        purchasesWithDetails.length
      );
      setPendingPurchases(purchasesWithDetails);

      // Update the count based on actual purchases
      setPendingPurchasesCount(purchasesWithDetails.length);
    } catch (error) {
      console.error("Error fetching pending purchases:", error);
      setPendingPurchases([]);
      setPendingPurchasesCount(0);
    } finally {
      setPendingPurchasesLoading(false);
    }
  }, [user, getToken, backendUrl]);

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
  const enrolledStudentsInfo = useCallback(async () => {
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
        console.log("Enrolled students fetched successfully");
      } else {
        toast.error(data.message || "Failed to fetch enrolled students");
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch enrolled students"
      );
    }
  }, [backendUrl, getToken, isEducator]);

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

  // Initialize courses immediately when app loads (no auth required)
  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]); // Run when fetchAllCourses changes

  // Initialize user-specific data when user changes
  useEffect(() => {
    if (!user) {
      hasInitialized.current = false; // Reset when user logs out
      setIsEducator(false); // Reset educator status
      setUserData(null);
      setEducatorDashboard({
        totalEarnings: 0,
        enrolledStudents: 0,
        numberOfCourses: 0,
        publishedCourses: [],
      });
      return;
    }

    if (hasInitialized.current) return; // Prevent multiple calls

    const init = async () => {
      hasInitialized.current = true;
      console.log("🚀 Initializing user data for:", user.id);

      // Check Clerk metadata first
      const isEducatorFromClerk = user?.publicMetadata?.role === "educator";
      if (isEducatorFromClerk && !isEducator) {
        console.log("🏫 Setting educator status from Clerk metadata");
        setIsEducator(true);
      }

      // Fetch user data and other information
      await fetchUserData();
      await fetchEducatorDashboard();
      await fetchPendingPurchases(); // Use the full fetch instead of just count

      // Sync educator dashboard if user is an educator
      if (isEducatorFromClerk || isEducator) {
        console.log("🔄 Syncing educator dashboard...");
        try {
          await syncEducatorDashboard();
        } catch (error) {
          console.warn("⚠️ Failed to sync educator dashboard:", error);
        }
      }
    };
    init();
  }, [
    user,
    fetchUserData,
    fetchEducatorDashboard,
    syncEducatorDashboard,
    fetchPendingPurchases,
    isEducator, // Add isEducator to dependencies
  ]);

  useEffect(() => {
    if (
      isEducator &&
      hasInitialized.current &&
      educatorDashboard.publishedCourses.length > 0
    ) {
      enrolledStudentsInfo();
    }
  }, [
    isEducator,
    enrolledStudentsInfo,
    educatorDashboard.publishedCourses.length,
  ]);

  // Cart functions
  const addToCart = (course) => {
    if (!course) return;

    // Check if course is already in cart
    const existingItem = cartItems.find((item) => item._id === course._id);
    if (existingItem) {
      toast.info("Course is already in your cart!");
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

    // Trigger vibration effect
    triggerCartVibration();
  };

  const triggerCartVibration = () => {
    setCartVibrating(true);
    setTimeout(() => setCartVibrating(false), 600); // Vibrate for 600ms
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
    toggleCoursePublication, // <--- toggle course publication status
    educatorDashboard,
    fetchEducatorDashboard, // Add this for components that need to refresh educator data
    // Cart functionality
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    isCartDrawerOpen,
    toggleCartDrawer,
    getCartTotal,
    cartVibrating,
    triggerCartVibration,
    purchaseCart, // Added cart checkout function
    // Pending purchases
    pendingPurchasesCount,
    pendingPurchases,
    pendingPurchasesLoading,
    fetchPendingPurchases,
    fetchPendingPurchasesCount,
  };

  // Add to window for debugging
  if (typeof window !== "undefined") {
    window.debugPendingPurchases = fetchPendingPurchases;
    window.forcePendingUpdate = () => {
      console.log("🔄 Force updating pending purchases...");
      fetchPendingPurchases();
    };
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
