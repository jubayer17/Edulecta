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

          // Enhanced user data extraction with proper Google OAuth handling
          const userData = {
            _id: data.id,
            username: (() => {
              // Priority order for username extraction
              // 1. Try explicit username field
              if (
                data.username &&
                data.username !== "null" &&
                data.username.trim() !== ""
              ) {
                return data.username.trim();
              }

              // 2. Try full name from first_name + last_name
              const firstName =
                data.first_name && data.first_name !== "null"
                  ? data.first_name.trim()
                  : "";
              const lastName =
                data.last_name && data.last_name !== "null"
                  ? data.last_name.trim()
                  : "";
              const fullName = `${firstName} ${lastName}`.trim();

              if (fullName && fullName !== "") {
                return fullName;
              }

              // 3. Try external_accounts for Google data
              if (
                data.external_accounts &&
                Array.isArray(data.external_accounts)
              ) {
                for (const account of data.external_accounts) {
                  if (
                    account.provider === "oauth_google" &&
                    account.first_name
                  ) {
                    const googleFirstName = account.first_name || "";
                    const googleLastName = account.last_name || "";
                    const googleFullName =
                      `${googleFirstName} ${googleLastName}`.trim();
                    if (googleFullName) return googleFullName;
                  }
                }
              }

              // 4. Try primary email address name part
              const primaryEmail =
                data.email_addresses?.find(
                  (e) => e.id === data.primary_email_address_id
                )?.email_address ||
                data.email_addresses?.[0]?.email_address ||
                "";

              if (primaryEmail) {
                const emailUsername = primaryEmail.split("@")[0];
                // Clean up email username (remove dots, numbers, make readable)
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

              // 5. Final fallback
              return `User ${data.id.slice(-6)}`;
            })(),

            email: (() => {
              // Get primary email or first available email
              const primaryEmail = data.email_addresses?.find(
                (e) => e.id === data.primary_email_address_id
              )?.email_address;
              if (primaryEmail) return primaryEmail;

              // Fallback to first email
              const firstEmail = data.email_addresses?.[0]?.email_address;
              if (firstEmail) return firstEmail;

              // Extract from external accounts if available
              if (
                data.external_accounts &&
                Array.isArray(data.external_accounts)
              ) {
                for (const account of data.external_accounts) {
                  if (
                    account.provider === "oauth_google" &&
                    account.email_address
                  ) {
                    return account.email_address;
                  }
                }
              }

              return `${data.id}@edulecta.local`; // Fallback email
            })(),

            password: "clerk_managed",

            imageUrl: (() => {
              // Priority order for profile image
              if (data.image_url && data.image_url !== "")
                return data.image_url;
              if (data.profile_image_url && data.profile_image_url !== "")
                return data.profile_image_url;

              // Check external accounts for Google profile image
              if (
                data.external_accounts &&
                Array.isArray(data.external_accounts)
              ) {
                for (const account of data.external_accounts) {
                  if (account.provider === "oauth_google" && account.picture) {
                    return account.picture;
                  }
                }
              }

              return "https://via.placeholder.com/150?text=User";
            })(),

            enrolledCourses: [],
            isEducator: false, // Initialize as false
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
            timestamp: new Date(),
          };

          console.log(
            "📝 Creating user with enhanced data:",
            JSON.stringify(userData, null, 2)
          );
          await User.create(userData);
          console.log("✅ User created successfully:", userData._id);
          console.log("📧 Email:", userData.email);
          console.log("👤 Username:", userData.username);

          return res.status(200).json({
            message: "User created successfully",
            user: {
              id: userData._id,
              username: userData.username,
              email: userData.email,
            },
          });
        } catch (err) {
          console.error("❌ Detailed create error:", {
            message: err.message,
            code: err.code,
            name: err.name,
            stack: err.stack,
          });

          // Handle duplicate key error
          if (err.code === 11000) {
            console.log("🔄 Duplicate key error, user might already exist");
            // Try to fetch existing user and return success
            try {
              const existingUser = await User.findById(data.id);
              if (existingUser) {
                return res.status(200).json({
                  message: "User already exists",
                  user: {
                    id: existingUser._id,
                    username: existingUser.username,
                    email: existingUser.email,
                  },
                });
              }
            } catch (fetchError) {
              console.error("Error fetching existing user:", fetchError);
            }

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
          console.log("🔄 Updating user:", data.id);
          console.log(
            "🔍 Update data received:",
            JSON.stringify(data, null, 2)
          );

          const updateData = {
            username: (() => {
              // Enhanced username extraction for updates
              if (
                data.username &&
                data.username !== "null" &&
                data.username.trim() !== ""
              ) {
                return data.username.trim();
              }

              const firstName =
                data.first_name && data.first_name !== "null"
                  ? data.first_name.trim()
                  : "";
              const lastName =
                data.last_name && data.last_name !== "null"
                  ? data.last_name.trim()
                  : "";
              const fullName = `${firstName} ${lastName}`.trim();

              if (fullName && fullName !== "") {
                return fullName;
              }

              // Try external_accounts for Google data
              if (
                data.external_accounts &&
                Array.isArray(data.external_accounts)
              ) {
                for (const account of data.external_accounts) {
                  if (
                    account.provider === "oauth_google" &&
                    account.first_name
                  ) {
                    const googleFirstName = account.first_name || "";
                    const googleLastName = account.last_name || "";
                    const googleFullName =
                      `${googleFirstName} ${googleLastName}`.trim();
                    if (googleFullName) return googleFullName;
                  }
                }
              }

              // Fallback to email prefix if no name available
              const primaryEmail =
                data.email_addresses?.find(
                  (e) => e.id === data.primary_email_address_id
                )?.email_address ||
                data.email_addresses?.[0]?.email_address ||
                "";
              if (primaryEmail) {
                const emailUsername = primaryEmail.split("@")[0];
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

              return `User ${data.id.slice(-6)}`;
            })(),

            email: (() => {
              const primaryEmail = data.email_addresses?.find(
                (e) => e.id === data.primary_email_address_id
              )?.email_address;
              if (primaryEmail) return primaryEmail;

              const firstEmail = data.email_addresses?.[0]?.email_address;
              if (firstEmail) return firstEmail;

              // Extract from external accounts if available
              if (
                data.external_accounts &&
                Array.isArray(data.external_accounts)
              ) {
                for (const account of data.external_accounts) {
                  if (
                    account.provider === "oauth_google" &&
                    account.email_address
                  ) {
                    return account.email_address;
                  }
                }
              }

              return null; // Don't update if no email found
            })(),

            imageUrl: (() => {
              if (data.image_url && data.image_url !== "")
                return data.image_url;
              if (data.profile_image_url && data.profile_image_url !== "")
                return data.profile_image_url;

              // Check external accounts for Google profile image
              if (
                data.external_accounts &&
                Array.isArray(data.external_accounts)
              ) {
                for (const account of data.external_accounts) {
                  if (account.provider === "oauth_google" && account.picture) {
                    return account.picture;
                  }
                }
              }

              return null; // Don't update if no image found
            })(),

            timestamp: new Date(),
          };

          // Remove null values from update data
          Object.keys(updateData).forEach((key) => {
            if (updateData[key] === null || updateData[key] === undefined) {
              delete updateData[key];
            }
          });

          console.log(
            "📝 Updating user with data:",
            JSON.stringify(updateData, null, 2)
          );

          const updatedUser = await User.findByIdAndUpdate(
            data.id,
            updateData,
            {
              new: true,
              runValidators: true,
            }
          );

          if (updatedUser) {
            console.log("✅ User updated successfully:", data.id);
            console.log("📧 Updated Email:", updatedUser.email);
            console.log("👤 Updated Username:", updatedUser.username);
          } else {
            console.warn("⚠️ User not found for update:", data.id);
          }

          return res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
              ? {
                  id: updatedUser._id,
                  username: updatedUser.username,
                  email: updatedUser.email,
                }
              : null,
          });
        } catch (err) {
          console.error("❌ Failed to update user:", {
            message: err.message,
            code: err.code,
            userId: data.id,
            stack: err.stack,
          });
          return res.status(500).json({
            error: "Database update error",
            details: err.message,
          });
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
