import mongoose from "mongoose";

const educatorSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  isEducator: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  // Courses published by the educator
  publishedCourses: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        default: 0,
      },
      enrolledStudents: [
        {
          studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          enrolledAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      totalEnrollments: {
        type: Number,
        default: 0,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
    },
  ],
  totalCourses: {
    type: Number,
    default: 0,
  },
  totalEnrollments: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: pre-save middleware to calculate totals automatically
educatorSchema.pre("save", function (next) {
  this.totalCourses = this.publishedCourses.length;
  this.totalEnrollments = this.publishedCourses.reduce(
    (acc, course) => acc + (course.totalEnrollments || 0),
    0
  );
  this.totalEarnings = this.publishedCourses.reduce(
    (acc, course) => acc + (course.totalEarnings || 0),
    0
  );
  next();
});

export default mongoose.model("Educator", educatorSchema);
