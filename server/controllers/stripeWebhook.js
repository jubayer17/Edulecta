import Stripe from "stripe";
import connectDB from "../configs/mongodb.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

let stripeInstance = null;
const getStripeInstance = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY not set");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

const getEndpointSecret = () => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET not set");
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  console.log("🔔 Received Stripe webhook");

  if (!sig) {
    console.error("❌ No Stripe signature found in headers");
    return res.status(400).send("No Stripe signature found");
  }

  try {
    const endpointSecret = getEndpointSecret();
    event = getStripeInstance().webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
    console.log(`✅ Webhook verified. Event type: ${event.type}`);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await connectDB();
    console.log("✅ Connected to database");

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        try {
          const sessions = await getStripeInstance().checkout.sessions.list({
            payment_intent: paymentIntentId,
          });

          if (sessions.data.length === 0) {
            break;
          }

          const session = sessions.data[0];

          // Check if this is a cart purchase or single course purchase
          const isCartPurchase = session.metadata?.isCartPurchase === "true";

          if (isCartPurchase) {
            // Handle cart purchase with multiple courses
            console.log("🛒 Processing cart purchase completion");

            if (
              !session.metadata?.purchaseIds ||
              !session.metadata?.userId ||
              !session.metadata?.courseIds
            ) {
              console.error("❌ Missing cart purchase metadata");
              break;
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
              if (purchaseData) {
                purchaseData.status = "completed";
                purchaseData.stripeSessionId = session.id;
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
                  const isStudentInCourse =
                    courseData.enrolledStudents.includes(userData._id);
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
          } else {
            // Handle single course purchase (existing logic)
            if (!session.metadata?.purchaseId) {
              break;
            }

            const { purchaseId, userId, courseId } = session.metadata;

            const purchaseData = await Purchase.findById(purchaseId);
            if (!purchaseData) {
              break;
            }

            purchaseData.status = "completed";
            purchaseData.stripeSessionId = session.id;
            purchaseData.paymentDate = new Date();
            await purchaseData.save();

            const userData = await User.findById(userId);
            const courseData = await Course.findById(courseId);

            console.log(`🔍 Debug - userId: ${userId}, type: ${typeof userId}`);
            console.log(
              `🔍 Debug - courseId: ${courseId}, type: ${typeof courseId}`
            );
            console.log(
              `🔍 Debug - userData._id: ${
                userData?._id
              }, type: ${typeof userData?._id}`
            );
            console.log(
              `🔍 Debug - courseData._id: ${
                courseData?._id
              }, type: ${typeof courseData?._id}`
            );

            if (userData && courseData) {
              // Convert courseId to ObjectId for user's enrolledCourses
              const courseObjectId = courseData._id;

              // Check if user is not already enrolled
              const isUserEnrolled = userData.enrolledCourses.some(
                (enrolledCourseId) =>
                  enrolledCourseId.toString() === courseObjectId.toString()
              );

              console.log(`🔍 Debug - isUserEnrolled: ${isUserEnrolled}`);
              console.log(
                `🔍 Debug - current enrolledCourses: ${JSON.stringify(
                  userData.enrolledCourses
                )}`
              );

              // Check if course doesn't already have this student
              const isStudentInCourse = courseData.enrolledStudents.includes(
                userData._id
              );

              console.log(`🔍 Debug - isStudentInCourse: ${isStudentInCourse}`);
              console.log(
                `🔍 Debug - current enrolledStudents: ${JSON.stringify(
                  courseData.enrolledStudents
                )}`
              );

              if (!isUserEnrolled) {
                userData.enrolledCourses.push(courseObjectId);
                await userData.save();
                console.log(
                  `✅ Added course ${courseObjectId} to user ${userData._id} enrolledCourses`
                );

                // Verify the save worked
                const verifyUser = await User.findById(userId);
                console.log(
                  `🔍 Verification - user enrolledCourses after save: ${JSON.stringify(
                    verifyUser.enrolledCourses
                  )}`
                );
              }

              if (!isStudentInCourse) {
                // Ensure we're pushing the correct string type
                const userIdString = String(userData._id);
                courseData.enrolledStudents.push(userIdString);

                console.log(
                  `🔍 Debug - pushing userIdString: ${userIdString}, type: ${typeof userIdString}`
                );
                console.log(
                  `🔍 Debug - enrolledStudents before save: ${JSON.stringify(
                    courseData.enrolledStudents
                  )}`
                );

                // Force mark the field as modified to ensure Mongoose saves it
                courseData.markModified("enrolledStudents");
                await courseData.save();

                console.log(
                  `✅ Added user ${userIdString} to course ${courseObjectId} enrolledStudents`
                );

                // Verify the save worked
                const verifyCourse = await Course.findById(courseId);
                console.log(
                  `🔍 Verification - course enrolledStudents after save: ${JSON.stringify(
                    verifyCourse.enrolledStudents
                  )}`
                );
              }
            }
          }
        } catch (error) {
          console.error("❌ Error processing payment_intent.succeeded:", error);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        try {
          const sessions = await getStripeInstance().checkout.sessions.list({
            payment_intent: paymentIntentId,
          });

          if (sessions.data.length === 0) {
            break;
          }

          const session = sessions.data[0];

          // Check if this is a cart purchase or single course purchase
          const isCartPurchase = session.metadata?.isCartPurchase === "true";

          if (isCartPurchase) {
            // Handle cart purchase failure
            console.log("🛒 Processing cart purchase failure");

            if (!session.metadata?.purchaseIds) {
              console.error("❌ Missing cart purchase metadata for failure");
              break;
            }

            const { purchaseIds } = session.metadata;
            const purchaseIdArray = purchaseIds.split(",");

            // Update all purchase records to failed
            for (const purchaseId of purchaseIdArray) {
              const purchaseData = await Purchase.findById(purchaseId);
              if (purchaseData) {
                purchaseData.status = "failed";
                purchaseData.stripeSessionId = session.id;
                await purchaseData.save();
                console.log(`✅ Updated purchase ${purchaseId} to failed`);
              }
            }
          } else {
            // Handle single course purchase failure (existing logic)
            if (!session.metadata?.purchaseId) {
              break;
            }

            const purchaseId = session.metadata.purchaseId;
            const purchaseData = await Purchase.findById(purchaseId);
            if (!purchaseData) {
              break;
            }

            purchaseData.status = "failed";
            purchaseData.stripeSessionId = session.id;
            await purchaseData.save();
          }
        } catch (error) {
          console.error(
            "❌ Error processing payment_intent.payment_failed:",
            error
          );
        }

        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        try {
          const sessions = await getStripeInstance().checkout.sessions.list({
            payment_intent: paymentIntentId,
          });

          if (sessions.data.length === 0) {
            break;
          }

          const session = sessions.data[0];

          // Check if this is a cart purchase or single course purchase
          const isCartPurchase = session.metadata?.isCartPurchase === "true";

          if (isCartPurchase) {
            // Handle cart purchase cancellation
            console.log("🛒 Processing cart purchase cancellation");

            if (!session.metadata?.purchaseIds) {
              console.error(
                "❌ Missing cart purchase metadata for cancellation"
              );
              break;
            }

            const { purchaseIds } = session.metadata;
            const purchaseIdArray = purchaseIds.split(",");

            // Update all purchase records to canceled
            for (const purchaseId of purchaseIdArray) {
              const purchaseData = await Purchase.findById(purchaseId);
              if (purchaseData) {
                purchaseData.status = "canceled";
                purchaseData.stripeSessionId = session.id;
                await purchaseData.save();
                console.log(`✅ Updated purchase ${purchaseId} to canceled`);
              }
            }
          } else {
            // Handle single course purchase cancellation (existing logic)
            if (!session.metadata?.purchaseId) {
              break;
            }

            const purchaseId = session.metadata.purchaseId;
            const purchaseData = await Purchase.findById(purchaseId);
            if (!purchaseData) {
              break;
            }

            purchaseData.status = "canceled";
            purchaseData.stripeSessionId = session.id;
            await purchaseData.save();
          }
        } catch (error) {
          console.error("❌ Error processing payment_intent.canceled:", error);
        }

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;

        try {
          const sessions = await getStripeInstance().checkout.sessions.list({
            payment_intent: paymentIntentId,
          });

          if (sessions.data.length === 0) {
            break;
          }

          const session = sessions.data[0];

          if (!session.metadata?.purchaseId) {
            break;
          }

          const { purchaseId, userId, courseId } = session.metadata;
          const purchaseData = await Purchase.findById(purchaseId);
          if (!purchaseData) {
            break;
          }

          purchaseData.status = "refunded";
          purchaseData.stripeSessionId = session.id;
          purchaseData.refundDate = new Date();
          await purchaseData.save();

          const userData = await User.findById(userId);
          if (userData && userData.enrolledCourses.includes(courseId)) {
            userData.enrolledCourses = userData.enrolledCourses.filter(
              (enrolledCourseId) =>
                enrolledCourseId.toString() !== courseId.toString()
            );
            await userData.save();
          }
        } catch (error) {
          // silent catch
        }

        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;

        // Check if this is a cart purchase or single course purchase
        const isCartPurchase = session.metadata?.isCartPurchase === "true";

        if (isCartPurchase) {
          // Handle cart purchase session completion
          console.log("🛒 Processing cart purchase session completion");

          if (!session.metadata?.purchaseIds) {
            console.error(
              "❌ Missing cart purchase metadata for session completion"
            );
            break;
          }

          const { purchaseIds } = session.metadata;
          const purchaseIdArray = purchaseIds.split(",");

          // Update all purchase records to processing
          for (const purchaseId of purchaseIdArray) {
            const purchaseData = await Purchase.findById(purchaseId);
            if (purchaseData && purchaseData.status === "pending") {
              purchaseData.status = "processing";
              purchaseData.stripeSessionId = session.id;
              await purchaseData.save();
              console.log(`✅ Updated purchase ${purchaseId} to processing`);
            }
          }
        } else {
          // Handle single course purchase session completion (existing logic)
          if (!session.metadata?.purchaseId) {
            break;
          }

          const purchaseId = session.metadata.purchaseId;
          const purchaseData = await Purchase.findById(purchaseId);
          if (!purchaseData) {
            break;
          }

          if (purchaseData.status === "pending") {
            purchaseData.status = "processing";
            purchaseData.stripeSessionId = session.id;
            await purchaseData.save();
          }
        }

        break;
      }

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};
