import connectDB from "../configs/mongodb.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import Stripe from "stripe";
import mongoose from "mongoose";

// Initialize Stripe instance at module level (following best practices)
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const GetUserData = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    await connectDB();

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error fetching user data:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const GetUserEnrolledCourses = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    await connectDB();

    const user = await User.findById(userId)
      .populate({
        path: "enrolledCourses",
        select:
          "courseTitle courseDescription courseThumbnail coursePrice courseCategory courseContent educator",
        populate: {
          path: "educator",
          select: "username imageUrl",
        },
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const formattedCourses = (user.enrolledCourses || []).map((course) => ({
      _id: course._id,
      courseTitle: course.courseTitle,
      courseDescription: course.courseDescription,
      courseThumbnail: course.courseThumbnail,
      coursePrice: course.coursePrice,
      courseCategory: course.courseCategory,
      educator: course.educator,
      totalChapters: course.courseContent?.length || 0,
      totalLectures:
        course.courseContent?.reduce(
          (total, chapter) => total + (chapter.chapterContent?.length || 0),
          0
        ) || 0,
      courseContent: course.courseContent || [],
    }));

    return res.status(200).json({
      success: true,
      message: "User enrolled courses fetched successfully",
      courses: formattedCourses,
      totalEnrolledCourses: formattedCourses.length,
    });
  } catch (error) {
    console.error("❌ Error fetching user enrolled courses:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const EnrollInCourse = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { courseId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Valid Course ID is required",
      });
    }

    await connectDB();

    const course = await Course.findOne({ _id: courseId, isPublished: true });
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found or not published",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        error: "User is already enrolled in this course",
      });
    }

    await User.findByIdAndUpdate(userId, {
      $push: { enrolledCourses: courseId },
    });

    await Course.findByIdAndUpdate(courseId, {
      $push: { enrolledStudents: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      courseTitle: course.courseTitle,
    });
  } catch (error) {
    console.error("❌ Error enrolling in course:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const purchaseCourse = async (req, res) => {
  try {
    console.log("🔍 Request body:", req.body);
    console.log("🔍 Request headers:", req.headers);
    console.log("🔍 Content-Type:", req.headers["content-type"]);

    const { courseId } = req.body || {};
    const origin = req.headers.origin;
    const auth = req.auth();
    const userId = auth?.userId;

    const baseUrl = origin || "http://localhost:5173";

    console.log("🔍 Extracted values:", { courseId, userId, origin, baseUrl });

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Valid Course ID is required",
      });
    }

    await connectDB();

    const userData = await User.findById(userId);
    const courseData = await Course.findOne({
      _id: courseId,
      isPublished: true,
    });

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!courseData) {
      return res.status(404).json({
        success: false,
        error: "Course not found or not published",
      });
    }

    // Defensive check: fallback discount to 0
    const discount =
      typeof courseData.discount === "number" ? courseData.discount : 0;

    const discountedPrice = (
      courseData.coursePrice -
      (discount * courseData.coursePrice) / 100
    ).toFixed(2);

    const purchaseData = {
      userId,
      courseId: courseData._id,
      amount: parseFloat(discountedPrice),
      status: "pending",
      purchaseDate: new Date(),
    };

    const newPurchase = await Purchase.create(purchaseData);

    // Use the module-level stripeInstance
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: courseData.courseTitle,
              description: courseData.courseDescription,
              images: [courseData.courseThumbnail],
            },
            unit_amount: Math.round(parseFloat(newPurchase.amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        purchaseId: newPurchase._id.toString(),
        userId,
        courseId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment session created successfully",
      sessionId: session.id,
      sessionUrl: session.url,
      purchaseId: newPurchase._id,
    });
  } catch (error) {
    console.error("❌ Error purchasing course:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
