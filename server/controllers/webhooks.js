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
          console.log("🔍 Raw Clerk user data:", JSON.stringify(data, null, 2));

          // Check if user already exists
          const existingUser = await User.findById(data.id);
          if (existingUser) {
            console.log("⚠️ User already exists, skipping creation:", data.id);
            return res.status(200).json({ message: "User already exists" });
          }

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

          console.log(
            "📝 Creating user with data:",
            JSON.stringify(userData, null, 2)
          );
          await User.create(userData);
          console.log("✅ User created:", userData._id);
          return res.status(200).json({ message: "User created successfully" });
        } catch (err) {
          console.error("❌ Detailed create error:", {
            message: err.message,
            code: err.code,
            name: err.name,
          });

          // Handle duplicate key error
          if (err.code === 11000) {
            console.log("🔄 Duplicate key error, user might already exist");
            return res
              .status(200)
              .json({ message: "User already exists (duplicate key)" });
          }

          return res.status(500).json({
            error: "Database create error",
            details: err.message,
          });
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
          console.log("🗑️ Attempting to delete user:", data.id);

          // Check if user exists before deletion
          const existingUser = await User.findById(data.id);
          if (!existingUser) {
            console.log(
              "⚠️ User not found in database, already deleted or never existed:",
              data.id
            );
            return res
              .status(200)
              .json({ message: "User not found (already deleted)" });
          }

          // Delete the user
          const deletedUser = await User.findByIdAndDelete(data.id);

          if (deletedUser) {
            console.log("✅ User successfully deleted from MongoDB:", data.id);
            console.log("📊 Deleted user details:", {
              id: deletedUser._id,
              username: deletedUser.username,
              email: deletedUser.email,
            });
          } else {
            console.log(
              "⚠️ User deletion returned null, might not have existed:",
              data.id
            );
          }

          return res.status(200).json({ message: "User deleted successfully" });
        } catch (err) {
          console.error("❌ Failed to delete user:", {
            message: err.message,
            code: err.code,
            userId: data.id,
          });
          return res.status(500).json({
            error: "Database delete error",
            details: err.message,
          });
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
