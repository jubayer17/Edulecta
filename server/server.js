import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./configs/mongodb.js";
import { rawBodyMiddleware } from "./middlewares/rawBodyMiddleware.js";
import { handleClerkWebhook } from "./controllers/webhooks.js";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server directory
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Use rawBodyMiddleware before any JSON parsing and before webhook route
app.use(rawBodyMiddleware);

// Use express.json() for all other routes
app.use(express.json());

// Clerk webhook endpoint
app.post("/clerk", (req, res) => {
  try {
    // req.rawBody set by rawBodyMiddleware
    if (!req.rawBody) throw new Error("Missing raw body");

    req.body = JSON.parse(req.rawBody);
    return handleClerkWebhook(req, res);
  } catch (error) {
    console.error("Error parsing webhook body:", error);
    return res.status(400).json({ error: "Invalid JSON" });
  }
});

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

const initializeApp = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

if (process.env.NODE_ENV !== "production") {
  initializeApp().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `Webhook endpoint available at: http://localhost:${PORT}/clerk`
      );
    });
  });
} else {
  initializeApp();
}

export default app;
