import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    courseId: {
      type: String,
      ref: "Course",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    lectureCompleted: {
      type: [String],
    },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false }
);

export default mongoose.model("CourseProgress", courseProgressSchema);
