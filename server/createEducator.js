import dotenv from "dotenv";
dotenv.config(); // Load .env variables

import mongoose from "mongoose";
import connectDB from "./configs/mongodb.js";
import { createEducatorFromUser } from "./utils/createEducatorFromUser.js";

async function run() {
  try {
    await connectDB(); // Uses process.env.MONGODB_URI
    console.log("MongoDB connection established.");

    const userId = "user_30mKTSUbNc8ZnECNgCHweJ5pOpd"; // Replace with actual educator user ID
    const educator = await createEducatorFromUser(userId);

    console.log("Educator created:", educator);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

run();
