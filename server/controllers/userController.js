import connectDB from "../configs/mongodb.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

export const GetUserData = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId } = auth || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    // Connect to the database
    await connectDB();
    console.log("✅ Database connection successful");

    // Find user by ID
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error fetching user data:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

//user enrolled courses with lecture links
export const GetUserEnrolledCourses = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId } = auth || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    // Connect to the database
    await connectDB();
    console.log("✅ Database connection successful");

    // Find user by ID and populate enrolled courses with full course content
    const user = await User.findById(userId)
      .populate({
        path: "enrolledCourses",
        select:
          "courseTitle courseDescription courseThumbnail coursePrice courseCategory courseContent educator",
        populate: {
          path: "educator",
          select: "username imageUrl",
        },
      })
      .lean(); // Use lean for better performance

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Format the enrolled courses with better structure
    const formattedCourses = user.enrolledCourses.map((course) => ({
      _id: course._id,
      courseTitle: course.courseTitle,
      courseDescription: course.courseDescription,
      courseThumbnail: course.courseThumbnail,
      coursePrice: course.coursePrice,
      courseCategory: course.courseCategory,
      educator: course.educator,
      totalChapters: course.courseContent?.length || 0,
      totalLectures:
        course.courseContent?.reduce(
          (total, chapter) => total + (chapter.chapterContent?.length || 0),
          0
        ) || 0,
      courseContent: course.courseContent || [],
    }));

    return res.status(200).json({
      success: true,
      message: "User enrolled courses fetched successfully",
      courses: formattedCourses,
      totalEnrolledCourses: formattedCourses.length,
    });
  } catch (error) {
    console.error("❌ Error fetching user enrolled courses:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Enroll user in a course
export const EnrollInCourse = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId } = auth || {};
    const { courseId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: "Course ID is required",
      });
    }

    // Connect to the database
    await connectDB();
    console.log("✅ Database connection successful");

    // Check if course exists and is published
    const course = await Course.findOne({ _id: courseId, isPublished: true });
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found or not published",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if user is already enrolled
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        error: "User is already enrolled in this course",
      });
    }

    // Enroll user in course
    await User.findByIdAndUpdate(userId, {
      $push: { enrolledCourses: courseId },
    });

    // Add user to course's enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $push: { enrolledStudents: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      courseTitle: course.courseTitle,
    });
  } catch (error) {
    console.error("❌ Error enrolling in course:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
