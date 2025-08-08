import Stripe from "stripe";
import connectDB from "../configs/mongodb.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // req.body is a Buffer here because of express.raw()
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
    console.log("✅ Stripe webhook signature verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await connectDB();

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "checkout.session.expired":
        await handleCheckoutSessionExpired(event.data.object);
        break;

      default:
        console.log(`ℹ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

async function handleCheckoutSessionCompleted(session) {
  console.log("🎉 Checkout session completed:", session.id);

  if (!session.metadata) {
    console.error("❌ No metadata in checkout session");
    return;
  }

  const { purchaseId, userId, courseId } = session.metadata;

  if (!purchaseId || !userId || !courseId) {
    console.error("❌ Missing required metadata:", session.metadata);
    return;
  }

  try {
    const purchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      {
        status: "completed",
        stripeSessionId: session.id,
        paymentDate: new Date(),
      },
      { new: true }
    );

    if (!purchase) {
      console.error("❌ Purchase not found:", purchaseId);
      return;
    }

    const user = await User.findById(userId);
    if (user && !user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
      console.log(`✅ User ${userId} enrolled in course ${courseId}`);
    }
  } catch (error) {
    console.error("❌ Error completing purchase:", error);
  }
}

async function handleCheckoutSessionExpired(session) {
  console.log("⏰ Checkout session expired:", session.id);

  if (!session.metadata?.purchaseId) {
    console.error("❌ No purchaseId in expired session");
    return;
  }

  try {
    await Purchase.findByIdAndUpdate(
      session.metadata.purchaseId,
      { status: "expired" },
      { new: true }
    );
    console.log(`✅ Purchase ${session.metadata.purchaseId} marked as expired`);
  } catch (error) {
    console.error("❌ Error updating expired purchase:", error);
  }
}
