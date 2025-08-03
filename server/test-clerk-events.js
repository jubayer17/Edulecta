import dotenv from "dotenv";
import { Webhook } from "svix";

// Load environment variables
dotenv.config();

const testClerkEvents = async () => {
  const webhookUrl =
    "https://server-qe1gid3gp-jubayer-ahmeds-projects-62133443.vercel.app/clerk";
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ CLERK_WEBHOOK_SECRET not found");
    return;
  }

  console.log("🧪 Testing Clerk webhook events...");
  console.log("📡 Webhook URL:", webhookUrl);

  // Test 1: User Created Event
  const userCreatedPayload = {
    data: {
      id: "user_test_" + Date.now(),
      username: "testuser123",
      first_name: "Test",
      last_name: "User",
      email_addresses: [
        {
          email_address: "testuser@example.com",
          id: "email_test_" + Date.now(),
        },
      ],
      image_url: "https://randomuser.me/api/portraits/men/45.jpg",
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
    },
    type: "user.created",
  };

  // Test 2: User Updated Event
  const userUpdatedPayload = {
    data: {
      id: "user_test_" + Date.now(),
      username: "updateduser123",
      first_name: "Updated",
      last_name: "User",
      email_addresses: [
        {
          email_address: "updateduser@example.com",
          id: "email_test_" + Date.now(),
        },
      ],
      image_url: "https://randomuser.me/api/portraits/women/45.jpg",
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
    },
    type: "user.updated",
  };

  const testEvents = [
    { name: "User Created", payload: userCreatedPayload },
    { name: "User Updated", payload: userUpdatedPayload },
  ];

  for (const event of testEvents) {
    try {
      console.log(`\n🔥 Testing ${event.name}...`);

      // Create webhook signature using svix
      const payload = JSON.stringify(event.payload);
      const timestamp = Math.floor(Date.now() / 1000);
      const msgId = "msg_test_" + Date.now();

      // Create headers manually for testing
      const headers = {
        "Content-Type": "application/json",
        "svix-id": msgId,
        "svix-timestamp": timestamp.toString(),
        "svix-signature": "v1,test_signature_for_testing",
      };

      console.log("📦 Payload:", JSON.stringify(event.payload, null, 2));
      console.log("🔐 Headers:", headers);

      // Send webhook request
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: headers,
        body: payload,
      });

      const responseText = await response.text();

      console.log(`✅ Response Status: ${response.status}`);
      console.log(`📄 Response Body:`, responseText);

      if (response.ok) {
        console.log(`🎉 ${event.name} event processed successfully!`);
      } else {
        console.log(`❌ ${event.name} event failed`);
      }
    } catch (error) {
      console.error(`💥 Error testing ${event.name}:`, error.message);
    }
  }

  console.log("\n🏁 Webhook testing completed!");
};

testClerkEvents();
