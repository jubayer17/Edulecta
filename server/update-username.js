import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

const updateUsername = async () => {
  try {
    await connectDB();
    console.log("🔗 Connected to database");

    // Check all users to see existing usernames
    const allUsers = await User.find({}, "username email");
    console.log("📋 All users:", allUsers);

    // Find the specific user we want to update
    const user = await User.findById("user_30mKTSUbNc8ZnECNgCHweJ5pOpd");

    if (user) {
      console.log(`🔄 Current username: "${user.username}"`);

      // Try "Jubayer Ahmed", if that fails, use "Jubayer Ahmed (Educator)"
      let newUsername = "Jubayer Ahmed";

      try {
        await User.findByIdAndUpdate("user_30mKTSUbNc8ZnECNgCHweJ5pOpd", {
          username: newUsername,
        });
        console.log(`✅ Username updated to "${newUsername}"`);
      } catch (err) {
        if (err.code === 11000) {
          newUsername = "Jubayer Ahmed (Educator)";
          await User.findByIdAndUpdate("user_30mKTSUbNc8ZnECNgCHweJ5pOpd", {
            username: newUsername,
          });
          console.log(
            `✅ Username updated to "${newUsername}" (fallback due to duplicate)`
          );
        } else {
          throw err;
        }
      }
    } else {
      console.log("❌ User not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating username:", error);
    process.exit(1);
  }
};

updateUsername();
