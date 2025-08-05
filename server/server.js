import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./configs/mongodb.js";
import { handleClerkWebhook } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoute.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server directory
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(clerkMiddleware());

await connectDB();
await connectCloudinary();

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  console.log(
    "🔍 Headers:",
    req.headers.authorization ? "Auth header present" : "No auth header"
  );
  next();
});

// Parse raw body for webhook signature verification
app.use("/clerk", express.raw({ type: "application/json" }));

// Use express.json() for all other routes
app.use(express.json());

// Clerk webhook endpoint
app.post("/clerk", (req, res) => {
  try {
    // Convert buffer to string for signature verification
    req.rawBody = req.body.toString("utf8");

    // Parse JSON for webhook handler
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

app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

// Test endpoint to check auth without requiring it
app.get("/test-auth", (req, res) => {
  res.json({
    message: "Auth test endpoint",
    auth: req.auth || null,
    headers: {
      authorization: req.headers.authorization || "Not provided",
      cookie: req.headers.cookie || "Not provided",
    },
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
