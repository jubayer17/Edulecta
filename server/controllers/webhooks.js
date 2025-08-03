import { Webhook } from "svix";
import User from "../models/User.js";

export const handleClerkWebhook = async (req, res) => {
  try {
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
      return res.status(400).json({ error: "Missing Svix signature headers" });
    }

    await whook.verify(req.rawBody, svixHeaders);

    const { data, type } = req.body;
    console.log("Webhook received:", type, data);

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          username:
            data.username || (data.first_name + " " + data.last_name).trim(),
          email: data.email_addresses?.[0]?.email_address,
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
        console.log("User created in database:", userData._id);
        return res.status(200).json({ message: "User created successfully" });
      }
      case "user.updated": {
        const updateData = {
          username:
            data.username || (data.first_name + " " + data.last_name).trim(),
          email: data.email_addresses?.[0]?.email_address,
          imageUrl:
            data.image_url ||
            data.profile_image_url ||
            "https://via.placeholder.com/150",
          timestamp: new Date(),
        };
        await User.findByIdAndUpdate(data.id, updateData, { new: true });
        console.log("User updated in database:", data.id);
        return res.status(200).json({ message: "User updated successfully" });
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log("User deleted from database:", data.id);
        return res.status(200).json({ message: "User deleted successfully" });
      }
      default:
        console.log(`Unhandled event type received: ${type}`);
        return res
          .status(200)
          .json({ message: `Ignored unhandled event type: ${type}` });
    }
  } catch (error) {
    console.error("Error handling Clerk webhook:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
