import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

// Simplified webhook handler without signature verification for testing
const testWebhookLogic = async (webhookData) => {
  const { data, type } = webhookData;
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
        createdAt: new Date(data.created_at) || new Date(),
        timestamp: new Date(),
      };

      const newUser = await User.create(userData);
      console.log("✅ User created in database:", userData._id);
      return { message: "User created successfully", user: newUser };
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

      const updatedUser = await User.findByIdAndUpdate(data.id, updateData, {
        new: true,
      });
      console.log("✅ User updated in database:", data.id);
      return { message: "User updated successfully", user: updatedUser };
    }
    case "user.deleted": {
      await User.findByIdAndDelete(data.id);
      console.log("✅ User deleted from database:", data.id);
      return { message: "User deleted successfully" };
    }
    default:
      throw new Error("Unhandled event type: " + type);
  }
};

const testAllWebhookEvents = async () => {
  try {
    await connectDB();
    console.log("🔗 Connected to MongoDB\n");

    // Test user.created
    console.log("1️⃣ Testing user.created event:");
    const createData = {
      type: "user.created",
      data: {
        id: "clerk_test_create_" + Date.now(),
        username: "testcreate",
        first_name: "Test",
        last_name: "Create",
        email_addresses: [{ email_address: "test.create@clerk.com" }],
        image_url: "https://img.clerk.com/create.jpg",
        created_at: new Date().toISOString(),
      },
    };

    const createResult = await testWebhookLogic(createData);
    console.log("Result:", createResult.message);

    // Test user.updated
    console.log("\n2️⃣ Testing user.updated event:");
    const updateData = {
      type: "user.updated",
      data: {
        id: createData.data.id, // Update the same user
        username: "testupdated",
        first_name: "Test",
        last_name: "Updated",
        email_addresses: [{ email_address: "test.updated@clerk.com" }],
        image_url: "https://img.clerk.com/updated.jpg",
      },
    };

    const updateResult = await testWebhookLogic(updateData);
    console.log("Result:", updateResult.message);

    // Test user.deleted
    console.log("\n3️⃣ Testing user.deleted event:");
    const deleteData = {
      type: "user.deleted",
      data: {
        id: createData.data.id,
      },
    };

    const deleteResult = await testWebhookLogic(deleteData);
    console.log("Result:", deleteResult.message);

    // Show final user count
    console.log("\n📊 Final user count:");
    const allUsers = await User.find({});
    console.log(`Total users: ${allUsers.length}`);
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

testAllWebhookEvents();
