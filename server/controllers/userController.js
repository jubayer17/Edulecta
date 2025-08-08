import connectDB from "../configs/mongodb.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import Stripe from "stripe";
import mongoose from "mongoose";

// Initialize Stripe instance only when needed to ensure env vars are loaded
let stripeInstance = null;
const getStripeInstance = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

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

    // Use the getStripeInstance function to ensure env vars are loaded
    const session = await getStripeInstance().checkout.sessions.create({
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
      cancel_url: `${baseUrl}/cancel?session_id={CHECKOUT_SESSION_ID}`,
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

// Handle payment cancellation
export const cancelPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    // Retrieve the session from Stripe to get metadata
    const session = await getStripeInstance().checkout.sessions.retrieve(
      sessionId
    );

    if (!session.metadata?.purchaseId) {
      return res.status(400).json({
        success: false,
        error: "Purchase ID not found in session",
      });
    }

    // Update purchase status to failed
    const purchase = await Purchase.findByIdAndUpdate(
      session.metadata.purchaseId,
      {
        status: "failed",
        stripeSessionId: sessionId,
      },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    console.log(`🚫 Payment cancelled for purchase: ${purchase._id}`);

    return res.status(200).json({
      success: true,
      message: "Payment cancelled successfully",
      purchaseId: purchase._id,
      status: purchase.status,
    });
  } catch (error) {
    console.error("❌ Error cancelling payment:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    // Find purchase by Stripe session ID
    const purchase = await Purchase.findOne({ stripeSessionId: sessionId });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    return res.status(200).json({
      success: true,
      purchase: {
        id: purchase._id,
        status: purchase.status,
        amount: purchase.amount,
        paymentDate: purchase.paymentDate,
        purchaseDate: purchase.purchaseDate,
      },
    });
  } catch (error) {
    console.error("❌ Error getting payment status:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Manual payment completion for testing
export const manualCompletePayment = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        error: "Purchase ID is required",
      });
    }

    await connectDB();

    // Find and update the purchase
    const purchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      {
        status: "completed",
        paymentDate: new Date(),
      },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    // Enroll user in course
    const user = await User.findById(purchase.userId);
    if (user && !user.enrolledCourses.includes(purchase.courseId)) {
      user.enrolledCourses.push(purchase.courseId);
      await user.save();
      console.log(
        `✅ User ${purchase.userId} enrolled in course ${purchase.courseId}`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment manually completed",
      purchase: {
        id: purchase._id,
        status: purchase.status,
        amount: purchase.amount,
        paymentDate: purchase.paymentDate,
      },
    });
  } catch (error) {
    console.error("❌ Error manually completing payment:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get all purchases for debugging
export const getAllPurchases = async (req, res) => {
  try {
    await connectDB();

    const purchases = await Purchase.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("courseId", "courseTitle")
      .lean();

    return res.status(200).json({
      success: true,
      purchases: purchases,
      total: purchases.length,
    });
  } catch (error) {
    console.error("❌ Error getting purchases:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Test webhook simulation - for testing payment completion locally
export const simulateWebhook = async (req, res) => {
  try {
    const { sessionId, eventType = "payment_intent.succeeded" } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    await connectDB();

    console.log(
      `🧪 Simulating webhook: ${eventType} for session: ${sessionId}`
    );

    // Retrieve the session from Stripe to get metadata
    const session = await getStripeInstance().checkout.sessions.retrieve(
      sessionId
    );

    if (!session.metadata?.purchaseId) {
      return res.status(400).json({
        success: false,
        error: "Purchase ID not found in session metadata",
      });
    }

    const { purchaseId, userId, courseId } = session.metadata;
    console.log(
      `🔍 Processing purchase: ${purchaseId} for user: ${userId}, course: ${courseId}`
    );

    const purchaseData = await Purchase.findById(purchaseId);
    if (!purchaseData) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    if (eventType === "payment_intent.succeeded") {
      // Update purchase status
      purchaseData.status = "completed";
      purchaseData.stripeSessionId = sessionId;
      purchaseData.paymentDate = new Date();
      await purchaseData.save();

      console.log(`✅ Purchase ${purchaseId} marked as completed`);

      // Enroll user in course
      const userData = await User.findById(userId);
      const courseData = await Course.findById(courseId);

      if (userData && courseData) {
        if (!userData.enrolledCourses.includes(courseData._id)) {
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
          console.log(
            `✅ User ${userData._id} enrolled in course ${courseData._id}`
          );
        } else {
          console.log(
            `ℹ️ User ${userData._id} already enrolled in course ${courseData._id}`
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: "Payment simulated successfully",
        purchase: {
          id: purchaseData._id,
          status: purchaseData.status,
          paymentDate: purchaseData.paymentDate,
        },
        enrolled: true,
      });
    } else {
      // Handle other event types (failed, canceled, etc.)
      purchaseData.status = eventType.includes("failed")
        ? "failed"
        : "canceled";
      purchaseData.stripeSessionId = sessionId;
      await purchaseData.save();

      return res.status(200).json({
        success: true,
        message: `Payment ${purchaseData.status} simulated successfully`,
        purchase: {
          id: purchaseData._id,
          status: purchaseData.status,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error simulating webhook:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Test with dummy data - creates a dummy purchase and tests completion
export const testWithDummyData = async (req, res) => {
  try {
    await connectDB();

    console.log("🧪 Creating dummy test data...");

    // Create a dummy purchase with a fake session ID
    const dummySessionId = "cs_test_dummy_" + Date.now();
    const dummyPurchaseId = new mongoose.Types.ObjectId();
    const dummyUserId = "user_dummy_test_123";
    const dummyCourseId = new mongoose.Types.ObjectId();

    // Check if we have an actual course in the database
    const existingCourse = await Course.findOne({});
    const courseIdToUse = existingCourse ? existingCourse._id : dummyCourseId;

    // Check if we have an actual user in the database
    const existingUser = await User.findOne({});
    const userIdToUse = existingUser ? existingUser._id : dummyUserId;

    console.log(
      `📝 Using Course ID: ${courseIdToUse}, User ID: ${userIdToUse}`
    );

    // Create dummy purchase
    const dummyPurchase = await Purchase.create({
      _id: dummyPurchaseId,
      userId: userIdToUse,
      courseId: courseIdToUse,
      amount: 99.99,
      status: "pending",
      purchaseDate: new Date(),
    });

    console.log(`✅ Created dummy purchase: ${dummyPurchase._id}`);

    // Simulate webhook completion without calling Stripe
    console.log("🧪 Simulating payment completion...");

    // Update purchase status to completed
    dummyPurchase.status = "completed";
    dummyPurchase.stripeSessionId = dummySessionId;
    dummyPurchase.paymentDate = new Date();
    await dummyPurchase.save();

    console.log(`✅ Purchase ${dummyPurchase._id} marked as completed`);

    // If using real user/course, enroll the user
    if (existingUser && existingCourse) {
      const userData = await User.findById(userIdToUse);
      if (userData && !userData.enrolledCourses.includes(courseIdToUse)) {
        userData.enrolledCourses.push(courseIdToUse);
        await userData.save();
        console.log(
          `✅ User ${userIdToUse} enrolled in course ${courseIdToUse}`
        );
      } else if (userData) {
        console.log(
          `ℹ️ User ${userIdToUse} already enrolled in course ${courseIdToUse}`
        );
      }
    }

    // Verify the change
    const updatedPurchase = await Purchase.findById(dummyPurchase._id);

    return res.status(200).json({
      success: true,
      message: "Dummy data test completed successfully!",
      test_results: {
        dummy_purchase: {
          id: updatedPurchase._id,
          status: updatedPurchase.status,
          amount: updatedPurchase.amount,
          payment_date: updatedPurchase.paymentDate,
          stripe_session_id: updatedPurchase.stripeSessionId,
        },
        status_change:
          updatedPurchase.status === "completed" ? "✅ SUCCESS" : "❌ FAILED",
        user_enrolled: existingUser ? "✅ ENROLLED" : "ℹ️ DUMMY USER",
        course_exists: existingCourse ? "✅ REAL COURSE" : "ℹ️ DUMMY COURSE",
      },
      next_steps: [
        "✅ Database update working correctly",
        "✅ Status change from pending to completed works",
        "🔧 Now test with real Stripe session using simulate-webhook endpoint",
      ],
    });
  } catch (error) {
    console.error("❌ Error testing with dummy data:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
      stack: error.stack,
    });
  }
};
