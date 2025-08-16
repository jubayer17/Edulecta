import mongoose from "mongoose";
const lectureSchema = new mongoose.Schema(
  {
    lectureId: {
      type: String,
      required: true,
    },
    lectureTitle: {
      type: String,
      required: true,
    },
    lectureOrder: {
      type: Number,
      required: true,
    },
    lectureUrl: {
      type: String,
      required: true,
    },
    lectureDuration: {
      type: Number,
      required: true,
    },
    isPreviewFree: {
      type: Boolean,
      default: false,
    },
    lectureResources: [
      {
        type: String,
      },
    ],
  },
  { _id: false, timestamps: true }
);
const chapterSchema = new mongoose.Schema(
  {
    chapterId: {
      type: String,
    },
    chapterOrder: {
      type: Number,
    },
    chapterTitle: {
      type: String,
      required: true,
    },
    chapterContent: [lectureSchema],
  },
  { _id: false, timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String, required: true },
    coursePrice: { type: Number, required: true },
    courseOfferPrice: { type: Number, required: true },
    courseCategory: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
    discount: { type: Number, required: true, min: 0, max: 100 },
    courseContent: [chapterSchema],
    courseRatings: [
      {
        user: {
          type: String,
          ref: "User",
          required: true,
        },
        rating: { type: Number, required: true, min: 1, max: 5 },
        //   comment: { type: String, required: true },
      },
    ],
    educator: {
      type: String,
      ref: "User",
      required: true,
    },
    enrolledStudents: [
      {
        type: String,
        ref: "User",
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    minimize: false, // Ensure all fields are saved
  }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
