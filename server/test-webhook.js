import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const testWebhook = async () => {
  const webhookUrl =
    "https://server-qe1gid3gp-jubayer-ahmeds-projects-62133443.vercel.app/clerk";

  console.log("🧪 Testing webhook endpoint...");
  console.log("📡 URL:", webhookUrl);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-id": "msg_test_" + Date.now(),
        "svix-timestamp": Math.floor(Date.now() / 1000).toString(),
        "svix-signature": "v1,test_signature",
      },
      body: JSON.stringify({
        data: {
          id: "test_user_" + Date.now(),
          username: "testuser",
          email_addresses: [{ email_address: "test@example.com" }],
        },
        type: "user.created",
      }),
    });

    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testWebhook();
