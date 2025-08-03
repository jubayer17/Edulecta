import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import { handleClerkWebhook } from "./controllers/webhooks.js";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

const testClerkWebhook = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("Connected to MongoDB");

    // Simulate Clerk webhook request
    const mockClerkWebhookData = {
      type: "user.created",
      data: {
        id: "user_clerk_" + Date.now(),
        username: "clerkuser",
        first_name: "Clerk",
        last_name: "User",
        email_addresses: [
          {
            email_address: "clerk.user@example.com",
          },
        ],
        image_url: "https://img.clerk.com/preview.png",
        profile_image_url: "https://img.clerk.com/preview.png",
        created_at: new Date().toISOString(),
      },
    };

    // Mock request and response objects
    const mockReq = {
      body: mockClerkWebhookData,
      headers: {
        "svix-id": "msg_test123",
        "svix-timestamp": Math.floor(Date.now() / 1000).toString(),
        "svix-signature": "test_signature",
      },
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`Response Status: ${code}`);
          console.log("Response Data:", data);
          return data;
        },
      }),
      json: (data) => {
        console.log("Response:", data);
        return data;
      },
    };

    console.log("\n🔗 Testing Clerk webhook handler...");
    console.log("Webhook data:", JSON.stringify(mockClerkWebhookData, null, 2));

    // Test webhook handler (this will fail signature verification but we can see the parsing)
    try {
      await handleClerkWebhook(mockReq, mockRes);
    } catch (error) {
      console.log(
        "⚠️  Expected error (signature verification):",
        error.message
      );

      // Let's manually create the user to test the database logic
      console.log("\n📝 Manually creating user to test database logic...");

      const userData = {
        _id: mockClerkWebhookData.data.id,
        username:
          mockClerkWebhookData.data.username ||
          (
            mockClerkWebhookData.data.first_name +
            " " +
            mockClerkWebhookData.data.last_name
          ).trim(),
        email: mockClerkWebhookData.data.email_addresses?.[0]?.email_address,
        password: "clerk_managed",
        imageUrl:
          mockClerkWebhookData.data.image_url ||
          mockClerkWebhookData.data.profile_image_url ||
          "https://via.placeholder.com/150",
        enrolledCourses: [],
        createdAt: new Date(mockClerkWebhookData.data.created_at) || new Date(),
        timestamp: new Date(),
      };

      const newUser = await User.create(userData);
      console.log("✅ User created successfully:", {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        imageUrl: newUser.imageUrl,
        createdAt: newUser.createdAt,
      });
    }

    // Display all users
    console.log("\n📊 All users in database:");
    const allUsers = await User.find({});
    allUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.username} (${user.email}) - ID: ${user._id}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testClerkWebhook();
