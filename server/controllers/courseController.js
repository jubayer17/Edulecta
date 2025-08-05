import connectDB from "../configs/mongodb.js";

// Get All Courses (Public endpoint for students)
export const getAllCourse = async (req, res) => {
  try {
    // Connect to the database
    await connectDB();
    console.log("✅ Database connection successful");

    // Import the Course model dynamically
    const Course = (await import("../models/Course.js")).default;

    // Find all published courses and populate educator details
    const courses = await Course.find({ isPublished: true })
      .select("-courseContent -enrolledStudents") // Exclude sensitive data
      .populate({
        path: "educator",
        select: "username imageUrl", // Only get educator username and image
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Use lean() for better performance since we're not modifying

    // Check if courses exist
    if (!courses || courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No published courses found",
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      courses,
      totalCourses: courses.length,
      message: "Courses fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching courses:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//Get Course by ID (Public endpoint for students)
export const getCourseById = async (req, res) => {
  try {
    // Connect to the database
    await connectDB();
    console.log("✅ Database connection successful");

    // Import the Course model dynamically
    const Course = (await import("../models/Course.js")).default;

    // Get course ID from request parameters
    const { id } = req.params;

    // Validate course ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    // Find course by ID, check if published, and populate educator details
    const course = await Course.findOne({
      _id: id,
      isPublished: true,
    })
      .select("-enrolledStudents") // Exclude sensitive data but keep courseContent for learning
      .populate({
        path: "educator",
        select: "username imageUrl", // Only get educator username and image
      })
      .lean(); // Use lean() for better performance

    // Check if course exists and is published
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or not published",
      });
    }

    //Remove lecture url if preview is false
    if (course.courseContent && Array.isArray(course.courseContent)) {
      course.courseContent.forEach((chapter) => {
        if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
          chapter.chapterContent.forEach((lecture) => {
            if (!lecture.isPreviewFree) {
              lecture.lectureUrl = undefined; // Remove lecture URL if not a preview
            }
          });
        }
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      course,
      message: "Course fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching course:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
