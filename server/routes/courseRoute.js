import express from "express";
import {
  getAllCourse,
  getCourseById,
  updateCourse,
} from "../controllers/courseController.js";

const courseRouter = express.Router();

courseRouter.get("/all", getAllCourse);
courseRouter.get("/:id", getCourseById);
courseRouter.patch("/update", updateCourse);

export default courseRouter;
