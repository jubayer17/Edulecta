import express from "express";
import {
  AddCourse,
  deleteCourse,
  GetEducatorCourses,
  getEducatorDashboardData,
  getEnrolledStudentsData,
  updateRoleToEducator,
  updateEducatorDashboard, // <-- import the new controller
} from "../controllers/educatorController.js";
import upload, { handleMulterError } from "./../configs/multer.js";
import { protectEducator } from "./../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

// Update user role to educator
educatorRouter.post("/update-role-educator", updateRoleToEducator);

// Add a new course
educatorRouter.post(
  "/add-course",
  protectEducator,
  upload.single("image"),
  handleMulterError,
  AddCourse
);

// Get educator courses
educatorRouter.get("/get-courses", protectEducator, GetEducatorCourses);

// Delete a course
educatorRouter.delete(
  "/delete-course/:courseId",
  protectEducator,
  deleteCourse
);

// Get dashboard data
educatorRouter.get(
  "/dashboard-data",
  protectEducator,
  getEducatorDashboardData
);

// Update dashboard data (new route)
educatorRouter.post(
  "/update-dashboard",
  protectEducator,
  updateEducatorDashboard
);

// Get enrolled students
educatorRouter.get(
  "/enrolled-students",
  protectEducator,
  getEnrolledStudentsData
);

// Get educator info
// educatorRouter.get("/me", protectEducator, getEducatorInfo);

// Test endpoint for role update
educatorRouter.get("/test-update-role", async (req, res) => {
  try {
    const testUserId = "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V"; // Replace with your actual user ID
    req.auth = { userId: testUserId };
    return updateRoleToEducator(req, res);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default educatorRouter;
