import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./configs/mongodb.js";
import { handleClerkWebhook } from "./controllers/webhooks.js";
import { handleStripeWebhook } from "./controllers/stripeWebhook.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoute.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";
import categoryRouter from "./routes/categoryRoutes.js";

// __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Configure middleware (including CORS, body parsing, and Clerk)
import { configureMiddleware } from "./middlewares/configureMiddleware.js";
configureMiddleware(app);

// Handle Clerk webhook
app.post("/clerk", (req, res) => {
  console.log("🔔 Clerk webhook received");
  try {
    const rawBody = req.body.toString("utf8");
    const parsedBody = JSON.parse(rawBody);
    return handleClerkWebhook({ ...req, rawBody, body: parsedBody }, res);
  } catch (error) {
    console.error("Error parsing webhook body:", error);
    return res.status(400).json({ error: "Invalid JSON" });
  }
});

// Handle Stripe webhook
app.post("/stripe", async (req, res) => {
  try {
    console.log("🔔 Stripe webhook received");
    const contentType = req.headers["content-type"];

    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Invalid content type:", contentType);
      return res.status(400).json({ error: "Invalid content type" });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("❌ Empty webhook body");
      return res.status(400).json({ error: "Empty webhook body" });
    }

    return await handleStripeWebhook(req, res);
  } catch (error) {
    console.error("❌ Error processing Stripe webhook:", error);
    return res.status(500).json({
      error: "Internal server error processing webhook",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Init DB & Cloudinary (lazy for serverless)
let isInitialized = false;
async function initServices() {
  if (!isInitialized) {
    await connectDB();
    await connectCloudinary();
    isInitialized = true;
  }
}

// Debug middleware
app.use(async (req, res, next) => {
  await initServices();
  console.log(`📝 ${req.method} ${req.path}`);
  console.log(
    "🔍 Headers:",
    req.headers.authorization ? "Auth header present" : "No auth header"
  );
  next();
});

// Health check
app.get("/", (req, res) => {
  res.send("Server is running");
});

// GET info endpoints
app.get("/stripe", (req, res) => {
  res.json({
    message: "Stripe webhook endpoint is ready",
    method: "GET not supported for webhooks, use POST",
    endpoint: "POST /stripe",
    status: "active",
  });
});

app.get("/clerk", (req, res) => {
  res.json({
    message: "Clerk webhook endpoint is ready",
    method: "GET not supported, use POST",
  });
});

// API routes
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);

// Test auth
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

// Test user
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

// Local dev server only
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    await initServices();
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook endpoints available at:`);
    console.log(`  - Clerk: http://localhost:${PORT}/clerk`);
    console.log(`  - Stripe: http://localhost:${PORT}/stripe`);
  });
}

export default app;
