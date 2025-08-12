import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
  try {
    if (
      !process.env.CLOUDINARY_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_SECRET_KEY
    ) {
      throw new Error("Missing Cloudinary environment variables");
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY,
    });

    // Test the configuration
    const testResult = await cloudinary.api.ping();
    console.log("✅ Cloudinary Connected:", testResult);
  } catch (error) {
    console.error("❌ Cloudinary Configuration Error:", error);
    throw error;
  }
};

export { cloudinary };
export default connectCloudinary;
