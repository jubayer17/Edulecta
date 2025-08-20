import connectDB from "../configs/mongodb.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import Stripe from "stripe";
import mongoose from "mongoose";
import CourseProgress from "../models/CourseProgress.js";

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

    // 1️⃣ Try to find existing user
    let user = await User.findById(userId).select("-password");

    // 2️⃣ If not found, fetch from Clerk and create user
    if (!user) {
      console.warn(
        "User not found in database, attempting to fetch from Clerk:",
        userId
      );

      try {
        // Import Clerk client
        const { clerkClient } = await import("@clerk/express");

        // Fetch user data from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);
        console.log("🔍 Clerk user data:", JSON.stringify(clerkUser, null, 2));

        // Create comprehensive user data from Clerk
        const newUserData = {
          _id: userId,
          username: (() => {
            // Enhanced username extraction
            if (
              clerkUser.username &&
              clerkUser.username !== "null" &&
              clerkUser.username.trim() !== ""
            ) {
              return clerkUser.username.trim();
            }

            const firstName =
              clerkUser.firstName && clerkUser.firstName !== "null"
                ? clerkUser.firstName.trim()
                : "";
            const lastName =
              clerkUser.lastName && clerkUser.lastName !== "null"
                ? clerkUser.lastName.trim()
                : "";
            const fullName = `${firstName} ${lastName}`.trim();

            if (fullName && fullName !== "") {
              return fullName;
            }

            // Try external accounts for Google/OAuth data
            if (
              clerkUser.externalAccounts &&
              Array.isArray(clerkUser.externalAccounts)
            ) {
              for (const account of clerkUser.externalAccounts) {
                if (account.provider === "oauth_google") {
                  const googleFirstName = account.firstName || "";
                  const googleLastName = account.lastName || "";
                  const googleFullName =
                    `${googleFirstName} ${googleLastName}`.trim();
                  if (googleFullName) return googleFullName;

                  // Try email username from Google account
                  if (account.emailAddress) {
                    const emailUsername = account.emailAddress.split("@")[0];
                    const cleanUsername = emailUsername
                      .replace(/[^a-zA-Z]/g, " ")
                      .trim();
                    if (cleanUsername && cleanUsername.length > 2) {
                      return (
                        cleanUsername.charAt(0).toUpperCase() +
                        cleanUsername.slice(1)
                      );
                    }
                    return emailUsername;
                  }
                }
              }
            }

            // Try primary email address
            const primaryEmail =
              clerkUser.emailAddresses?.find(
                (e) => e.id === clerkUser.primaryEmailAddressId
              )?.emailAddress ||
              clerkUser.emailAddresses?.[0]?.emailAddress ||
              "";

            if (primaryEmail) {
              const emailUsername = primaryEmail.split("@")[0];
              const cleanUsername = emailUsername
                .replace(/[^a-zA-Z]/g, " ")
                .trim();
              if (cleanUsername && cleanUsername.length > 2) {
                return (
                  cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)
                );
              }
              return emailUsername;
            }

            return `User ${userId.slice(-6)}`;
          })(),

          email: (() => {
            // Get primary email
            const primaryEmail = clerkUser.emailAddresses?.find(
              (e) => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress;
            if (primaryEmail) return primaryEmail;

            // Fallback to first email
            const firstEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
            if (firstEmail) return firstEmail;

            // Try external accounts
            if (
              clerkUser.externalAccounts &&
              Array.isArray(clerkUser.externalAccounts)
            ) {
              for (const account of clerkUser.externalAccounts) {
                if (
                  account.provider === "oauth_google" &&
                  account.emailAddress
                ) {
                  return account.emailAddress;
                }
              }
            }

            return `${userId}@edulecta.local`;
          })(),

          password: "clerk_managed",

          imageUrl: (() => {
            if (clerkUser.imageUrl && clerkUser.imageUrl !== "")
              return clerkUser.imageUrl;
            if (clerkUser.profileImageUrl && clerkUser.profileImageUrl !== "")
              return clerkUser.profileImageUrl;

            // Check external accounts for profile image
            if (
              clerkUser.externalAccounts &&
              Array.isArray(clerkUser.externalAccounts)
            ) {
              for (const account of clerkUser.externalAccounts) {
                if (account.provider === "oauth_google" && account.picture) {
                  return account.picture;
                }
              }
            }

            return "https://via.placeholder.com/150?text=User";
          })(),

          enrolledCourses: [],
          isEducator: clerkUser.publicMetadata?.role === "educator" || false,
          createdAt: clerkUser.createdAt
            ? new Date(clerkUser.createdAt)
            : new Date(),
          timestamp: new Date(),
        };

        console.log(
          "📝 Creating user from Clerk data:",
          JSON.stringify(newUserData, null, 2)
        );
        user = new User(newUserData);
        await user.save();
        console.log("✅ User created from Clerk data:", user._id);
        console.log("📧 Email:", user.email);
        console.log("👤 Username:", user.username);
      } catch (clerkError) {
        console.error("❌ Failed to fetch from Clerk:", clerkError.message);

        // Create minimal fallback user
        const fallbackUserData = {
          _id: userId,
          username: `User ${userId.slice(-6)}`,
          email: `${userId}@edulecta.local`,
          password: "clerk_managed",
          imageUrl: "https://via.placeholder.com/150?text=User",
          enrolledCourses: [],
          isEducator: false,
          createdAt: new Date(),
          timestamp: new Date(),
        };

        console.log(
          "📝 Creating fallback user:",
          JSON.stringify(fallbackUserData, null, 2)
        );
        user = new User(fallbackUserData);
        await user.save();
        console.log("✅ Fallback user created:", user._id);
      }
    } else {
      console.log(
        "✅ Found existing user:",
        user._id,
        user.username,
        user.email
      );
    }

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
        enrolledCourses: user.enrolledCourses,
        isEducator: user.isEducator,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching/creating user:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
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
          "courseTitle createdAt courseDescription courseThumbnail coursePrice courseCategory courseContent educator",
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
    const { courseId } = req.body || {};
    const auth = req.auth();
    const userId = auth?.userId;

    const origin = req.headers.origin;
    const baseUrl =
      process.env.CLIENT_BASE_URL || origin || "http://localhost:5173";

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
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const courseData = await Course.findOne({
      _id: courseId,
      isPublished: true,
    });
    if (!courseData) {
      return res.status(404).json({
        success: false,
        error: "Course not found or not published",
      });
    }

    // Check for any existing pending/incomplete purchases
    const existingPurchase = await Purchase.findOne({
      userId,
      courseId,
      status: { $in: ["pending", "incomplete"] },
    });

    // If there's an existing purchase with a valid session, return that session
    if (existingPurchase?.stripeSessionId) {
      try {
        const stripe = getStripeInstance();
        const existingSession = await stripe.checkout.sessions.retrieve(
          existingPurchase.stripeSessionId
        );

        if (
          existingSession.status === "open" ||
          existingSession.status === "incomplete"
        ) {
          return res.status(200).json({
            success: true,
            message: "Returning existing payment session",
            sessionId: existingSession.id,
            sessionUrl: existingSession.url,
            purchaseId: existingPurchase._id,
          });
        }
      } catch (stripeError) {
        // If session retrieval fails, we'll create a new one below
        console.error("Failed to retrieve existing session:", stripeError);
      }
    }

    // Calculate discounted price
    const discount =
      typeof courseData.discount === "number" ? courseData.discount : 0;

    const discountedPrice =
      Math.round(
        (courseData.coursePrice - (discount * courseData.coursePrice) / 100) *
          100
      ) / 100;

    // Create or update purchase record
    const timestamp = Date.now();
    const purchaseData = {
      userId,
      courseId: courseData._id,
      amount: discountedPrice,
      status: "pending",
      purchaseDate: new Date(),
      lastUpdated: new Date(),
    };

    const purchase = existingPurchase || (await Purchase.create(purchaseData));

    // Create new Stripe session
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: courseData.courseTitle,
              description: courseData.courseDescription || "Course purchase",
              images: courseData.courseThumbnail
                ? [courseData.courseThumbnail]
                : undefined,
            },
            unit_amount: Math.round(purchase.amount * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/my-enrollments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/my-enrollments?canceled=true`,
      customer_email: userData.email, // Pre-fill customer email if available
      metadata: {
        purchaseId: purchase._id.toString(),
        userId: userId.toString(),
        courseId: courseId.toString(),
        timestamp: timestamp.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // Session expires in 30 minutes
    });

    // Update purchase with new session ID
    purchase.stripeSessionId = session.id;
    purchase.lastUpdated = new Date();
    await purchase.save();

    console.log(
      `Created Stripe session ${session.id} for purchase ${purchase._id}`
    );

    return res.status(200).json({
      success: true,
      message: "Payment session created successfully",
      sessionId: session.id,
      sessionUrl: session.url,
      purchaseId: purchase._id,
    });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Purchase multiple courses (cart checkout)
export const purchaseCartCourses = async (req, res) => {
  try {
    const { courseIds } = req.body || {};
    const auth = req.auth();
    const userId = auth?.userId;

    const origin = req.headers.origin;
    const baseUrl =
      process.env.CLIENT_BASE_URL || origin || "http://localhost:5173";

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Valid Course IDs array is required",
      });
    }

    // Validate all course IDs
    const invalidIds = courseIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid course ID format: ${invalidIds.join(", ")}`,
      });
    }

    await connectDB();

    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Fetch all courses
    const coursesData = await Course.find({
      _id: { $in: courseIds },
      isPublished: true,
    });

    if (coursesData.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No valid published courses found",
      });
    }

    if (coursesData.length !== courseIds.length) {
      const foundIds = coursesData.map((c) => c._id.toString());
      const missingIds = courseIds.filter((id) => !foundIds.includes(id));
      return res.status(404).json({
        success: false,
        error: `Some courses not found or not published: ${missingIds.join(
          ", "
        )}`,
      });
    }

    // Create purchase records for each course
    const timestamp = Date.now();
    const purchasePromises = coursesData.map(async (courseData) => {
      // Check for existing pending purchase
      const existingPurchase = await Purchase.findOne({
        userId,
        courseId: courseData._id,
        status: { $in: ["pending", "incomplete"] },
      });

      if (existingPurchase) {
        return existingPurchase;
      }

      // Calculate discounted price
      const discount =
        typeof courseData.discount === "number" ? courseData.discount : 0;
      const discountedPrice =
        Math.round(
          (courseData.coursePrice - (discount * courseData.coursePrice) / 100) *
            100
        ) / 100;

      const purchaseData = {
        userId,
        courseId: courseData._id,
        amount: discountedPrice,
        status: "pending",
        purchaseDate: new Date(),
        lastUpdated: new Date(),
      };

      return await Purchase.create(purchaseData);
    });

    const purchases = await Promise.all(purchasePromises);

    // Calculate total amount
    const totalAmount = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    // Create Stripe line items
    const lineItems = coursesData.map((courseData, index) => {
      const purchase = purchases[index];
      return {
        price_data: {
          currency: "USD",
          product_data: {
            name: courseData.courseTitle,
            description: courseData.courseDescription || "Course purchase",
            images: courseData.courseThumbnail
              ? [courseData.courseThumbnail]
              : undefined,
          },
          unit_amount: Math.round(purchase.amount * 100), // Stripe expects amount in cents
        },
        quantity: 1,
      };
    });

    // Create Stripe session
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/my-enrollments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart?canceled=true`,
      customer_email: userData.email,
      metadata: {
        purchaseIds: purchases.map((p) => p._id.toString()).join(","),
        userId: userId.toString(),
        courseIds: courseIds.join(","),
        timestamp: timestamp.toString(),
        isCartPurchase: "true",
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // Session expires in 30 minutes
    });

    // Update all purchases with session ID
    await Promise.all(
      purchases.map(async (purchase) => {
        purchase.stripeSessionId = session.id;
        purchase.lastUpdated = new Date();
        await purchase.save();
      })
    );

    console.log(
      `Created Stripe session ${session.id} for cart purchase with ${purchases.length} courses`
    );

    return res.status(200).json({
      success: true,
      message: "Cart payment session created successfully",
      sessionId: session.id,
      sessionUrl: session.url,
      totalAmount,
      courseCount: coursesData.length,
      purchaseIds: purchases.map((p) => p._id),
    });
  } catch (error) {
    console.error("Error creating cart purchase:", error);
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
    const auth = req.auth();
    const userId = auth?.userId;
    const { purchaseId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        error: "Purchase ID is required",
      });
    }

    await connectDB();

    // Find the purchase
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    // Verify user owns this purchase
    if (purchase.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to cancel this purchase",
      });
    }

    // Only allow cancellation of pending/incomplete/failed purchases
    if (!["pending", "incomplete", "failed"].includes(purchase.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel purchase with status: ${purchase.status}`,
      });
    }

    // If there's a Stripe session, try to retrieve and expire it
    if (purchase.stripeSessionId) {
      const stripe = getStripeInstance();
      try {
        // First try to retrieve the session to make sure it exists
        const session = await stripe.checkout.sessions.retrieve(
          purchase.stripeSessionId
        );

        if (session.status === "open" || session.status === "incomplete") {
          // Only expire if the session is still active
          await stripe.checkout.sessions.expire(purchase.stripeSessionId);
          console.log(
            `✅ Successfully expired Stripe session: ${purchase.stripeSessionId}`
          );
        } else {
          console.log(
            `ℹ️ Session ${purchase.stripeSessionId} already ${session.status}`
          );
        }
      } catch (stripeError) {
        if (stripeError.code === "resource_missing") {
          console.log(
            `ℹ️ Stripe session ${purchase.stripeSessionId} not found`
          );
        } else {
          console.error("❌ Error handling Stripe session:", stripeError);
        }
        // Continue even if Stripe session handling fails
      }
    }

    // Update purchase record
    purchase.status = "cancelled";
    purchase.lastUpdated = new Date();
    purchase.stripeSessionId = null; // Clear the session ID since it's no longer valid
    await purchase.save();

    console.log(`🚫 Payment cancelled for purchase: ${purchase._id}`);

    return res.status(200).json({
      success: true,
      message: "Purchase cancelled successfully",
      purchaseId: purchase._id,
      status: purchase.status,
    });
  } catch (error) {
    console.error("❌ Error cancelling payment:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get payment status and auto-complete if successful
export const getPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    await connectDB();

    // Get session from Stripe to check status
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log(
      `🔍 Payment status check for session: ${sessionId}, status: ${session.payment_status}`
    );

    // If payment is successful, complete the purchase(s)
    if (session.payment_status === "paid") {
      // Check if this is a cart purchase or single course purchase
      const isCartPurchase = session.metadata?.isCartPurchase === "true";

      if (isCartPurchase) {
        console.log("🛒 Completing cart purchase enrollment");

        if (
          !session.metadata?.purchaseIds ||
          !session.metadata?.userId ||
          !session.metadata?.courseIds
        ) {
          console.error("❌ Missing cart purchase metadata");
          return res.status(400).json({
            success: false,
            error: "Cart purchase metadata missing",
          });
        }

        const { purchaseIds, userId, courseIds } = session.metadata;
        const purchaseIdArray = purchaseIds.split(",");
        const courseIdArray = courseIds.split(",");

        console.log(`🔍 Cart purchase - userId: ${userId}`);
        console.log(`🔍 Cart purchase - purchaseIds: ${purchaseIds}`);
        console.log(`🔍 Cart purchase - courseIds: ${courseIds}`);

        // Update all purchase records
        for (const purchaseId of purchaseIdArray) {
          const purchaseData = await Purchase.findById(purchaseId);
          if (purchaseData && purchaseData.status !== "completed") {
            purchaseData.status = "completed";
            purchaseData.stripeSessionId = sessionId;
            purchaseData.paymentDate = new Date();
            await purchaseData.save();
            console.log(`✅ Updated purchase ${purchaseId} to completed`);
          }
        }

        // Enroll user in all courses
        const userData = await User.findById(userId);
        if (userData) {
          for (const courseId of courseIdArray) {
            const courseData = await Course.findById(courseId);
            if (courseData) {
              // Check if user is not already enrolled
              const isUserEnrolled = userData.enrolledCourses.some(
                (enrolledCourseId) =>
                  enrolledCourseId.toString() === courseData._id.toString()
              );

              if (!isUserEnrolled) {
                userData.enrolledCourses.push(courseData._id);
                console.log(
                  `✅ Added course ${courseData._id} to user ${userData._id} enrolledCourses`
                );
              }

              // Check if course doesn't already have this student
              const isStudentInCourse = courseData.enrolledStudents.includes(
                userData._id
              );
              if (!isStudentInCourse) {
                const userIdString = String(userData._id);
                courseData.enrolledStudents.push(userIdString);
                courseData.markModified("enrolledStudents");
                await courseData.save();
                console.log(
                  `✅ Added user ${userIdString} to course ${courseData._id} enrolledStudents`
                );
              }
            }
          }

          // Save user data after adding all courses
          await userData.save();
          console.log(
            `✅ Cart purchase completed for user ${userId} with ${courseIdArray.length} courses`
          );
        }

        return res.status(200).json({
          success: true,
          message: "Cart purchase completed successfully",
          coursesEnrolled: courseIdArray.length,
          purchases: purchaseIdArray,
        });
      } else {
        // Handle single course purchase
        console.log("📚 Completing single course purchase enrollment");

        const purchase = await Purchase.findOne({ stripeSessionId: sessionId });
        if (purchase && purchase.status !== "completed") {
          purchase.status = "completed";
          purchase.paymentDate = new Date();
          await purchase.save();

          const user = await User.findById(purchase.userId);
          const course = await Course.findById(purchase.courseId);

          if (user && course) {
            // Check if user is not already enrolled
            const isUserEnrolled = user.enrolledCourses.some(
              (enrolledCourseId) =>
                enrolledCourseId.toString() === course._id.toString()
            );

            if (!isUserEnrolled) {
              user.enrolledCourses.push(course._id);
              await user.save();
              console.log(
                `✅ User ${purchase.userId} enrolled in course ${purchase.courseId}`
              );
            }

            // Check if course doesn't already have this student
            if (!course.enrolledStudents.includes(user._id)) {
              const userIdString = String(user._id);
              course.enrolledStudents.push(userIdString);
              course.markModified("enrolledStudents");
              await course.save();
              console.log(
                `✅ Added user ${userIdString} to course ${course._id} enrolledStudents`
              );
            }
          }
        }

        return res.status(200).json({
          success: true,
          message: "Single course purchase completed successfully",
          purchase: {
            id: purchase._id,
            status: purchase.status,
            amount: purchase.amount,
            paymentDate: purchase.paymentDate,
            purchaseDate: purchase.purchaseDate,
          },
        });
      }
    } else {
      // Payment not completed yet
      return res.status(200).json({
        success: false,
        message: "Payment not completed yet",
        paymentStatus: session.payment_status,
        sessionStatus: session.status,
      });
    }
  } catch (error) {
    console.error("❌ Error getting/completing payment status:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Retry a failed or pending payment
export const retryPayment = async (req, res) => {
  try {
    // 1. Authentication & Input Validation
    const { purchaseId } = req.params;
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      console.log("❌ Authentication required");
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    if (!purchaseId || !mongoose.Types.ObjectId.isValid(purchaseId)) {
      console.log("❌ Invalid purchase ID:", purchaseId);
      return res.status(400).json({
        success: false,
        error: "Valid purchase ID is required",
      });
    }

    // 2. Database Connection
    console.log("📡 Connecting to database...");
    await connectDB();

    // 3. Find and Validate Purchase
    console.log(`🔍 Finding purchase: ${purchaseId}`);
    const purchase = await Purchase.findById(purchaseId)
      .populate("courseId")
      .populate("userId");

    if (!purchase) {
      console.log("❌ Purchase not found");
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    // 4. Authorization Check
    if (purchase.userId._id.toString() !== userId) {
      console.log(
        `❌ Unauthorized: User ${userId} attempted to access purchase ${purchaseId}`
      );
      return res.status(403).json({
        success: false,
        error: "Not authorized to retry this payment",
      });
    }

    // 5. Status Validation
    if (
      !["pending", "failed", "incomplete", "expired"].includes(purchase.status)
    ) {
      console.log(`❌ Invalid status for retry: ${purchase.status}`);
      return res.status(400).json({
        success: false,
        error: `Cannot retry payment with status: ${purchase.status}`,
      });
    }

    // 6. Course Validation
    if (!purchase.courseId) {
      console.log("❌ Course data missing from purchase");
      return res.status(400).json({
        success: false,
        error: "Course information not found",
      });
    }

    // 7. Handle Existing Session
    if (purchase.stripeSessionId) {
      try {
        console.log(
          `🔄 Attempting to expire old session: ${purchase.stripeSessionId}`
        );
        const stripe = getStripeInstance();
        await stripe.checkout.sessions.expire(purchase.stripeSessionId);
        console.log("✅ Old session expired successfully");
      } catch (error) {
        if (error.code === "resource_missing") {
          console.log("ℹ️ Old session not found, continuing...");
        } else {
          console.error("⚠️ Error expiring old session:", error);
        }
      }
    }

    // 8. Create New Session
    console.log("🔄 Creating new Stripe session...");
    const origin = req.headers.origin;
    const baseUrl =
      process.env.CLIENT_BASE_URL || origin || "http://localhost:5173";
    const timestamp = Date.now();

    const stripe = getStripeInstance();

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: purchase.courseId.courseTitle,
                description:
                  purchase.courseId.courseDescription || "Course purchase",
                images: purchase.courseId.courseThumbnail
                  ? [purchase.courseId.courseThumbnail]
                  : undefined,
              },
              unit_amount: Math.round(purchase.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/my-enrollments?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/my-enrollments?canceled=true`,
        customer_email: purchase.userId.email,
        metadata: {
          purchaseId: purchase._id.toString(),
          userId: userId.toString(),
          courseId: purchase.courseId._id.toString(),
          timestamp: timestamp.toString(),
        },
        expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
      });

      // 9. Update Purchase Record
      purchase.stripeSessionId = session.id;
      purchase.lastUpdated = new Date();
      purchase.status = "pending";
      await purchase.save();

      console.log(
        `✅ Created new Stripe session ${session.id} for purchase ${purchase._id}`
      );

      return res.status(200).json({
        success: true,
        message: "New payment session created successfully",
        sessionId: session.id,
        sessionUrl: session.url,
      });
    } catch (stripeError) {
      console.error("❌ Stripe error:", stripeError);
      return res.status(400).json({
        success: false,
        error: stripeError.message || "Failed to create payment session",
      });
    }
  } catch (error) {
    console.error("❌ Error retrying payment:", error);
    // Check if it's a Stripe error
    if (error.type && error.type.startsWith("Stripe")) {
      return res.status(400).json({
        success: false,
        error: "Payment service error",
        message: error.message,
      });
    }
    // Generic error handler
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred. Please try again later.",
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
    const course = await Course.findById(purchase.courseId);

    if (user && course) {
      // Check if user is not already enrolled
      const isUserEnrolled = user.enrolledCourses.some(
        (enrolledCourseId) =>
          enrolledCourseId.toString() === course._id.toString()
      );

      if (!isUserEnrolled) {
        user.enrolledCourses.push(course._id);
        await user.save();
        console.log(
          `✅ User ${purchase.userId} enrolled in course ${purchase.courseId}`
        );
      }

      // Check if course doesn't already have this student
      if (!course.enrolledStudents.includes(user._id)) {
        // Ensure we're pushing the correct string type
        const userIdString = String(user._id);
        course.enrolledStudents.push(userIdString);

        console.log(
          `🔍 Debug - pushing userIdString: ${userIdString} to course ${course._id}`
        );
        console.log(
          `🔍 Debug - enrolledStudents before save: ${JSON.stringify(
            course.enrolledStudents
          )}`
        );

        // Force mark the field as modified to ensure Mongoose saves it
        course.markModified("enrolledStudents");
        await course.save();

        console.log(
          `✅ Added user ${userIdString} to course ${course._id} enrolledStudents`
        );

        // Verify the save worked
        const verifyCourse = await Course.findById(course._id);
        console.log(
          `🔍 Verification - course enrolledStudents after save: ${JSON.stringify(
            verifyCourse.enrolledStudents
          )}`
        );
      }
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
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    await connectDB();

    // Get purchases for the authenticated user only
    const purchases = await Purchase.find({ userId })
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

// Test single course webhook simulation - for testing single course payment completion locally
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
      `🧪 Simulating single course webhook: ${eventType} for session: ${sessionId}`
    );

    // Retrieve the session from Stripe to get metadata
    const session = await getStripeInstance().checkout.sessions.retrieve(
      sessionId
    );

    // Check if this is a single course purchase (not cart)
    const isCartPurchase = session.metadata?.isCartPurchase === "true";

    if (isCartPurchase) {
      return res.status(400).json({
        success: false,
        error: "This is a cart purchase session, use /simulate-cart-webhook instead",
      });
    }

    if (
      !session.metadata?.purchaseId ||
      !session.metadata?.userId ||
      !session.metadata?.courseId
    ) {
      return res.status(400).json({
        success: false,
        error: "Single course purchase metadata not found in session",
      });
    }

    const { purchaseId, userId, courseId } = session.metadata;

    console.log(
      `🔍 Processing single course purchase: ${purchaseId} for user: ${userId}, course: ${courseId}`
    );

    if (eventType === "payment_intent.succeeded") {
      // Update purchase record
      const purchaseData = await Purchase.findById(purchaseId);
      if (purchaseData) {
        purchaseData.status = "completed";
        purchaseData.stripeSessionId = sessionId;
        purchaseData.paymentDate = new Date();
        await purchaseData.save();
        console.log(`✅ Purchase ${purchaseId} marked as completed`);
      }

      // Enroll user in course
      const userData = await User.findById(userId);
      const courseData = await Course.findById(courseId);

      if (userData && courseData) {
        // Check if user is not already enrolled
        const isUserEnrolled = userData.enrolledCourses.some(
          (enrolledCourseId) =>
            enrolledCourseId.toString() === courseData._id.toString()
        );

        if (!isUserEnrolled) {
          userData.enrolledCourses.push(courseData._id);
          console.log(`✅ Added course ${courseData._id} to user ${userData._id} enrolledCourses`);
        }

        // Check if course doesn't already have this student
        if (!courseData.enrolledStudents.includes(userData._id)) {
          const userIdString = String(userData._id);
          courseData.enrolledStudents.push(userIdString);
          courseData.markModified("enrolledStudents");
          await courseData.save();
          console.log(`✅ Added user ${userIdString} to course ${courseData._id} enrolledStudents`);
        }

        // Save user data
        await userData.save();
        console.log(`✅ Single course purchase completed for user ${userId}`);
      }

      return res.status(200).json({
        success: true,
        message: "Single course webhook simulation completed successfully",
        purchase: {
          id: purchaseId,
          userId,
          courseId,
          status: "completed"
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        error: `Event type ${eventType} not supported for simulation`,
      });
    }
  } catch (error) {
    console.error("❌ Error simulating single course webhook:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Test cart webhook simulation - for testing cart payment completion locally
export const simulateCartWebhook = async (req, res) => {
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
      `🧪 Simulating cart webhook: ${eventType} for session: ${sessionId}`
    );

    // Retrieve the session from Stripe to get metadata
    const session = await getStripeInstance().checkout.sessions.retrieve(
      sessionId
    );

    // Check if this is a cart purchase
    const isCartPurchase = session.metadata?.isCartPurchase === "true";

    if (!isCartPurchase) {
      return res.status(400).json({
        success: false,
        error: "This is not a cart purchase session",
      });
    }

    if (
      !session.metadata?.purchaseIds ||
      !session.metadata?.userId ||
      !session.metadata?.courseIds
    ) {
      return res.status(400).json({
        success: false,
        error: "Cart purchase metadata not found in session",
      });
    }

    const { purchaseIds, userId, courseIds } = session.metadata;
    const purchaseIdArray = purchaseIds.split(",");
    const courseIdArray = courseIds.split(",");

    console.log(
      `🔍 Processing cart purchase: ${purchaseIds} for user: ${userId}, courses: ${courseIds}`
    );

    if (eventType === "payment_intent.succeeded") {
      // Update all purchase records
      for (const purchaseId of purchaseIdArray) {
        const purchaseData = await Purchase.findById(purchaseId);
        if (purchaseData) {
          purchaseData.status = "completed";
          purchaseData.stripeSessionId = sessionId;
          purchaseData.paymentDate = new Date();
          await purchaseData.save();
          console.log(`✅ Purchase ${purchaseId} marked as completed`);
        }
      }

      // Enroll user in all courses
      const userData = await User.findById(userId);
      if (userData) {
        for (const courseId of courseIdArray) {
          const courseData = await Course.findById(courseId);
          if (courseData) {
            // Check if user is not already enrolled
            const isUserEnrolled = userData.enrolledCourses.some(
              (enrolledCourseId) =>
                enrolledCourseId.toString() === courseData._id.toString()
            );

            if (!isUserEnrolled) {
              userData.enrolledCourses.push(courseData._id);
              console.log(
                `✅ Added course ${courseData._id} to user ${userData._id} enrolledCourses`
              );
            } else {
              console.log(
                `ℹ️ User ${userData._id} already enrolled in course ${courseData._id}`
              );
            }

            // Check if course doesn't already have this student
            if (!courseData.enrolledStudents.includes(userData._id)) {
              const userIdString = String(userData._id);
              courseData.enrolledStudents.push(userIdString);
              courseData.markModified("enrolledStudents");
              await courseData.save();
              console.log(
                `✅ Added user ${userIdString} to course ${courseData._id} enrolledStudents`
              );
            }
          }
        }

        // Save user data after adding all courses
        await userData.save();
        console.log(
          `✅ Cart purchase completed for user ${userId} with ${courseIdArray.length} courses`
        );
      }

      return res.status(200).json({
        success: true,
        message: "Cart payment simulated successfully",
        enrollmentResults: {
          coursesEnrolled: courseIdArray.length,
          purchasesCompleted: purchaseIdArray.length,
        },
        enrolled: true,
      });
    } else {
      // Handle other event types (failed, canceled, etc.)
      for (const purchaseId of purchaseIdArray) {
        const purchaseData = await Purchase.findById(purchaseId);
        if (purchaseData) {
          purchaseData.status = eventType.includes("failed")
            ? "failed"
            : "canceled";
          purchaseData.stripeSessionId = sessionId;
          await purchaseData.save();
        }
      }

      return res.status(200).json({
        success: true,
        message: `Cart payment ${
          eventType.includes("failed") ? "failure" : "cancellation"
        } simulated successfully`,
        enrollmentResults: {
          purchasesAffected: purchaseIdArray.length,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error simulating cart webhook:", error.message);
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
      const courseData = await Course.findById(courseIdToUse);

      if (userData && courseData) {
        // Check if user is not already enrolled
        const isUserEnrolled = userData.enrolledCourses.some(
          (enrolledCourseId) =>
            enrolledCourseId.toString() === courseData._id.toString()
        );

        if (!isUserEnrolled) {
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
          console.log(
            `✅ User ${userIdToUse} enrolled in course ${courseIdToUse}`
          );
        } else {
          console.log(
            `ℹ️ User ${userIdToUse} already enrolled in course ${courseIdToUse}`
          );
        }

        // Check if course doesn't already have this student
        if (!courseData.enrolledStudents.includes(userData._id)) {
          // Ensure we're pushing the correct string type
          const userIdString = String(userData._id);
          courseData.enrolledStudents.push(userIdString);

          console.log(
            `🔍 Debug - pushing userIdString: ${userIdString} to course ${courseData._id}`
          );

          // Force mark the field as modified to ensure Mongoose saves it
          courseData.markModified("enrolledStudents");
          await courseData.save();

          console.log(
            `✅ Added user ${userIdString} to course ${courseData._id} enrolledStudents`
          );

          // Verify the save worked
          const verifyCourse = await Course.findById(courseData._id);
          console.log(
            `🔍 Verification - course enrolledStudents after save: ${JSON.stringify(
              verifyCourse.enrolledStudents
            )}`
          );
        }
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

//update user course progress

export const updateUserCourseProgress = async (req, res) => {
  try {
    if (!req.auth || !req.auth().userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.auth().userId;
    const { courseId, lectureId } = req.body;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing courseId" });
    }

    // Find existing progress for user + course
    let courseProgress = await CourseProgress.findOne({ userId, courseId });

    // If not found, create new progress document
    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        lectureCompleted: [],
        progress: 0,
        completed: false,
        lastAccessed: new Date(),
      });
      await courseProgress.save();
    }

    // If lectureId provided, update progress
    if (lectureId) {
      if (!courseProgress.lectureCompleted.includes(lectureId)) {
        courseProgress.lectureCompleted.push(lectureId);
        courseProgress.lastAccessed = new Date();

        // Optional: update progress percentage or completed status here
        // For example:
        // const totalLectures = 10; // get this from course data ideally
        // courseProgress.progress = Math.min(100, (courseProgress.lectureCompleted.length / totalLectures) * 100);
        // courseProgress.completed = courseProgress.progress === 100;

        await courseProgress.save();
      } else {
        return res.status(200).json({
          success: true,
          message: "Lecture already completed",
          data: courseProgress,
        });
      }
    }

    // Return progress whether updated or just fetched
    return res.status(200).json({
      success: true,
      message: "Course progress retrieved successfully",
      data: courseProgress,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get user course progress

export const getUserCourseProgress = async (req, res) => {
  try {
    if (!req.auth || !req.auth().userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.auth().userId;
    const { courseId } = req.body;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing courseId" });
    }

    let courseProgress = await CourseProgress.findOne({ userId, courseId });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureCompleted: [],
        progress: 0,
        lastAccessed: new Date(),
      });
      await courseProgress.save();
    }

    return res.status(200).json({
      success: true,
      message: "Course progress retrieved successfully",
      data: courseProgress,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add course rating
export const addCourseRating = async (req, res) => {
  try {
    if (!req.auth || !req.auth().userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.auth().userId;
    const { courseId, rating } = req.body;

    if (!courseId || !rating || !userId || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid courseId or rating" });
    }

    // Find the course and update the rating
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.status(404).json({
        success: false,
        message: "User has not purchased the course or user not found ",
      });
    }

    const existedRatingIndex = course.courseRatings.findIndex(
      (rating) => rating.user.toString() === userId.toString()
    );

    if (existedRatingIndex !== -1) {
      // Update the course rating
      course.courseRatings[existedRatingIndex].rating = rating;
    } else {
      // Add a new rating
      course.courseRatings.push({ user: userId, rating });
    }
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course rating added successfully",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending purchases count
export const getPendingPurchasesCount = async (req, res) => {
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

    // First, clean up old purchases automatically
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    // Mark old pending/incomplete purchases as expired
    await Purchase.updateMany(
      {
        userId,
        status: { $in: ["pending", "incomplete"] },
        createdAt: { $lt: oneDayAgo },
      },
      {
        $set: { status: "expired" },
      }
    );

    // Count only recent pending/incomplete purchases (within last 24 hours)
    const pendingCount = await Purchase.countDocuments({
      userId,
      status: { $in: ["pending", "incomplete"] },
      createdAt: { $gte: oneDayAgo },
    });

    // TEMPORARY FIX: Force count to be 1 if there are any pending purchases
    const actualCount = pendingCount > 0 ? 1 : 0;

    // For debugging - get the actual purchases to see what's there
    const actualPurchases = await Purchase.find({
      userId,
      status: {
        $in: ["pending", "incomplete", "failed", "cancelled", "expired"],
      },
    })
      .select("status courseId createdAt stripeSessionId")
      .lean();

    console.log(
      `🔍 Debug - User ${userId} has ${pendingCount} pending purchases (showing ${actualCount})`
    );
    console.log(`🔍 Debug - All user purchases:`, actualPurchases);

    return res.status(200).json({
      success: true,
      message: "Pending purchases count fetched successfully",
      count: actualCount, // Use the corrected count
      debug: {
        totalPurchases: actualPurchases.length,
        purchasesByStatus: actualPurchases.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {}),
        purchases: actualPurchases,
        rawCount: pendingCount,
        correctedCount: actualCount,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching pending purchases count:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Clean up old purchases (utility function)
export const cleanupOldPurchases = async (req, res) => {
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

    // Remove old failed, cancelled, and expired purchases older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deletedPurchases = await Purchase.deleteMany({
      userId,
      status: { $in: ["failed", "cancelled", "expired"] },
      createdAt: { $lt: sevenDaysAgo },
    });

    // Also clean up very old pending purchases (older than 24 hours) that are likely expired
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const expiredPending = await Purchase.updateMany(
      {
        userId,
        status: { $in: ["pending", "incomplete"] },
        createdAt: { $lt: oneDayAgo },
      },
      {
        $set: { status: "expired" },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Old purchases cleaned up successfully",
      deletedCount: deletedPurchases.deletedCount,
      expiredCount: expiredPending.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Error cleaning up old purchases:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Debug endpoint to see all purchases for a user
export const debugUserPurchases = async (req, res) => {
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

    // Get all purchases for this user
    const allPurchases = await Purchase.find({ userId })
      .select("status courseId createdAt stripeSessionId amount")
      .populate("courseId", "courseTitle")
      .sort({ createdAt: -1 })
      .lean();

    const purchasesByStatus = allPurchases.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentPending = allPurchases.filter(
      (p) =>
        ["pending", "incomplete"].includes(p.status) &&
        new Date(p.createdAt) >= oneDayAgo
    );

    return res.status(200).json({
      success: true,
      data: {
        totalPurchases: allPurchases.length,
        purchasesByStatus,
        recentPendingCount: recentPending.length,
        allPurchases: allPurchases.map((p) => ({
          ...p,
          courseTitle: p.courseId?.courseTitle || "Unknown Course",
          age:
            Math.round(
              (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60)
            ) + " hours",
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error debugging user purchases:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Add course to wishlist
export const addToWishlist = async (req, res) => {
  try {
    console.log("🔍 Add to wishlist request received");

    const auth = req.auth();
    const userId = auth?.userId;

    console.log("🔍 Auth object:", auth);
    console.log("🔍 User ID:", userId);

    if (!userId) {
      console.log("❌ No user ID found");
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    const { courseId } = req.body;
    console.log("📝 Request data:", { userId, courseId, body: req.body });
    console.log("📝 CourseId type:", typeof courseId);
    console.log("📝 CourseId value:", courseId);

    if (!courseId) {
      console.log("❌ No course ID provided");
      return res.status(400).json({
        success: false,
        error: "Course ID is required",
      });
    }

    // Validate ObjectId format for courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.log("❌ Invalid course ID format:", courseId);
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format",
      });
    }

    console.log("✅ CourseId validation passed");

    await connectDB();

    // Check if course exists
    console.log("🔍 Looking for course with ObjectId:", courseId);
    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    console.log("🔍 Converted to ObjectId:", courseObjectId);

    const course = await Course.findById(courseObjectId);
    if (!course) {
      console.log("❌ Course not found:", courseId);
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    console.log("✅ Course found:", course.courseTitle);
    console.log("✅ Course _id:", course._id);
    console.log("✅ Course _id type:", typeof course._id);

    // Find user and check if course is already in wishlist
    console.log("🔍 Looking for user:", userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("✅ User found:", user.username || user.email);
    console.log("🔍 Current wishlist:", user.wishlist);

    // Check if course is already in wishlist
    const isAlreadyInWishlist = user.wishlist.some(
      (item) => item.course && item.course.toString() === course._id.toString()
    );

    if (isAlreadyInWishlist) {
      console.log("⚠️ Course already in wishlist");
      return res.status(400).json({
        success: false,
        error: "Course is already in your wishlist",
      });
    }

    // Add course to wishlist using direct MongoDB update
    console.log("➕ Adding course to wishlist using findByIdAndUpdate");
    console.log("📝 User ID:", userId);
    console.log("📝 Course ID:", course._id);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          wishlist: {
            course: course._id,
            addedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log("❌ Failed to update user wishlist");
      return res.status(500).json({
        success: false,
        error: "Failed to update wishlist",
      });
    }

    console.log("✅ Wishlist updated successfully using direct update");
    console.log("📝 Updated wishlist:", updatedUser.wishlist);

    return res.status(200).json({
      success: true,
      message: "Course added to wishlist successfully",
    });
  } catch (error) {
    console.error("❌ Error adding to wishlist:", error.message);
    console.error("❌ Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Remove course from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: "Course ID is required",
      });
    }

    await connectDB();

    // Find user and remove course from wishlist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Remove course from wishlist
    user.wishlist = user.wishlist.filter(
      (item) => item.course && item.course.toString() !== courseId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Course removed from wishlist successfully",
    });
  } catch (error) {
    console.error("❌ Error removing from wishlist:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get user's wishlist
export const getUserWishlist = async (req, res) => {
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

    // Find user and populate wishlist courses
    const user = await User.findById(userId).populate({
      path: "wishlist.course",
      model: "Course",
      populate: {
        path: "educator",
        model: "User",
        select: "username email",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Filter out any wishlist items where the course no longer exists
    const validWishlistItems = user.wishlist.filter(
      (item) => item.course !== null
    );

    // Debug: Log the populated data
    console.log("📝 User wishlist found:", validWishlistItems.length, "items");
    if (validWishlistItems.length > 0) {
      console.log(
        "📝 First wishlist item:",
        JSON.stringify(validWishlistItems[0], null, 2)
      );
      console.log(
        "📝 First course educator:",
        validWishlistItems[0].course?.educator
      );
    }

    return res.status(200).json({
      success: true,
      wishlist: validWishlistItems,
    });
  } catch (error) {
    console.error("❌ Error getting wishlist:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
