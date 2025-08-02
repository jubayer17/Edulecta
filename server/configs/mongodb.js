import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Set up event listeners before connecting
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/edulecta`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
// server/configs/mongodb.js
// This file establishes a connection to the MongoDB database using Mongoose.
