import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: String, // since your user `_id` is a String
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
});

export default mongoose.model("Enrollment", enrollmentSchema);
