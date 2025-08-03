// Entry point for Vercel deployment
import app from "./server.js";
import connectDB from "./configs/mongodb.js";

// Initialize database for Vercel
connectDB();

export default app;
