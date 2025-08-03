import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import { handleClerkWebhook } from "./controllers/webhooks.js";

dotenv.config();

const app = express();
app.use(cors());

// Clerk webhook route - uses raw body parser
app.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      req.body = JSON.parse(req.body.toString("utf8"));
      return handleClerkWebhook(req, res);
    } catch (error) {
      console.error("Error parsing webhook body:", error);
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
);

// JSON parser for all other routes
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/clerk", (req, res) => {
  res.json({
    message: "Clerk webhook endpoint is ready",
    method: "GET not supported, use POST",
  });
});

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

// MongoDB connection
await connectDB();

export default app;
