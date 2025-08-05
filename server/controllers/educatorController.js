import { clerkClient } from "@clerk/express";
import connectDB from "../configs/mongodb.js";
import { v2 as cloudinary } from "cloudinary";
//update the user role to educator
// This function updates the user's role to "educator" in Clerk and connects to the database
export const updateRoleToEducator = async (req, res) => {
  try {
    console.log("🔗 Connecting to database...");
    await connectDB();
    console.log("✅ Database connection successful");

    // Debug: Log the entire auth object
    console.log("🔍 req.auth():", req.auth());
    console.log("🔍 req.headers:", req.headers);

    // Ensure the user is authenticated
    const auth = req.auth();
    const { userId } = auth || {};
    console.log("🔍 Extracted userId:", userId);

    if (!userId) {
      return res.status(400).json({
        error: "User ID is required",
        debug: {
          authObject: req.auth(),
          hasAuthHeader: !!req.headers.authorization,
        },
      });
    }
    // Update the user's role in Clerk
    console.log(`🔄 Updating user role for user ID: ${userId}`);
    await clerkClient.users.updateUserMetadata(userId, {
      // Set the role to "educator"

      publicMetadata: {
        role: "educator",
      },
    });
    return res.status(200).json({
      message: "User role updated to educator successfully",
    });
  } catch (error) {
    console.error("❌ Error updating user role:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const AddCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imgFile = req.file; // Assuming you're using multer for file uploads
    const auth = req.auth();
    const { userId: educatorId } = auth || {};

    if (!educatorId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    if (!imgFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const parseCourseData = JSON.parse(courseData);
    parseCourseData.educator = educatorId;

    // Connect to the database
    await connectDB();
    console.log("✅ Database connection successful");
    // Import the Course model dynamically
    const Course = (await import("../models/Course.js")).default;
    // Create a new course instance
    const newCourse = new Course({
      ...parseCourseData,
    });
    const imgUpload = await cloudinary.uploader.upload(imgFile.path);
    newCourse.courseThumbnail = imgUpload.secure_url; // Save the image URL from Cloudinary
    // Save the new course to the database
    console.log("📚 Saving new course to the database...");
    await newCourse.save();

    // Return simple success response
    return res.status(201).json({
      message: "Course created successfully",
    });
  } catch (error) {
    console.error("❌ Error in AddCourse:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//Get educator Courses
export const GetEducatorCourses = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId: educatorId } = auth || {};

    if (!educatorId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    // Connect to the database
    await connectDB();
    console.log("✅ Database connection successful");

    // Import the Course model dynamically
    const Course = (await import("../models/Course.js")).default;

    // Find courses by educator ID
    const courses = await Course.find({ educator: educatorId });

    return res.status(200).json({
      message: "Courses fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching educator courses:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const auth = req.auth();
    const { userId: educatorId } = auth || {};

    if (!educatorId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    // Connect to the database
    await connectDB();
    console.log("✅ Database connection successful");

    // Import the Course model dynamically
    const Course = (await import("../models/Course.js")).default;

    // Find and delete the course by ID
    const deletedCourse = await Course.findOneAndDelete({
      _id: courseId,
      educator: educatorId,
    });

    if (!deletedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting course:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get educator dashboard data (total earnings, enrolled students, no of courses)
export const getEducatorDashboardData = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId: educatorId } = auth || {};

    if (!educatorId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    // Connect to the database
    await connectDB();
    console.log("✅ Database connection successful");

    // Import the Course model dynamically
    const Course = (await import("../models/Course.js")).default;

    // Fetch courses by educator ID
    const courses = await Course.find({ educator: educatorId });

    if (!courses || courses.length === 0) {
      return res
        .status(404)
        .json({ error: "No courses found for this educator" });
    }

    // Calculate total earnings, enrolled students, and number of courses
    const totalEarnings = courses.reduce(
      (acc, course) => acc + course.coursePrice,
      0
    );
    const enrolledStudents = courses.reduce(
      (acc, course) => acc + course.enrolledStudents.length,
      0
    );
    const numberOfCourses = courses.length;

    return res.status(200).json({
      totalEarnings,
      enrolledStudents,
      numberOfCourses,
      message: "Dashboard data fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching educator dashboard data:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get enrolled students data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId: educatorId } = auth || {};

    if (!educatorId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    // Connect to the database
    await connectDB();
    console.log("✅ Database connection successful");

    // Import the models dynamically
    const Course = (await import("../models/Course.js")).default;
    const Purchase = (await import("../models/Purchase.js")).default;

    // First, get courses by educator ID
    const courses = await Course.find({ educator: educatorId });

    if (!courses || courses.length === 0) {
      return res
        .status(404)
        .json({ error: "No courses found for this educator" });
    }

    // Get course IDs
    const courseIds = courses.map((course) => course._id);

    // Find purchases for these courses with completed status
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle courseThumbnail coursePrice");

    // Format the enrolled students data
    const enrolledStudentsData = purchases.map((purchase) => ({
      studentId: purchase.userId._id,
      studentName: purchase.userId.name,
      studentImage: purchase.userId.imageUrl,
      courseId: purchase.courseId._id,
      courseTitle: purchase.courseId.courseTitle,
      courseThumbnail: purchase.courseId.courseThumbnail,
      coursePrice: purchase.courseId.coursePrice,
      purchaseDate: purchase.purchaseDate,
      amount: purchase.amount,
      transactionId: purchase._id,
    }));

    return res.status(200).json({
      enrolledStudentsData,
      totalPurchases: purchases.length,
      message: "Enrolled students data fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching enrolled students data:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
