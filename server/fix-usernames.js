import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

const fixUsernames = async () => {
  try {
    await connectDB();
    console.log("🔗 Connected to database");

    // Find users with "null null" username
    const usersToFix = await User.find({
      username: { $regex: /null\s+null|null/ },
    });

    console.log(
      `📋 Found ${usersToFix.length} users with null usernames:`,
      usersToFix.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
      }))
    );

    for (const user of usersToFix) {
      let newUsername;

      // Try to create a username from email
      if (user.email) {
        newUsername = user.email.split("@")[0];
      } else {
        newUsername = `User_${user._id.slice(-6)}`;
      }

      console.log(
        `🔄 Updating user ${user._id}: "${user.username}" → "${newUsername}"`
      );

      await User.findByIdAndUpdate(user._id, {
        username: newUsername,
      });
    }

    console.log("✅ All usernames fixed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing usernames:", error);
    process.exit(1);
  }
};

fixUsernames();
