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

  try {
    event = getStripeInstance().webhooks.constructEvent(
      req.body,
      sig,
      getEndpointSecret()
    );
    console.log(`🔔 Stripe webhook received: ${event.type}`);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await connectDB();

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        console.log(`🎉 Payment intent succeeded: ${paymentIntentId}`);

        try {
          const sessions = await getStripeInstance().checkout.sessions.list({
            payment_intent: paymentIntentId,
          });

          if (sessions.data.length === 0) {
            console.error(
              "❌ No checkout session found for payment intent:",
              paymentIntentId
            );
            break;
          }

          const session = sessions.data[0];
          console.log(`🔍 Found session: ${session.id}`);

          if (!session.metadata?.purchaseId) {
            console.error("❌ No purchaseId in session metadata");
            break;
          }

          const { purchaseId, userId, courseId } = session.metadata;
          console.log(
            `🔍 Processing purchase: ${purchaseId} for user: ${userId}, course: ${courseId}`
          );

          const purchaseData = await Purchase.findById(purchaseId);
          if (!purchaseData) {
            console.error("❌ Purchase not found:", purchaseId);
            break;
          }

          // Update purchase status
          purchaseData.status = "completed";
          purchaseData.stripeSessionId = session.id;
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
          } else {
            console.error("❌ User or Course data missing:", {
              userData: !!userData,
              courseData: !!courseData,
            });
          }
        } catch (error) {
          console.error("❌ Error processing payment_intent.succeeded:", error);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        console.log(`💥 Payment intent failed: ${paymentIntentId}`);

        try {
          const sessions = await getStripeInstance().checkout.sessions.list({
            payment_intent: paymentIntentId,
          });

          if (sessions.data.length === 0) {
            console.error(
              "❌ No checkout session found for failed payment intent:",
              paymentIntentId
            );
            break;
          }

          const session = sessions.data[0];
          console.log(`🔍 Found session for failed payment: ${session.id}`);

          if (!session.metadata?.purchaseId) {
            console.error("❌ No purchaseId in session metadata");
            break;
          }

          const purchaseId = session.metadata.purchaseId;
          const purchaseData = await Purchase.findById(purchaseId);
          if (!purchaseData) {
            console.error("❌ Purchase not found:", purchaseId);
            break;
          }

          purchaseData.status = "failed";
          purchaseData.stripeSessionId = session.id;
          await purchaseData.save();

          console.log(`❌ Purchase ${purchaseId} marked as failed`);
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
        console.log(`⚠️ Payment intent canceled: ${paymentIntentId}`);

        try {
          const sessions = await getStripeInstance().checkout.sessions.list({
            payment_intent: paymentIntentId,
          });

          if (sessions.data.length === 0) {
            console.error(
              "❌ No checkout session found for canceled payment intent:",
              paymentIntentId
            );
            break;
          }

          const session = sessions.data[0];
          console.log(`🔍 Found session for canceled payment: ${session.id}`);

          if (!session.metadata?.purchaseId) {
            console.error("❌ No purchaseId in session metadata");
            break;
          }

          const purchaseId = session.metadata.purchaseId;
          const purchaseData = await Purchase.findById(purchaseId);
          if (!purchaseData) {
            console.error("❌ Purchase not found:", purchaseId);
            break;
          }

          purchaseData.status = "canceled";
          purchaseData.stripeSessionId = session.id;
          await purchaseData.save();

          console.log(`⚠️ Purchase ${purchaseId} marked as canceled`);
        } catch (error) {
          console.error("❌ Error processing payment_intent.canceled:", error);
        }

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;
        console.log(
          `↩️ Charge refunded for payment intent: ${paymentIntentId}`
        );

        try {
          const sessions = await getStripeInstance().checkout.sessions.list({
            payment_intent: paymentIntentId,
          });

          if (sessions.data.length === 0) {
            console.error(
              "❌ No checkout session found for refunded charge payment intent:",
              paymentIntentId
            );
            break;
          }

          const session = sessions.data[0];
          console.log(`🔍 Found session for refunded charge: ${session.id}`);

          if (!session.metadata?.purchaseId) {
            console.error("❌ No purchaseId in session metadata");
            break;
          }

          const { purchaseId, userId, courseId } = session.metadata;
          const purchaseData = await Purchase.findById(purchaseId);
          if (!purchaseData) {
            console.error("❌ Purchase not found:", purchaseId);
            break;
          }

          purchaseData.status = "refunded";
          purchaseData.stripeSessionId = session.id;
          purchaseData.refundDate = new Date();
          await purchaseData.save();

          console.log(`↩️ Purchase ${purchaseId} marked as refunded`);

          const userData = await User.findById(userId);
          if (userData && userData.enrolledCourses.includes(courseId)) {
            userData.enrolledCourses = userData.enrolledCourses.filter(
              (enrolledCourseId) =>
                enrolledCourseId.toString() !== courseId.toString()
            );
            await userData.save();
            console.log(
              `🚫 User ${userId} removed from course ${courseId} due to refund`
            );
          }
        } catch (error) {
          console.error("❌ Error processing charge.refunded:", error);
        }

        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;

        if (!session.metadata?.purchaseId) {
          console.error(
            "No purchaseId in session metadata on checkout.session.completed"
          );
          break;
        }

        const purchaseId = session.metadata.purchaseId;
        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          console.error("Purchase not found:", purchaseId);
          break;
        }

        if (purchaseData.status !== "completed") {
          purchaseData.status = "completed";
          purchaseData.stripeSessionId = session.id;
          purchaseData.paymentDate = new Date();
          await purchaseData.save();

          console.log(
            `✅ Purchase ${purchaseId} marked as completed (checkout.session.completed)`
          );

          // Optional: Enroll user here if needed, same as in payment_intent.succeeded
        }

        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
        break;
    }

    console.log(`✅ Webhook ${event.type} processed successfully`);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    console.error("📍 Error stack:", error.stack);
    res.status(500).send("Internal Server Error");
  }
};
