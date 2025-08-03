import fetch from 'node-fetch';

const testWebhook = async () => {
  const webhookData = {
    type: "user.created",
    data: {
      id: "test_user_123",
      username: "testuser",
      first_name: "Test",
      last_name: "User",
      email_addresses: [
        {
          email_address: "test@example.com"
        }
      ],
      image_url: "https://via.placeholder.com/150",
      created_at: new Date().toISOString()
    }
  };

  try {
    const response = await fetch('http://localhost:3000/clerk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
  } catch (error) {
    console.error('Error testing webhook:', error);
  }
};

testWebhook();
