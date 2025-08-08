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
      enum: ["pending", "completed", "failed", "expired"],
      default: "pending",
    },
    stripeSessionId: { type: String }, // For tracking Stripe checkout session
    paymentDate: { type: Date }, // When payment was actually completed
    purchaseDate: { type: Date, default: Date.now }, // When purchase was initiated
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
