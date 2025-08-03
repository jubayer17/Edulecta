import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import { handleClerkWebhook } from "./controllers/webhooks.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Clerk webhook endpoint - needs raw body for signature verification
app.post("/clerk", express.raw({ type: "application/json" }), (req, res) => {
  try {
    const body = JSON.parse(req.body.toString());
    req.body = body;
    return handleClerkWebhook(req, res);
  } catch (error) {
    console.error("Error parsing webhook body:", error);
    return res.status(400).json({ error: "Invalid JSON" });
  }
});

// General JSON middleware for other routes
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Test webhook route to verify it's accessible
app.get("/clerk", (req, res) => {
  res.json({ message: "Clerk webhook endpoint is ready", method: "GET not supported, use POST" });
});

// Test route to manually create a user
app.post("/test-user", async (req, res) => {
  try {
    const User = (await import("./models/User.js")).default;
    const testUser = {
      _id: "test_user_" + Date.now(),
      username: "Test User",
      email: "test@example.com",
      password: "clerk_managed",
      imageUrl: "https://via.placeholder.com/150",
      enrolledCourses: [],
    };
    
    const createdUser = await User.create(testUser);
    res.json({ message: "Test user created successfully", user: createdUser });
  } catch (error) {
    console.error("Error creating test user:", error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize database connection
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Webhook endpoint available at: http://localhost:${PORT}/clerk`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  startServer();
}

// Export for Vercel
export default app;
