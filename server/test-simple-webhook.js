import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const testClerkEventsSimple = async () => {
  const webhookUrl =
    "https://server-qe1gid3gp-jubayer-ahmeds-projects-62133443.vercel.app/clerk?test=1";

  console.log("🧪 Testing Clerk webhook endpoint...");
  console.log("📡 Webhook URL:", webhookUrl);

  try {
    // Test the endpoint with test parameter to bypass signature verification
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test: "test endpoint" }),
    });

    const responseText = await response.text();

    console.log(`✅ Response Status: ${response.status}`);
    console.log(`📄 Response Body:`, responseText);

    if (response.ok) {
      console.log(`🎉 Webhook endpoint is working!`);
    } else {
      console.log(`❌ Webhook endpoint failed`);
    }
  } catch (error) {
    console.error(`💥 Error testing webhook:`, error.message);
  }

  console.log("\n🏁 Basic webhook test completed!");

  // Now let's test with a real user creation simulation
  console.log("\n🔥 Testing User Created event simulation...");

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

  try {
    // Send without signature for testing (will fail signature verification but we can see logs)
    const response = await fetch(
      "https://server-qe1gid3gp-jubayer-ahmeds-projects-62133443.vercel.app/clerk",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "svix-id": "msg_test_" + Date.now(),
          "svix-timestamp": Math.floor(Date.now() / 1000).toString(),
          "svix-signature": "v1,test_signature_will_fail_but_shows_logs",
        },
        body: JSON.stringify(userCreatedPayload),
      }
    );

    const responseText = await response.text();

    console.log(`✅ Response Status: ${response.status}`);
    console.log(`📄 Response Body:`, responseText);
  } catch (error) {
    console.error(`💥 Error testing user creation:`, error.message);
  }
};

testClerkEventsSimple();
