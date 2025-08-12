import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending", // Initial state when purchase is created
        "incomplete", // Stripe session was started but not completed
        "completed", // Payment successful
        "failed", // Payment failed
        "cancelled", // User cancelled the purchase
        "expired", // Stripe session expired
        "refunded", // Payment was refunded
      ],
      default: "pending",
    },
    lastUpdated: { type: Date, default: Date.now }, // Track last status change
    stripeSessionId: { type: String }, // For tracking Stripe checkout session
    paymentDate: { type: Date }, // When payment was actually completed
    refundDate: { type: Date }, // When refund was processed
    purchaseDate: { type: Date, default: Date.now }, // When purchase was initiated
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
