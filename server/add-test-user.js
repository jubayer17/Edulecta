import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import User from "./models/User.js";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const addTestUser = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("Connected to MongoDB");

    // Create test user data with proper ObjectIds for enrolledCourses
    const testUser = {
      _id: "test_user_" + Date.now(),
      username: "Mike Johnson",
      email: "mike.johnson@example.com",
      password: "clerk_managed",
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      enrolledCourses: [
        new mongoose.Types.ObjectId(), // Course 1
        new mongoose.Types.ObjectId(), // Course 2
        new mongoose.Types.ObjectId(), // Course 3
      ],
    };

    // Create user in database
    const newUser = await User.create(testUser);
    console.log("✅ User created successfully:", {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      enrolledCourses: newUser.enrolledCourses,
      createdAt: newUser.createdAt,
    });

    // Find and display all users
    const allUsers = await User.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);

    allUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.username} (${user.email}) - ID: ${
          user._id
        } - Courses: ${user.enrolledCourses.length}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

addTestUser();
