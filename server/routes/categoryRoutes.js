import express from "express";
import {
  getAllCategories,
  addCategory,
  getCategoriesWithCourses,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protectEducator } from "../middlewares/authMiddleware.js";

const categoryRouter = express.Router();

// Get all categories (public route)
categoryRouter.get("/", getAllCategories);

// Get categories with course details (public route)
categoryRouter.get("/with-courses", getCategoriesWithCourses);

// Add new category (educator only)
categoryRouter.post("/add", protectEducator, addCategory);

// Delete category (educator only)
categoryRouter.delete("/:categoryId", protectEducator, deleteCategory);

export default categoryRouter;
