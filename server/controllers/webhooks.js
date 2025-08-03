import { Webhook } from "svix";
import User from "../models/User.js";
import connectDB from "../configs/mongodb.js";

export const handleClerkWebhook = async (req, res) => {
  try {
    console.log("🎯 Webhook received - Environment check:");
    console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log(
      "- CLERK_WEBHOOK_SECRET exists:",
      !!process.env.CLERK_WEBHOOK_SECRET
    );
    console.log("- Headers received:", req.headers);

    if (req.query?.test === "1") {
      console.log("✅ Clerk webhook test endpoint hit");
      return res.status(200).json({ message: "Clerk webhook test successful" });
    }

    console.log("🔗 Connecting to database...");
    await connectDB();
    console.log("✅ Database connection successful");

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const svixHeaders = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    if (
      !svixHeaders["svix-id"] ||
      !svixHeaders["svix-timestamp"] ||
      !svixHeaders["svix-signature"]
    ) {
      console.warn("⚠️ Missing Svix headers:", svixHeaders);
      return res.status(400).json({ error: "Missing Svix signature headers" });
    }

    // Debug rawBody presence
    if (!req.rawBody) {
      console.warn(
        "⚠️ req.rawBody is undefined. Check raw body middleware setup."
      );
      return res
        .status(400)
        .json({ error: "Missing raw body for verification" });
    }

    console.log("🔐 Verifying webhook signature...");
    let evt;
    try {
      evt = whook.verify(req.rawBody, svixHeaders);
      console.log("✅ Webhook verified successfully");
    } catch (err) {
      console.error("❌ Signature verification failed:", err.message);
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const { data, type } = evt;
    console.log("📩 Webhook received:", type);
    console.log("📦 Data payload:", data);

    switch (type) {
      case "user.created": {
        try {
          const userData = {
            _id: data.id,
            username:
              data.username || `${data.first_name} ${data.last_name}`.trim(),
            email: data.email_addresses?.[0]?.email_address || "",
            password: "clerk_managed",
            imageUrl:
              data.image_url ||
              data.profile_image_url ||
              "https://via.placeholder.com/150",
            enrolledCourses: [],
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
            timestamp: new Date(),
          };
          await User.create(userData);
          console.log("✅ User created:", userData._id);
          return res.status(200).json({ message: "User created successfully" });
        } catch (err) {
          console.error("❌ Failed to create user:", err.message);
          return res.status(500).json({ error: "Database create error" });
        }
      }

      case "user.updated": {
        try {
          const updateData = {
            username:
              data.username || `${data.first_name} ${data.last_name}`.trim(),
            email: data.email_addresses?.[0]?.email_address || "",
            imageUrl:
              data.image_url ||
              data.profile_image_url ||
              "https://via.placeholder.com/150",
            timestamp: new Date(),
          };
          await User.findByIdAndUpdate(data.id, updateData, { new: true });
          console.log("✅ User updated:", data.id);
          return res.status(200).json({ message: "User updated successfully" });
        } catch (err) {
          console.error("❌ Failed to update user:", err.message);
          return res.status(500).json({ error: "Database update error" });
        }
      }

      case "user.deleted": {
        try {
          await User.findByIdAndDelete(data.id);
          console.log("✅ User deleted:", data.id);
          return res.status(200).json({ message: "User deleted successfully" });
        } catch (err) {
          console.error("❌ Failed to delete user:", err.message);
          return res.status(500).json({ error: "Database delete error" });
        }
      }

      default:
        console.log(`⚠️ Unhandled event type: ${type}`);
        return res
          .status(200)
          .json({ message: `Unhandled event type: ${type}` });
    }
  } catch (error) {
    console.error("🔥 Global error in Clerk webhook:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
