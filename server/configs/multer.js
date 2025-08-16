import multer from "multer";

// Configure memory storage
const storage = multer.memoryStorage();

// Configure file filter
const fileFilter = (req, file, cb) => {
  console.log("📁 Processing file:", file.originalname);
  console.log("📁 File mimetype:", file.mimetype);

  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    console.log("❌ File rejected: Invalid extension");
    return cb(
      new Error("Only image files are allowed (jpg, jpeg, png, gif, webp)"),
      false
    );
  }

  // Check mimetype as well
  if (!file.mimetype.startsWith("image/")) {
    console.log("❌ File rejected: Invalid mimetype");
    return cb(new Error("Only image files are allowed"), false);
  }

  console.log("✅ File accepted");
  cb(null, true);
};

// Create multer instance with configuration (5 MB limit)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size (changed from 10MB)
    files: 1, // Allow only 1 file
  },
});

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error("Multer Error:", err);
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "File is too large. Maximum size is 5MB",
        });
      }
      return res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`,
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next();
};

export default upload;
