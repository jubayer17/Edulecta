import express from "express";
import cors from "cors";
import dotenv from "dotenv";

//Connect to MongoDB
import connectDB from "./configs/mongodb.js";
import { handleClerkWebhook } from "./controllers/webhooks.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware to parse JSON
app.use(cors());

// Clerk webhook endpoint - needs raw body for signature verification
app.post("/clerk", express.raw({ type: "application/json" }), (req, res) => {
  // Convert raw buffer back to object for processing
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

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Initialize database connection
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
