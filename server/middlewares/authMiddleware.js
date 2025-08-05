import { clerkClient } from "@clerk/express";

// middleware to protect educator routes
export const protectEducator = async (req, res, next) => {
  try {
    // Check if the user is authenticated
    const auth = req.auth();
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Fetch user details from Clerk
    const user = await clerkClient.users.getUser(auth.userId);

    // Check if the user has the educator role
    if (user.publicMetadata.role !== "educator") {
      return res
        .status(403)
        .json({ error: "Forbidden: Educator role required" });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("❌ Error in protectEducator middleware:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
