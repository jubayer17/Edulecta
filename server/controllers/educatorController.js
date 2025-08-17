import { clerkClient } from "@clerk/express";
import connectDB from "../configs/mongodb.js";
import { cloudinary } from "../configs/cloudinary.js";
import Educator from "../models/Educator.js";
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
        "courseOfferPrice",
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

      // Initialize empty arrays only if they don't exist in the JSON
      parsedCourseData.courseContent = Array.isArray(
        parsedCourseData.courseContent
      )
        ? parsedCourseData.courseContent
        : [];

      // Only set courseRatings to empty if it doesn't exist
      if (!Array.isArray(parsedCourseData.courseRatings)) {
        parsedCourseData.courseRatings = [];
      }

      // Only set enrolledStudents to empty if it doesn't exist
      // FIXED: Don't overwrite enrolledStudents if it exists in JSON
      if (!Array.isArray(parsedCourseData.enrolledStudents)) {
        parsedCourseData.enrolledStudents = [];
      }

      console.log("Initialized arrays:", {
        courseContent: parsedCourseData.courseContent,
        courseRatings: parsedCourseData.courseRatings,
        enrolledStudents: parsedCourseData.enrolledStudents,
        isPublished: parsedCourseData.isPublished,
      });

      // Debug log to verify JSON values are preserved
      console.log("🔍 JSON Values Check:", {
        "isPublished from JSON": parsedCourseData.isPublished,
        "enrolledStudents count from JSON":
          parsedCourseData.enrolledStudents?.length || 0,
        "courseRatings count from JSON":
          parsedCourseData.courseRatings?.length || 0,
      });

      // Validate courseRatings structure if it exists
      if (
        parsedCourseData.courseRatings &&
        Array.isArray(parsedCourseData.courseRatings)
      ) {
        for (let i = 0; i < parsedCourseData.courseRatings.length; i++) {
          const rating = parsedCourseData.courseRatings[i];
          if (
            !rating.user ||
            typeof rating.user !== "string" ||
            rating.user.trim() === ""
          ) {
            return res.status(400).json({
              success: false,
              error: `courseRatings[${i}] must have a valid 'user' field as a non-empty string`,
            });
          }
          if (
            !rating.rating ||
            typeof rating.rating !== "number" ||
            rating.rating < 1 ||
            rating.rating > 5
          ) {
            return res.status(400).json({
              success: false,
              error: `courseRatings[${i}] must have a valid 'rating' field as a number between 1-5`,
            });
          }
        }
        console.log("✅ courseRatings validation passed");
      }
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
      // FIXED: Use isPublished from JSON if provided, otherwise default to false
      isPublished:
        parsedCourseData.isPublished !== undefined
          ? parsedCourseData.isPublished
          : false,
      courseContent: parsedCourseData.courseContent || [],
      // FIXED: Keep the arrays from parsedCourseData instead of overwriting
      courseRatings: parsedCourseData.courseRatings || [],
      enrolledStudents: parsedCourseData.enrolledStudents || [],
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

    // Additional debug for courseRatings specifically
    if (
      courseToCreate.courseRatings &&
      courseToCreate.courseRatings.length > 0
    ) {
      console.log("🔍 Detailed courseRatings structure:");
      courseToCreate.courseRatings.forEach((rating, index) => {
        console.log(`Rating ${index}:`, {
          user: rating.user,
          userType: typeof rating.user,
          rating: rating.rating,
          ratingType: typeof rating.rating,
          hasUser: !!rating.user,
          userLength: rating.user?.length,
        });
      });
    }

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

