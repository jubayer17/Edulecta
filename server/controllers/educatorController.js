import { clerkClient } from "@clerk/express";
import connectDB from "../configs/mongodb.js";
import { cloudinary } from "../configs/cloudinary.js";
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
    console.log("📝 Starting course creation process...");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    // 1. Validate request data
    const { courseData } = req.body;
    const imgFile = req.file;
    const auth = req.auth();
    const { userId: educatorId } = auth || {};

    console.log("Course Data received:", courseData);
    console.log("Image File received:", imgFile ? "Yes" : "No");
    console.log("Educator ID:", educatorId);

    if (!educatorId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    if (!imgFile) {
      return res.status(400).json({
        success: false,
        error: "Course thumbnail image is required",
      });
    }

    if (!courseData) {
      return res.status(400).json({
        success: false,
        error: "Course data is required",
      });
    }

    // 2. Parse and validate course data
    let parsedCourseData;
    try {
      parsedCourseData = JSON.parse(courseData);
      console.log("✅ Course data parsed successfully:", parsedCourseData);

      // Validate required fields
      const requiredFields = [
        "courseTitle",
        "courseDescription",
        "coursePrice",
        "courseCategory",
        "discount",
      ];
      const missingFields = requiredFields.filter(
        (field) => !parsedCourseData[field]
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      // Ensure courseContent is an array
      if (
        parsedCourseData.courseContent &&
        !Array.isArray(parsedCourseData.courseContent)
      ) {
        return res.status(400).json({
          success: false,
          error: "courseContent must be an array",
        });
      }

      // Initialize empty arrays
      parsedCourseData.courseContent = Array.isArray(
        parsedCourseData.courseContent
      )
        ? parsedCourseData.courseContent
        : [];
      // Explicitly set courseRatings as an empty array
      parsedCourseData.courseRatings = [];
      parsedCourseData.enrolledStudents = [];

      console.log("Initialized arrays:", {
        courseContent: parsedCourseData.courseContent,
        courseRatings: parsedCourseData.courseRatings,
        enrolledStudents: parsedCourseData.enrolledStudents,
      });
    } catch (parseError) {
      console.error("❌ Error parsing course data:", parseError);
      return res.status(400).json({
        success: false,
        error: "Invalid course data format",
      });
    }

    // 3. Connect to database
    await connectDB();
    console.log("✅ Database connection successful");

    // 4. Upload image to Cloudinary
    console.log("📤 Preparing to upload image to Cloudinary...");
    console.log("Image file details:", {
      mimetype: imgFile.mimetype,
      size: imgFile.size,
      originalName: imgFile.originalname,
    });

    let imgUpload;
    try {
      // Create a buffer from the file
      const buffer = imgFile.buffer;

      // Convert buffer to base64 string
      const base64String = buffer.toString("base64");
      const dataURI = `data:${imgFile.mimetype};base64,${base64String}`;

      // Upload to Cloudinary
      imgUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          dataURI,
          {
            folder: "course-thumbnails",
            resource_type: "auto",
            timeout: 120000, // 2 minute timeout
            transformation: [
              { quality: "auto:good" }, // Automatic quality optimization
              { fetch_format: "auto" }, // Automatic format selection
            ],
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else {
              console.log("Cloudinary upload successful:", result.secure_url);
              resolve(result);
            }
          }
        );
      });

      if (!imgUpload || !imgUpload.secure_url) {
        throw new Error("Failed to get secure URL from Cloudinary");
      }
    } catch (cloudinaryError) {
      console.error("Detailed Cloudinary error:", cloudinaryError);
      throw new Error(`Image upload failed: ${cloudinaryError.message}`);
    }

    if (!imgUpload || !imgUpload.secure_url) {
      console.error("❌ Failed to upload image to Cloudinary");
      return res.status(500).json({
        success: false,
        error: "Failed to upload course thumbnail",
      });
    }

    console.log("✅ Image uploaded successfully");

    // 5. Create and save the course
    const Course = (await import("../models/Course.js")).default;

    // Prepare the final course data
    const courseToCreate = {
      ...parsedCourseData,
      educator: educatorId,
      courseThumbnail: imgUpload.secure_url,
      isPublished: false,
      courseContent: parsedCourseData.courseContent || [],
      courseRatings: [], // Explicitly set empty array
      enrolledStudents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Remove any undefined or null values
    Object.keys(courseToCreate).forEach((key) => {
      if (courseToCreate[key] === undefined || courseToCreate[key] === null) {
        delete courseToCreate[key];
      }
    });

    console.log(
      "Creating course with data:",
      JSON.stringify(courseToCreate, null, 2)
    );
    const newCourse = new Course(courseToCreate);

    console.log("📚 Saving course to database...");
    await newCourse.save();

    // 6. Return success response
    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      courseId: newCourse._id,
      thumbnailUrl: imgUpload.secure_url,
    });
  } catch (error) {
    console.error("❌ Error in AddCourse:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create course",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
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
      success: true,
      message: "Courses fetched successfully",
      courses: courses,
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
