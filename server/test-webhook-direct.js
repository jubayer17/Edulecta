import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import { handleClerkWebhook } from "./controllers/webhooks.js";

// Load environment variables
dotenv.config();

const testWebhookDirectly = async () => {
  console.log("🧪 Testing webhook handler directly...");

  // Mock request object for user.created event
  const mockReq = {
    query: { test: "1" }, // This will bypass signature verification
    headers: {
      "svix-id": "msg_test_" + Date.now(),
      "svix-timestamp": Math.floor(Date.now() / 1000).toString(),
      "svix-signature": "v1,test_signature",
    },
    body: {
      data: {
        id: "user_test_direct_" + Date.now(),
        username: "directtest",
        first_name: "Direct",
        last_name: "Test",
        email_addresses: [
          {
            email_address: "directtest@example.com",
            id: "email_test_" + Date.now(),
          },
        ],
        image_url: "https://randomuser.me/api/portraits/men/50.jpg",
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      },
      type: "user.created",
    },
  };

  // Mock response object
  const mockRes = {
    status: (code) => {
      mockRes.statusCode = code;
      return mockRes;
    },
    json: (data) => {
      console.log(`📤 Response Status: ${mockRes.statusCode}`);
      console.log(`📄 Response Data:`, data);
      return mockRes;
    },
  };

  try {
    // Test the webhook handler directly
    await handleClerkWebhook(mockReq, mockRes);
    console.log("✅ Direct webhook test completed!");
  } catch (error) {
    console.error("❌ Direct webhook test failed:", error);
  }
};

testWebhookDirectly();