export const updateEducatorDashboard = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId: educatorId } = auth || {};

    if (!educatorId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    await connectDB();
    const Educator = (await import("../models/Educator.js")).default;
    const Course = (await import("../models/Course.js")).default;

    // 1️⃣ Fetch all courses belonging to this educator
    const courses = await Course.find({ educator: educatorId });

    if (!courses.length) {
      return res
        .status(404)
        .json({ error: "No courses found for this educator" });
    }

    // 2️⃣ Build publishedCourses array
    const publishedCourses = courses.map((course) => {
      const totalEnrollments = course.enrolledStudents.length;
      const totalEarnings = totalEnrollments * course.coursePrice;

      return {
        courseId: course._id,
        title: course.courseTitle,
        price: course.coursePrice,
        isPublished: course.isPublished,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        thumbnail: course.courseThumbnail,
        enrolledStudents: course.enrolledStudents.map((studentId) => ({
          studentId,
          enrolledAt: course.createdAt, // if you track actual enrollment date, replace this
        })),
        totalEnrollments,
        totalEarnings,
      };
    });

    // 3️⃣ Calculate dashboard totals
    const totalCourses = publishedCourses.length;
    const totalEnrollments = publishedCourses.reduce(
      (sum, course) => sum + course.totalEnrollments,
      0
    );
    const totalEarnings = publishedCourses.reduce(
      (sum, course) => sum + course.totalEarnings,
      0
    );

    // 4️⃣ Update educator document
    const updatedEducator = await Educator.findByIdAndUpdate(
      educatorId,
      {
        publishedCourses,
        totalCourses,
        totalEnrollments,
        totalEarnings,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Educator dashboard updated successfully",
      data: updatedEducator,
    });
  } catch (error) {
    console.error("❌ Error updating educator dashboard:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get educator dashboard info (total courses, enrollments, earnings)
// Get educator dashboard info (total courses, enrollments, earnings, publishedCourses)
export const getEducatorInfo = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId: educatorId } = auth || {};

    if (!educatorId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    await connectDB();

    const Course = (await import("../models/Course.js")).default;

    // 🔹 Fetch all courses of this educator
    const courses = await Course.find({ educator: educatorId });

    if (!courses.length) {
      return res
        .status(404)
        .json({ error: "No courses found for this educator" });
    }

    // 🔹 Build publishedCourses array
    const publishedCourses = courses.map((course) => {
      const totalEnrollments = course.enrolledStudents.length;
      const totalEarnings = totalEnrollments * (course.coursePrice || 0);

      return {
        courseId: course._id,
        title: course.courseTitle,
        price: course.coursePrice,
        isPublished: course.isPublished,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        thumbnail: course.courseThumbnail,
        enrolledStudents: course.enrolledStudents.map((studentId) => ({
          studentId,
          enrolledAt: course.createdAt, // Replace with actual enrollment date if tracked
        })),
        totalEnrollments,
        totalEarnings,
      };
    });

    // 🔹 Totals
    const totalCourses = publishedCourses.length;
    const totalEnrollments = publishedCourses.reduce(
      (sum, course) => sum + course.totalEnrollments,
      0
    );
    const totalEarnings = publishedCourses.reduce(
      (sum, course) => sum + course.totalEarnings,
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        educatorId,
        totalCourses,
        totalEnrollments,
        totalEarnings,
        publishedCourses, // ✅ Include full published courses list
      },
    });
  } catch (error) {
    console.error("❌ Error fetching educator info:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getEnrolledStudentsByEducator = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId: educatorId } = auth || {};
    // Step 1: Get educator and their published courses
    const educator = await Educator.findById(educatorId).populate(
      "publishedCourses"
    );
    if (!educator) {
      return res
        .status(404)
        .json({ success: false, message: "Educator not found" });
    }

    // Step 2: Collect all enrolled students from those courses
    let studentIds = [];
    for (const course of educator.publishedCourses) {
      studentIds.push(...course.enrolledStudents);
    }

    // Remove duplicate student IDs
    studentIds = [...new Set(studentIds.map((id) => id.toString()))];

    // Step 3: Fetch student info
    const students = await User.find({ _id: { $in: studentIds } }).select(
      "-password"
    );

    res.status(200).json({
      success: true,
      educator: educator.username,
      totalStudents: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Toggle course publication status
export const toggleCoursePublication = async (req, res) => {
  try {
    console.log("🔄 Toggling course publication status...");
    await connectDB();

    const auth = req.auth();
    const { userId: educatorId } = auth || {};
    const { courseId } = req.params;

    if (!educatorId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    if (!courseId || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Valid course ID is required",
      });
    }

    // Find the course
    const Course = (await import("../models/Course.js")).default;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Verify the educator owns this course
    if (course.educator.toString() !== educatorId) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to modify this course",
      });
    }

    // Toggle the publication status
    const newStatus = !course.isPublished;
    course.isPublished = newStatus;
    course.updatedAt = new Date();

    await course.save();

    console.log(
      `✅ Course ${courseId} publication status changed to: ${newStatus}`
    );

    return res.status(200).json({
      success: true,
      message: `Course ${newStatus ? "published" : "drafted"} successfully`,
      course: {
        _id: course._id,
        courseTitle: course.courseTitle,
        isPublished: course.isPublished,
        updatedAt: course.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error toggling course publication:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
