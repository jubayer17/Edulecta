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
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    // paymentMethod: { type: String, required: true },s
    purchaseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
