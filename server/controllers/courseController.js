import connectDB from "../configs/mongodb.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";

// Get All Courses (Public endpoint for students)
export const getAllCourse = async (req, res) => {
  try {
    await connectDB();

    // Get all courses without filtering
    const courses = await Course.find()
      .select(
        "courseTitle courseDescription courseThumbnail coursePrice courseOfferPrice courseCategory isPublished discount courseContent courseRatings educator enrolledStudents createdAt updatedAt"
      )
      .populate({
        path: "educator",
        select: "username imageUrl",
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(
      `Found ${courses.length} courses in database:`,
      courses.map((c) => ({
        id: c._id,
        title: c.courseTitle,
        isPublished: c.isPublished,
      }))
    );

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No published courses found",
      });
    }

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

// Get Course by ID (Public endpoint for students)
export const getCourseById = async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    const course = await Course.findOne({ _id: id, isPublished: true })
      .select("")
      .populate({
        path: "educator",
        select: "username imageUrl courseContent",
      })
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or not published",
      });
    }

    if (Array.isArray(course.courseContent)) {
      course.courseContent.forEach((chapter) => {
        if (Array.isArray(chapter.chapterContent)) {
          chapter.chapterContent.forEach((lecture) => {
            if (!lecture.isPreviewFree) {
              lecture.lectureUrl = undefined;
            }
          });
        }
      });
    }

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

// Update a course (Private: only educator can update their own courses)
export const updateCourse = async (req, res) => {
  try {
    await connectDB();

    const { _id: courseId, educator, ...updateData } = req.body;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing course ID",
      });
    }

    if (!educator || !educator._id) {
      return res.status(400).json({
        success: false,
        message: "Educator ID missing in request body",
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Ensure educator owns this course
    if (course.educator.toString() !== educator._id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this course",
      });
    }

    // Update only provided fields
    Object.keys(updateData).forEach((key) => {
      course[key] = updateData[key];
    });

    const updatedCourse = await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("❌ Error updating course:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
