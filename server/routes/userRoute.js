import express from "express";
import {
  GetUserData,
  GetUserEnrolledCourses,
  EnrollInCourse,
} from "../controllers/userController.js";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "../configs/mongodb.js";

const userRouter = express.Router();

// Get user data (protected route)
userRouter.get("/profile", GetUserData);

// Get user enrolled courses (protected route)
userRouter.get("/enrolled-courses", GetUserEnrolledCourses);

// Enroll in a course (protected route)
userRouter.post("/enroll", EnrollInCourse);

// Test endpoint without authentication (temporary)
userRouter.get("/test", async (req, res) => {
  try {
    await connectDB();
    const User = (await import("../models/User.js")).default;

    // Get a test user (the educator user we know exists)
    const testUser = await User.findById(
      "user_30mKTSUbNc8ZnECNgCHweJ5pOpd"
    ).select("-password");

    if (!testUser) {
      return res.json({ success: false, message: "Test user not found" });
    }

    return res.json({
      success: true,
      message: "Test endpoint working - user controller is functional",
      user: testUser,
    });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

export default userRouter;
