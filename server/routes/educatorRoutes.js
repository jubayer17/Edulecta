import express from "express";
import {
  AddCourse,
  deleteCourse,
  GetEducatorCourses,
  getEducatorDashboardData,
  getEnrolledStudentsData,
  updateRoleToEducator,
} from "../controllers/educatorController.js";
import upload, { handleMulterError } from "./../configs/multer.js";
import { protectEducator } from "./../middlewares/authMiddleware.js";

// Create a new router for educator routes
// This will handle routes related to educators
const educatorRouter = express.Router();

// Define the route to update user role to educator
// This route will be protected by Clerk's authentication middleware
educatorRouter.post("/update-role-educator", updateRoleToEducator);

educatorRouter.post(
  "/add-course",
  protectEducator,
  upload.single("image"),
  handleMulterError,
  AddCourse
);
educatorRouter.get("/get-courses", protectEducator, GetEducatorCourses);

educatorRouter.delete(
  "/delete-course/:courseId",
  protectEducator,
  deleteCourse
);

// Get educator dashboard data
educatorRouter.get(
  "/dashboard-data",
  protectEducator,
  getEducatorDashboardData
);

// Get enrolled students data
educatorRouter.get(
  "/enrolled-students",
  protectEducator,
  getEnrolledStudentsData
);

// Test endpoint with hardcoded user ID for testing
educatorRouter.get("/test-update-role", async (req, res) => {
  try {
    // Use a test user ID - replace with actual user ID from your Clerk dashboard
    const testUserId = "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V"; // Replace with your actual user ID

    // Mock req.auth for testing
    req.auth = { userId: testUserId };

    // Call the actual controller
    return updateRoleToEducator(req, res);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default educatorRouter;
